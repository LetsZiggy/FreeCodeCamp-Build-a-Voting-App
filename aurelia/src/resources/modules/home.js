import {bindable, bindingMode} from 'aurelia-framework';
import * as palette from 'google-palette';
import {state} from '../services/state';
import {destroyChart, generateChart} from '../services/drawchart';

export class Home {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor() {
    this.charts = { created: [], participated: [], latest: [], most: [] };
    this.user = { created: [], participated: [] };
  }

  activate(params, routeConfig, navigationInstruction) {
    this.user.created = this.state.polls.filter((v, i, a) => v.owner === this.state.user.id);

    this.user.participated = this.state.polls.filter((v, i, a) => v.voters[this.state.user.id] !== undefined && v.voters[this.state.user.id] !== null);
  }

  attached() {
    let canvas = [];

    if(this.state.user.id) {
      canvas.push(['created', document.getElementById('created').getElementsByTagName('canvas')]);
      canvas.push(['participated', document.getElementById('participated').getElementsByTagName('canvas')]);
    }

    canvas.push(['latest', document.getElementById('latest').getElementsByTagName('canvas')]);
    canvas.push(['most', document.getElementById('most').getElementsByTagName('canvas')]);

    generateChart(palette, canvas, this.charts, this.state);
  }

  detached() {
    this.user = null;

    destroyChart(this.charts);
    this.charts = null;
  }
}