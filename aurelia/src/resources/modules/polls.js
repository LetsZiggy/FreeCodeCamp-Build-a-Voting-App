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
    if(!this.state.polls.length || (this.state.update.now !== null && (Date.now() - this.state.update.now) > 600000)) {
      let response = await this.api.getPolls();
      this.state.polls = response.map((v, i, a) => v);
      this.state.update.now = Date.now();
      this.state.update.updated = true;
    }
  }

  async attached() {
    if(this.state.user && this.state.expire < Date.now()) {
      this.state.user = null;
      this.state.expire = null;
    }

    if(this.state.update.updated) {
      let canvas = [
        ['latest', document.getElementById('latest').getElementsByTagName('canvas')],
        ['most', document.getElementById('most').getElementsByTagName('canvas')]
      ];

      generateCharts(palette, canvas, this.charts, this.state);
      this.state.update.updated = false;
    }

    window.onunload = async (event) => {
      if(this.state.user) {
        let store = JSON.parse(localStorage.getItem("freecodecamp-build-a-voting-app")) || {};
        let data = { user: this.state.user, expire: this.state.expire };
        data.votes = store.votes || {};
        localStorage.setItem('freecodecamp-build-a-voting-app', JSON.stringify(data));
      }
    };
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