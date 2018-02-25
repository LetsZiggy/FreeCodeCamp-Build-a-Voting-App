import {bindable, bindingMode, observable} from 'aurelia-framework';
import * as palette from 'google-palette';
import {state} from '../services/state';
import {destroyChart, generateChart} from '../services/drawchart';

let initial = true;
let backup = null

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
      console.log(newValue, oldValue);
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
        this.checkInput(this.state.polls[this.poll].lastIndex)
      }, 200);
    }
  }

  donecancel(type) {
    if(type === 'cancel') {
      while(this.state.polls[this.poll].choices.length) { this.state.polls[this.poll].choices.pop(); }
      backup.choices.forEach((v, i, a) => this.state.polls[this.poll].choices.push(v));
      this.state.polls[this.poll].lastIndex = backup.lastIndex;
      document.getElementById('vote-radio').checked = true;
    }
    else {
      let pass = true;
      let inputs = document.getElementById('edit-inputs').getElementsByTagName('input');
      Array.from(inputs).forEach((v, i, a) => {
        if(v.value.length < 1) {
          pass = false;
        }
      });

      if(pass) {
        backup = JSON.parse(JSON.stringify(this.state.polls[this.poll]));
        document.getElementById('vote-radio').checked = true;
      }
    }
  }

  checkInput(id) {
    let input = document.getElementById(`edit-${id}`);
    if(input.value.length < 3) {
      document.getElementById('edit-done').disabled = true;
    }
    else {
      document.getElementById('edit-done').disabled = false;
    }
  }
}