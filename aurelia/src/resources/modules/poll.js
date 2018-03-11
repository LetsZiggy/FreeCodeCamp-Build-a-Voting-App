import {inject, bindable, bindingMode, observable} from 'aurelia-framework';
import {Router, Redirect} from 'aurelia-router';
import * as palette from 'google-palette';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';
import {destroyCharts, updateCharts, generateCharts} from '../services/draw-charts';

let initial = true;
let backup = null;
let voteChange = false;
let changeTracker = {
  changeDate: null,
  pollItems: [/* 'name', 'isPublic', 'lastIndex' */],
  editedChoices: [],
  newChoices: [],
  deletedChoices: []
};

@inject(Router, ApiInterface)
export class Poll {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;
  @observable({ changeHandler: 'voteChanged' }) vote = null;

  constructor(Router, ApiInterface) {
    this.router = Router;
    this.api = ApiInterface;
    this.poll = null;
    this.new = false;
    this.charts = { current: [] };
  }

  canActivate(params, routeConfig, navigationInstruction) {
    navigationInstruction.config.navModel.setTitle(params.name);
    this.poll = this.state.polls.findIndex((v, i, a) => v.id === params.id);
    this.new = !!params.new || false;

    if(((!this.state.polls.length || this.state.polls[this.poll] === undefined) && !this.new) || (this.new && !this.state.user.id)) {
      return(new Redirect('polls'));
    }
    else {
      if(!this.new) {
        this.vote = this.state.user.id ? this.state.polls[this.poll].voters[this.state.user.id] : 0;
      }
      else {
        this.state.polls.push({
          id: params.id,
          name: '',
          owner: this.state.user.id,
          created: new Date(),
          edited: new Date(),
          isPublic: false,
          lastIndex: 2,
          choices: [
            {
              id: 1,
              name: '',
              votes: 0,
            },
            {
              id: 2,
              name: '',
              votes: 0,
            },
          ],
          voters: {}
        });

        this.poll = this.state.polls.length - 1;
      }

      backup = JSON.parse(JSON.stringify(this.state.polls[this.poll]));
    }
  }

  attached() {
    if(this.new) {
      this.checkInput();
      document.getElementById('edit-radio').checked = true;
      document.getElementById('delete').style.display = 'none';
    }
    else {
      document.getElementById('vote-radio').checked = true;
    }

    let canvas = [
      ['current', document.getElementById('right-column').getElementsByTagName('canvas')]
    ];

    generateCharts(palette, canvas, this.charts, this.state);

    window.onpopstate = (event) => {
      if(this.new) {
        this.state.polls.pop();
      }
    };
  }

  detached() {
    backup = null;
    initial = true;
    voteChange = false;
    changeTracker = {
      changeDate: null,
      pollItems: [],
      editedChoices: [],
      newChoices: [],
      deletedChoices: []
    };
    this.poll = null;
    this.new = false;

    destroyCharts(this.charts);
    this.charts = null;
  }

  voteChanged(newValue, oldValue) {
    if(initial === true) {
      initial = false;
    }
    else {
      if(this.state.user.id) {
        let oldChoice = this.state.polls[this.poll].voters[this.state.user.id] || null;

        if(oldChoice) {
          oldChoice = this.state.polls[this.poll].choices.findIndex((v, i, a) => v.id === oldChoice);
          if(oldChoice !== -1) {
            this.state.polls[this.poll].choices[oldChoice].votes--;
          }
        }

        this.state.polls[this.poll].voters[this.state.user.id] = newValue;
      }
      let newChoice = this.state.polls[this.poll].choices.findIndex((v, i, a) => v.id === newValue);
      this.state.polls[this.poll].choices[newChoice].votes++;

      updateCharts(this.charts.current[0], this.state.polls[this.poll].choices);
      voteChange = true;
    }

    if(voteChange) {
      // update votes with api-interface
    }
  }

  addremove(index) {
    changeTracker.changeDate = new Date();

    if(index !== null) {
      let deleted = this.state.polls[this.poll].choices.splice(index, 1);
      if(changeTracker.newChoices.indexOf(deleted[0].id) === -1) {
        changeTracker.deletedChoices.push(deleted[0].id);
      }
      else {
        let index = changeTracker.newChoices.indexOf(deleted[0].id);
        changeTracker.newChoices.splice(index, 1);
      }
    }
    else {
      this.state.polls[this.poll].lastIndex++;
      this.state.polls[this.poll].choices.push({
        id: this.state.polls[this.poll].lastIndex,
        name: '',
        votes: 0,
      });

      changeTracker.newChoices.push(this.state.polls[this.poll].lastIndex);

      setTimeout(() => {
        this.checkInput();
      }, 200);
    }
  }

  async donecancel(type) {
    if(type === 'cancel') {
      if(this.new) {
        this.state.polls.pop();
        this.router.navigate('user');
      }
      else {
        while(this.state.polls[this.poll].choices.length) { this.state.polls[this.poll].choices.pop(); }
        backup.choices.forEach((v, i, a) => this.state.polls[this.poll].choices.push(v));
        this.state.polls[this.poll].name = backup.name;
        this.state.polls[this.poll].isPublic = backup.isPublic;
        this.state.polls[this.poll].lastIndex = backup.lastIndex;
        document.getElementById('vote-radio').checked = true;
      }
    }
    else {
      let hasChanges = false;
      let canvas = [
        ['current', document.getElementById('right-column').getElementsByTagName('canvas')]
      ];

      destroyCharts(this.charts);
      this.charts.current = [];
      generateCharts(palette, canvas, this.charts, this.state);

      this.state.polls[this.poll].edited = new Date();

      if(this.new) {
        initial = false;
        this.new = false;
        document.getElementById('delete').style.display = 'inline';
        let created = await this.api.createPoll(this.state.polls[this.poll]);
        console.log('poll created: ', created);
      }
      else {
        Object.entries(backup).forEach((v, i, a) => {
          if(['name', 'isPublic', 'lastIndex'].indexOf(v[0]) !== -1) {
            if(backup[v[0]] !== this.state.polls[this.poll][v[0]]) {
              changeTracker.pollItems.push(v[0]);
              changeTracker.changeDate = new Date();
            }
          }
          else if(v[0] === 'choices') {
            console.log(v[0]);
          }
        });
        console.log(changeTracker);
        changeTracker = {
          changeDate: null,
          pollItems: [],
          editedChoices: [],
          newChoices: [],
          deletedChoices: []
        };
        // let updated = await this.api.updatePoll(this.state.polls[this.poll]);
        // console.log('poll updated: ', updated);
      }

      backup = JSON.parse(JSON.stringify(this.state.polls[this.poll]));
      document.getElementById('vote-radio').checked = true;
    }
  }

  checkInput() {
    let disabled = false;
    let inputs = document.getElementById('edit-inputs').getElementsByTagName('input');
    inputs = Array.from(inputs);
    inputs.splice(1, 1);

    inputs.forEach((v, i, a) => {
      if(!disabled) {
        let min = v.getAttribute('minlength');
        let max = v.getAttribute('maxlength');

        if(v.value.length < min || v.value.length > max) {
          disabled = true;
        }
      }
    });

    document.getElementById('edit-done').disabled = disabled;
  }

  deletePoll() {
    // delete poll with api-interface
    this.state.polls.splice(this.poll, 1);
    this.router.navigate('user');
  }
}