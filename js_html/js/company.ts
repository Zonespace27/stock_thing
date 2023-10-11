import { Chart } from 'chart.js';

/*
 * Company stuff
 */

/// List of all built company objects
export var company_list: Company[] = [];

export const company_data = [
  {
    company_name: "Fizzbuzz Inc.",
    ticker: "FZBZ",
    y_axis_offset: 1,
    sin_multiplier: 1,
    period_divider: 1,
  },
];

export class Company {
  company_name: string;
  ticker: string;
  y_axis_offset: number;
  sin_multiplier: number;
  period_divider: number;

  constructor(
    company_name = "Debugging Inc.",
    ticker = "EMPTY",
    y_axis_offset = 1,
    sin_multiplier = 1,
    period_divider = 1
  ) {
    this.company_name = company_name;
    this.ticker = ticker;
    this.y_axis_offset = y_axis_offset; // in the formula y=m*sin(ox)+n, represents n
    this.sin_multiplier = sin_multiplier; // in the formula y=m*sin(ox)+n, represents m
    this.period_divider = period_divider; // in the formula y=m*sin(ox)+n, represents o
  }
}

export function create_company(data_dictionary: Map<string, string|number>) {
  company_list.push(
    new Company(
      data_dictionary.get("company_name") as string,
      data_dictionary.get("ticker") as string,
      data_dictionary.get("y_axis_offset") as number,
      data_dictionary.get("sin_multiplier") as number,
      data_dictionary.get("period_divider") as number,
    )
  );
}

export function build_companies() {
  company_data.forEach((dict_data) => create_company(new Map(Object.entries(dict_data))));
}

/*
 * Chart stuff
 */

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