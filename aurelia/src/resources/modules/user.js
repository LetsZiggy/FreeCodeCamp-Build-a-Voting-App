import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import * as palette from 'google-palette';
import {state} from '../services/state';
import {destroyChart, generateChart} from '../services/drawchart';

@inject(Router)
export class User {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(Router) {
    this.router = Router;
    this.pagination = { perPage: 10, created: 0, participated: 0 };
    this.charts = { created: [], participated: [] };
    this.user = { created: [], participated: [] };
  }

  canActivate() {
    if(!this.state.user.id) {
      this.router.navigate('home');
    }
  }

  activate(params, routeConfig, navigationInstruction) {
    this.user.created = this.state.polls.filter((v, i, a) => v.owner === this.state.user.id);

    this.user.participated = this.state.polls.filter((v, i, a) => v.voters[this.state.user.id] !== undefined && v.voters[this.state.user.id] !== null);
  }

  attached() {
    let canvas = [
      ['created', document.getElementById('created').getElementsByTagName('canvas')],
      ['participated', document.getElementById('participated').getElementsByTagName('canvas')]
    ];

    generateChart(palette, canvas, this.charts, this.state);
  }

  detached() {
    this.pagination = null;

    destroyChart(this.charts);
    this.charts = null;
  }

  setPaginationAmount(amount) {
    destroyChart(this.charts);
    this.pagination.perPage = Number(amount);

    setTimeout(() => {
      let canvas = [
        ['created', document.getElementById('created').getElementsByTagName('canvas')],
        ['participated', document.getElementById('participated').getElementsByTagName('canvas')]
      ];

      generateChart(palette, canvas, this.charts, this.state);
    }, 0);
  }

  changePage(direction, poll) {
    destroyChart(this.charts[poll], 'array');

    if(direction === 'prev') {
      this.pagination[poll] = (this.pagination[poll] - this.pagination.perPage) < 0
                                ? 0
                                : this.pagination[poll] - this.pagination.perPage;
    }
    else {
      this.pagination[poll] = (this.pagination[poll] + this.pagination.perPage) > this.state.polls.length
                                ? this.state.polls.length - this.pagination.perPage
                                : this.pagination[poll] + this.pagination.perPage;
    }

    setTimeout(() => {
      let canvas = [[poll, document.getElementById(poll).getElementsByTagName('canvas')]];
      generateChart(palette, canvas, this.charts, this.state);
    }, 0);
  }
}