export function destroyCharts(charts, type='object') {
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

export function updateCharts(chart, update) {
  update.forEach((v, i, a) => { chart.data.datasets[0].data[i] = v.votes; });
  chart.update();
}

export function generateCharts(palette, canvas, charts, state) {
  canvas.forEach((cv, ci, ca) => {
    Array.from(cv[1]).forEach((v, i, a) => {
      let id = v.getAttribute('id').split('-')[2];
      let choice = state.polls.find(x => x.id === id);
      if(cv[0] === 'current') {
        charts[cv[0]].push(drawHorizontalChart(palette, v.getAttribute('id'), choice.choices));
      }
      else {
        charts[cv[0]].push(drawSingleLineChart(palette, v.getAttribute('id'), choice.choices));
      }
    });
  });
}

function drawHorizontalChart(palette, id, choices) {
  let ctx = document.getElementById(id).getContext('2d');
  let data = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: [],
    }]
  };
  let max = 0;

  choices.forEach((v, i, a) => {
    max = max < v.votes
        ? Math.ceil((v.votes + 1) / 10) * 10
        : max < 10 ? 10 : max;
    data.labels.push(v.name);
    data.datasets[0].data.push(v.votes);
    data.datasets[0].backgroundColor.push(
      palette.default('rainbow', choices.length)
             .reduce((accu, rv, ri, ra) => `#${ra[i]}`, '')
    );
    data.datasets[0].hoverBackgroundColor.push(
      palette.default('rainbow', choices.length)
             .reduce((accu, rv, ri, ra) => `#${ra[i]}`, '')
    );
  });

  return(
    new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        responsiveAnimationDuration: 0,
        scales: {
          xAxes: [{
            display: true,
            barPercentage: 1,
            categoryPercentage: 1,
            ticks: {
              min: 0,
              max: max
            },
            stacked: true
          }],
          yAxes: [{
            display: true,
            barPercentage: 1,
            categoryPercentage: 0,
            ticks: {
              stepSize: 10,
              min: 0,
              max: max
            },
            stacked: true
          }]
        },
        tooltips: {
          enabled: true
        },
        legend: {
          display: false
        },
        animation: false
      }
    })
  );
}

function drawSingleLineChart(palette, id, choices) {
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