import {bindable, bindingMode} from 'aurelia-framework';
import * as palette from 'google-palette';
import {state} from '../state';

export class Home {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor() {
    this.charts = { created: [], participated: [], latest: [], most: [] };
  }

  attached() {
    // if(this.state.login) {
    //   this.state.user.created.forEach((v, i, a) => {
    //     this.charts.push(drawChart(`created-canvas-${v.id}`, v.choices));
    //   });

    //   this.state.user.participated.forEach((v, i, a) => {
    //     this.charts.push(drawChart(`participated-canvas-${v.id}`, v.choices));
    //   });
    // }

    // this.state.polls.forEach((v, i, a) => {
    //   if(document.getElementById(`latest-canvas-${v.id}`)) {
    //     this.charts.push(drawChart(`latest-canvas-${v.id}`, v.choices));
    //   }

    //   if(document.getElementById(`most-canvas-${v.id}`)) {
    //     this.charts.push(drawChart(`most-canvas-${v.id}`, v.choices));
    //   }
    // });

    let canvas = [];

    if(this.state.login) {
      canvas.push(['created', document.getElementById('created').getElementsByTagName('canvas')]);
      canvas.push(['participated', document.getElementById('participated').getElementsByTagName('canvas')]);
    }
    
    canvas.push(['latest', document.getElementById('latest').getElementsByTagName('canvas')]);
    canvas.push(['most', document.getElementById('most').getElementsByTagName('canvas')]);

    generateChart(canvas, this.charts, this.state);
  }

  detached() {
    destroyChart(this.charts);
    this.charts = null;
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