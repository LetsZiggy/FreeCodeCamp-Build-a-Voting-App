import {inject, bindable, bindingMode} from 'aurelia-framework';
import * as palette from 'google-palette';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';
import {destroyCharts, generateCharts} from '../services/draw-charts';

@inject(ApiInterface)
export class Polls {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(ApiInterface) {
    this.api = ApiInterface;
    this.pagination = { perPage: 10, latest: 0, most: 0 };
    this.charts = { latest: [], most: [] };
  }

  async activate(params, routeConfig, navigationInstruction) {
    if(!this.state.polls.length || (this.state.update.now !== null && Date.now() - this.state.update.now > 60000)) {
      let response = await this.api.getPolls();
      this.state.polls = response.map((v, i, a) => v);
      this.state.update.now = Date.now();
      this.state.update.updated = true;
    }
  }

  attached() {
    if(this.state.update.updated) {
      let canvas = [
        ['latest', document.getElementById('latest').getElementsByTagName('canvas')],
        ['most', document.getElementById('most').getElementsByTagName('canvas')]
      ];

      generateCharts(palette, canvas, this.charts, this.state);
      this.state.update.updated = false;
    }
  }

  detached() {
    this.pagination = null;

    destroyCharts(this.charts);
    this.charts = null;
    this.state.update.updated = true;
  }

  setPaginationAmount(amount) {
    destroyCharts(this.charts);
    this.pagination.perPage = Number(amount);

    setTimeout(() => {
      let canvas = [
        ['latest', document.getElementById('latest').getElementsByTagName('canvas')],
        ['most', document.getElementById('most').getElementsByTagName('canvas')]
      ];

      generateCharts(palette, canvas, this.charts, this.state);
    }, 0);
  }

  changePage(direction, poll) {
    destroyCharts(this.charts[poll], 'array');

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
      generateCharts(palette, canvas, this.charts, this.state);
    }, 0);
  }
}