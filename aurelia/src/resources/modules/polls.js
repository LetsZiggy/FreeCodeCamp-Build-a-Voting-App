import {bindable, bindingMode} from 'aurelia-framework';
import * as palette from 'google-palette';
import {state} from '../state';

export class Polls {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor() {
    this.pagination = { perPage: 10, latest: 0, most: 0 };
    this.charts = [];
  }

  attached() {
    // this.state.polls.forEach((v, i, a) => {
    //   if(document.getElementById(`latest-canvas-${v.id}`)) {
    //     this.charts.push(drawChart(`latest-canvas-${v.id}`, v.choices));
    //   }

    //   if(document.getElementById(`most-canvas-${v.id}`)) {
    //     this.charts.push(drawChart(`most-canvas-${v.id}`, v.choices));
    //   }
    // });
  }

  detached() {
    this.charts.forEach((v, i, a) => {
      v.destroy();
    });
    while(this.charts.length) {
      this.charts.pop();
    }
  }

  setPaginationAmount(amount) {
    this.pagination.perPage = Number(amount);
  }
}

function drawChart(id, choices) {
  let ctx = document.getElementById(id).getContext('2d');
  let data = { labels: [''], datasets: null };
  let max = 0;

  data.datasets = choices.map((v, i, a) => {
    max += v.votes;
    let mapData = {
      data: [ v.votes ],
      backgroundColor: palette.default('rainbow', choices.length).reduce((accu, rv, ri, ra) => `#${ra[i]}`, ''),
      hoverBackgroundColor: palette.default('rainbow', choices.length).reduce((accu, rv, ri, ra) => `#${ra[i]}`, '')
    };

    return(mapData);
  });

  return(
    new Chart(ctx, {
      type: 'horizontalBar',
      data: data,
      options: {
        scales: {
          xAxes: [{
            display: false,
            barPercentage: 1,
            categoryPercentage: 0,
            ticks: {
              min: 0,
              max: max
            },
            stacked: true
          }],
          yAxes: [{
            display: false,
            barPercentage: 1,
            categoryPercentage: 1,
            barThickness: 5,
            ticks: {
              min: 0,
              max: max
            },
            stacked: true
          }]
        },
        tooltips: {
          enabled: false
        },
        legend: {
          display: false
        },
        animation: false
      }
    })
  );
}