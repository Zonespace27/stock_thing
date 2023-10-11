import { company_list } from "./company";
import { Chart } from 'chart.js';

const xValues = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
const max_data_points = 10;

var charts = {};

export function initChart(chart_id) {
  var new_chart = new Chart(chart_id, {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          data: [300, 700, 2000, 5000, 6000, 4000, 2000, 1000, 200, 100],
          borderColor: "blue",
          fill: false,
        },
      ],
    },
  });
  charts[chart_id] = new_chart;
}

function cos_equation() {
  return Math.cos(Date.now()) + 1
}

function update_charts() {
  let chart: Chart = charts["base"];
  if(!chart.data.datasets || !chart.data.datasets[0].data)
    return;

  let chart_data = chart.data.datasets[0].data

  if(chart_data.length >= max_data_points) {
    chart_data.shift()
  }
  chart_data.push(cos_equation())
  chart.update()
}
var time = 1;
var interval = setInterval(function() { 
  if (time <= 3) { 
     update_charts();
     time++;
  }
  else { 
     clearInterval(interval);
  }
}, 5000);