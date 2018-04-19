import {inject, bindable, bindingMode, observable} from 'aurelia-framework';
import {Router, Redirect} from 'aurelia-router';
import * as palette from 'google-palette';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';
import {destroyCharts, updateCharts, generateCharts} from '../services/draw-charts';

let backup = null;
let changeTracker = { pollItems: [], editedChoices: [], newChoices: [], deletedChoices: [] };

@inject(Router, ApiInterface)
export class Poll {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;
  @observable({ changeHandler: 'voteChanged' }) vote = null;

  constructor(Router, ApiInterface) {
    this.router = Router;
    this.api = ApiInterface;
    this.poll = null;
    this.new = false;
    this.initial = true;
    this.charts = { current: [] };
  }

  async activate(params, routeConfig, navigationInstruction) {
    if(!this.state.polls.length || (this.state.toUpdatePolls.now !== null && (Date.now() - this.state.toUpdatePolls.now) > 60000)) {
      let response = await this.api.getPolls();
      this.state.polls = response.map((v, i, a) => v);
      this.state.toUpdatePolls.now = Date.now();
      this.state.toUpdatePolls.updated = true;
    }

    navigationInstruction.config.navModel.setTitle(params.name);
    this.poll = this.state.polls.findIndex((v, i, a) => v.id === params.id);
    this.new = !!params.new || false;

    if(!this.new) {
      if(this.state.user.username) {
        if(this.state.polls[this.poll].voters[this.state.user.username]) {
          this.vote = this.state.polls[this.poll].voters[this.state.user.username];
        }
        else if(this.state.votes[this.state.polls[this.poll].id]) {
          this.vote = this.state.votes[this.state.polls[this.poll].id];
        }
        else {
          this.vote = 0;
        }
      }
      else {
        if(this.state.votes[this.state.polls[this.poll].id]) {
          this.vote = this.state.votes[this.state.polls[this.poll].id];
        }
        else {
          this.vote = 0;
        }
      }
    }
    else {
      this.state.polls.push({
        id: params.id,
        name: '',
        owner: this.state.user.username,
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
    this.initial = true;
    changeTracker = { pollItems: [], editedChoices: [], newChoices: [], deletedChoices: [] };
    this.poll = null;
    this.new = false;
    this.vote = 0;

    destroyCharts(this.charts);
    this.charts = null;
  }

  async voteChanged(newValue, oldValue) {
    if(this.initial === true) {
      this.initial = false;
    }
    else {
      this.state.polls[this.poll].choices.forEach((v, i, a) => {
        document.getElementById(`select-${v.id}`).disabled = true;
        if(document.getElementById('spinner').style.visibility !== 'visible') {
          document.getElementById('spinner').style.visibility = 'visible';
        }
      });

      let oldChoice = null;
      if(this.state.user.username || this.state.votes) {
        oldChoice = this.state.polls[this.poll].voters[this.state.user.username] || this.state.votes[this.poll];

        if(oldChoice) {
          let oldIndex = this.state.polls[this.poll].choices.findIndex((v, i, a) => v.id === oldChoice);
          if(oldIndex !== -1) {
            this.state.polls[this.poll].choices[oldIndex].votes--;
          }
        }

        this.state.polls[this.poll].voters[this.state.user.username] = newValue;
        this.state.votes[this.poll] = newValue;
      }

      let newIndex = this.state.polls[this.poll].choices.findIndex((v, i, a) => v.id === newValue);
      this.state.polls[this.poll].choices[newIndex].votes++;

      updateCharts(this.charts.current[0], this.state.polls[this.poll].choices);
      let update = await this.api.updateVoting(this.state.user.username, this.state.polls[this.poll], newValue, oldChoice);

      this.state.polls[this.poll].choices.forEach((v, i, a) => {
        document.getElementById(`select-${v.id}`).disabled = false;
        if(document.getElementById('spinner').style.visibility !== 'hidden') {
          document.getElementById('spinner').style.visibility = 'hidden';
        }
      });

      let store = JSON.parse(localStorage.getItem('freecodecamp-build-a-voting-app')) || {};
      let data = {};
      data.username = store.user || null;
      data.userexpire = store.expire || null;
      data.votes = store.votes || {};
      data.votes[this.state.polls[this.poll].id] = newValue;
      localStorage.setItem('freecodecamp-build-a-voting-app', JSON.stringify(data));
    }
  }

  addremove(index) {
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
        let update = await this.api.cancelPoll(this.state.polls[this.poll].id);
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

      let created = false;
      let update = false;

      if(this.new) {
        this.initial = false;
        this.new = false;
        document.getElementById('delete').style.display = 'inline';
        created = await this.api.createPoll(this.state.polls[this.poll]);

        if(created === false) {
          this.router.navigateToRoute('home');
        }
        else {
          backup = JSON.parse(JSON.stringify(this.state.polls[this.poll]));
          document.getElementById('vote-radio').checked = true;
        }
      }
      else {
        if(backup.name !== this.state.polls[this.poll].name) { changeTracker.pollItems.push('name'); }
        if(backup.isPublic !== this.state.polls[this.poll].isPublic) { changeTracker.pollItems.push('isPublic'); }
        if(backup.lastIndex !== this.state.polls[this.poll].lastIndex) { changeTracker.pollItems.push('lastIndex'); }
        changeTracker.editedChoices = backup.choices.reduce((acc, bv, bi, ba) => {
          for(let i = 0; i < this.state.polls[this.poll].choices.length; i++) {
            if(bv.id === this.state.polls[this.poll].choices[i].id) {
              if(bv.name !== this.state.polls[this.poll].choices[i].name) {
                acc.push(bv.id);
              }
              break;
            }
          }
          return(acc);
        }, []);
        if(changeTracker.pollItems.length || changeTracker.editedChoices.length || changeTracker.newChoices.length || changeTracker.deletedChoices.length) {
          changeTracker.pollItems.push('edited');
          updated = await this.api.updatePoll(this.state.polls[this.poll], changeTracker, this.state.user.username);

          if(updated === true) {
            backup = JSON.parse(JSON.stringify(this.state.polls[this.poll]));
          }

          document.getElementById('vote-radio').checked = true;
        }

        changeTracker = {
          pollItems: [],
          editedChoices: [],
          newChoices: [],
          deletedChoices: []
        };
      }
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

  async deletePoll() {
    let deleted = await this.api.deletePoll(this.state.polls[this.poll], this.state.user.username);
    this.state.polls.splice(this.poll, 1);
    this.router.navigate('user');
  }
}