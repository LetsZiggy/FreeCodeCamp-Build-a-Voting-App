import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Router, Redirect} from 'aurelia-router';
import * as palette from 'google-palette';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';
import {destroyCharts, generateCharts} from '../services/draw-charts';

@inject(Router, ApiInterface)
export class User {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(Router, ApiInterface) {
    this.router = Router;
    this.api = ApiInterface;
    this.pagination = { perPage: 10, created: 0, participated: 0 };
    this.charts = { created: [], participated: [] };
    this.user = { created: [], participated: [] };
  }

  canActivate() {
    if(this.state.user === null) {
      if(this.router.history.previousLocation === '/home' || this.router.history.previousLocation === '/polls') {
        return(false);
      }
      else {
        return(new Redirect('home'));
      }
    }
  }

  async activate(params, routeConfig, navigationInstruction) {
    if(!this.state.polls.length || (this.state.update.now !== null && (Date.now() - this.state.update.now) > 600000)) {
      let response = await this.api.getPolls();
      this.state.polls = response.map((v, i, a) => v);
      this.state.update.now = Date.now();
      this.state.update.updated = true;
    }

    this.user.created = this.state.polls.filter((v, i, a) => v.owner === this.state.user);

    this.user.participated = this.state.polls.filter((v, i, a) => v.voters[this.state.user] !== undefined && v.voters[this.state.user] !== null);
  }

  async attached() {
    if(this.state.user && this.state.expire < Date.now()) {
      this.state.user = null;
      this.state.expire = null;
    }

    let canvas = [
      ['created', document.getElementById('created').getElementsByTagName('canvas')],
      ['participated', document.getElementById('participated').getElementsByTagName('canvas')]
    ];

    generateCharts(palette, canvas, this.charts, this.state);

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
    this.user = {};
    this.pagination = {};

    destroyCharts(this.charts);
    this.charts = null;
  }

  setPaginationAmount(amount) {
    destroyCharts(this.charts);
    this.pagination.perPage = Number(amount);

    setTimeout(() => {
      let canvas = [
        ['created', document.getElementById('created').getElementsByTagName('canvas')],
        ['participated', document.getElementById('participated').getElementsByTagName('canvas')]
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

  async createPoll() {
    let id = await this.api.getPollID();

    if(id) {
      this.router.navigateToRoute('poll', { id: id, new: true });
    }
  }
}