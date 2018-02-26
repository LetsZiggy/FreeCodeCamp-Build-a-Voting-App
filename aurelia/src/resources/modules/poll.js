import {bindable, bindingMode, observable} from 'aurelia-framework';
import * as palette from 'google-palette';
import {state} from '../services/state';
import {destroyChart, updateChart, generateChart} from '../services/drawchart';

let initial = true;
let backup = null;

export class Poll {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;
  @observable({ changeHandler: 'voteChanged' }) vote = null;

  constructor() {
    this.poll = null;
    this.new = null;
    this.charts = { current: [] };
  }

  activate(params, routeConfig, navigationInstruction) {
    navigationInstruction.config.navModel.setTitle(params.name);
    this.poll = params.id;
    this.new = params.new || false;

    this.poll = this.state.polls.findIndex((v, i, a) => v.id === this.poll);
    this.vote = this.state.user ? this.state.polls[this.poll].voters[this.state.user.id] : 0;
    backup = JSON.parse(JSON.stringify(this.state.polls[this.poll]));
  }

  attached() {
    let canvas = [
      ['current', document.getElementById('right-column').getElementsByTagName('canvas')]
    ];

    generateChart(palette, canvas, this.charts, this.state);
  }

  detached() {
    backup = null;
    initial = true;
    this.poll = null;
    this.new = null;

    destroyChart(this.charts);
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

      updateChart(this.charts.current[0], this.state.polls[this.poll].choices);
    }
  }

  addremove(index) {
    if(index !== null) {
      this.state.polls[this.poll].choices.splice(index, 1);
    }
    else {
      this.state.polls[this.poll].lastIndex++;
      this.state.polls[this.poll].choices.push({
        id: this.state.polls[this.poll].lastIndex,
        name: '',
        votes: 0,
      });

      setTimeout(() => {
        this.checkInput();
      }, 200);
    }
  }

  donecancel(type) {
    if(type === 'cancel') {
      while(this.state.polls[this.poll].choices.length) { this.state.polls[this.poll].choices.pop(); }
      backup.choices.forEach((v, i, a) => this.state.polls[this.poll].choices.push(v));
      this.state.polls[this.poll].name = backup.name;
      this.state.polls[this.poll].isPublic = backup.isPublic;
      this.state.polls[this.poll].lastIndex = backup.lastIndex;
      document.getElementById('vote-radio').checked = true;
    }
    else {
      let canvas = [
        ['current', document.getElementById('right-column').getElementsByTagName('canvas')]
      ];

      destroyChart(this.charts);
      this.charts.current = [];
      generateChart(palette, canvas, this.charts, this.state);
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
}