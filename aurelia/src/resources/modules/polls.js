import {bindable, bindingMode} from 'aurelia-framework';
import * as palette from 'google-palette';
import {state} from '../state';

export class Polls {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor() {
    this.pagination = { perPage: 10, latest: 0, most: 0 };
    this.charts = { latest: [], most: [] };
  }

  attached() {
    // this.state.polls.forEach((v, i, a) => {
    //   if(document.getElementById(`latest-canvas-${v.id}`)) {
    //     this.charts.latest.push(drawChart(`latest-canvas-${v.id}`, v.choices));
    //   }

    //   if(document.getElementById(`most-canvas-${v.id}`)) {
    //     this.charts.most.push(drawChart(`most-canvas-${v.id}`, v.choices));
    //   }
    // });
    
    let canvas = [
      ['latest', document.getElementById('latest').getElementsByTagName('canvas')],
      ['most', document.getElementById('most').getElementsByTagName('canvas')]
    ];

    generateChart(canvas, this.charts, this.state);
  }

  detached() {
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

      generateChart(canvas, this.charts, this.state);
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
      generateChart(canvas, this.charts, this.state);
    }, 0);
  }
}

function generateChart(canvas, charts, state) {
  canvas.forEach((cv, ci, ca) => {
    Array.from(cv[1]).forEach((v, i, a) => {
      let id = v.getAttribute('id').split('-')[2];
      let choice = null;
      if(cv[0] === 'created') { choice = state.user.created.find(x => x.id === id); }
      else if(cv[0] === 'participated') { choice = state.user.participated.find(x => x.id === id); }
      else { choice = state.polls.find(x => x.id === id); }
      charts[cv[0]].push(drawChart(v.getAttribute('id'), choice.choices));
    });
  });
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
            barThickness: 5
,            ticks: {
              min: 0,
              max: max
            },
            stacked: true
          }]
        },
        maintainAspectRatio: false,
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

function destroyChart(charts, type='object') {
  if(type === 'object') {
    Object.entries(charts).forEach(([ok, ov]) => {
      ov.forEach((v, i, a) => {
        v.destroy();
      });

      while(ov.length) {
        ov.pop();
      }
    });
  }
  else {
    charts.forEach((v, i, a) => {
      v.destroy();
    });

    while(charts.length) {
      charts.pop();
    }
  }
}