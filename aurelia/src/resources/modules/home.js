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
    if(!this.state.polls.length || (this.state.toUpdatePolls.now !== null && (Date.now() - this.state.toUpdatePolls.now) > 60000)) {
      let response = await this.api.getPolls();
      this.state.polls = response.map((v, i, a) => v);
      this.state.toUpdatePolls.now = Date.now();
      this.state.toUpdatePolls.updated = true;
    }

    this.user.created = this.state.polls.filter((v, i, a) => v.owner === this.state.user.username);

    this.user.participated = this.state.polls.filter((v, i, a) => v.voters[this.state.user.username] !== undefined && v.voters[this.state.user.username] !== null);
  }

  attached() {
    if(this.state.toUpdatePolls.updated) {
      let canvas = [];

      if(this.state.user.username && this.user.created.length) {
        canvas.push(['created', document.getElementById('created').getElementsByTagName('canvas')]);
      }
      if(this.state.user.username && this.user.participated.length) {
        canvas.push(['participated', document.getElementById('participated').getElementsByTagName('canvas')]);
      }

      canvas.push(['latest', document.getElementById('latest').getElementsByTagName('canvas')]);
      canvas.push(['most', document.getElementById('most').getElementsByTagName('canvas')]);

      generateCharts(palette, canvas, this.charts, this.state);
      this.state.toUpdatePolls.updated = false;

    }
  }

  detached() {
    destroyCharts(this.charts);
    this.charts = null;
    this.user = null;
    this.state.toUpdatePolls.updated = true;
  }
}