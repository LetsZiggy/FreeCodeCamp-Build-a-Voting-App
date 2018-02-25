import {bindable, bindingMode} from 'aurelia-framework';
import * as palette from 'google-palette';
import {state} from '../services/state';
import {destroyChart, generateChart} from '../services/drawchart';

export class Polls {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor() {
    this.pagination = { perPage: 10, latest: 0, most: 0 };
    this.charts = { latest: [], most: [] };
  }

  attached() {
    let canvas = [
      ['latest', document.getElementById('latest').getElementsByTagName('canvas')],
      ['most', document.getElementById('most').getElementsByTagName('canvas')]
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
        ['latest', document.getElementById('latest').getElementsByTagName('canvas')],
        ['most', document.getElementById('most').getElementsByTagName('canvas')]
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