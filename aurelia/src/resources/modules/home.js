import {inject, bindable, bindingMode} from 'aurelia-framework';
import * as palette from 'google-palette';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';
import {destroyCharts, generateCharts} from '../services/draw-charts';

@inject(ApiInterface)
export class Home {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(ApiInterface) {
    this.api = ApiInterface;
    this.charts = { created: [], participated: [], latest: [], most: [] };
    this.user = { created: [], participated: [] };
  }

  async activate(params, routeConfig, navigationInstruction) {
    if(this.state.user && this.state.expire < Date.now()) {
      this.state.user = null;
      this.state.expire = null;
    }

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
    if(this.state.update.updated) {
      let canvas = [];

      if(this.state.user && this.user.created.length) {
        canvas.push(['created', document.getElementById('created').getElementsByTagName('canvas')]);
      }
      if(this.state.user && this.user.participated.length) {
        canvas.push(['participated', document.getElementById('participated').getElementsByTagName('canvas')]);
      }

      canvas.push(['latest', document.getElementById('latest').getElementsByTagName('canvas')]);
      canvas.push(['most', document.getElementById('most').getElementsByTagName('canvas')]);

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
    this.user = null;

    destroyCharts(this.charts);
    this.charts = null;
    this.state.update.updated = true;
  }
}