/*
 * Chart stuff
 */

/**
 * The default X values of the chart if there aren't data points. Will be naturally overriden as time goes on
 */
const xValues = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

/**
 * Maximum amount of data points that can be on a chart at once before the oldest ones are bumped off
 */
const max_data_points = 10;

/**
 * "chart_id" : chart ref
 */
var charts = {};

/**
 * Creates a new chart object and inserts it into `charts`
 * @param {string} chart_id
 * @param {string} ticker
 * @param {boolean} primary_ticker
 * @returns void
 */
function init_chart(chart_id, ticker = "", primary_ticker = false) {
  let new_chart = new Chart(chart_id, {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          data: ticker ? ticker_to_company[ticker].chart_data : [],
          borderColor: "#1e589e",
          fill: false,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      legend: { display: false },
      scales: {
        xAxes: [
          {
            ticks: {
              display: false,
            },
          },
        ],
      },
    },
  });
  charts[chart_id] = new_chart;
  if (ticker && ticker !== "") {
    let company = ticker_to_company[ticker];
    company.linked_chart = new_chart;
    company.chart_id = chart_id;
    company.chart_data = new_chart?.data?.datasets[0]?.data;
    if (primary_ticker) {
      primary_ticker_company = company;
    } else {
      secondary_ticker_companies[chart_id] = company;
    }
    let element = document.getElementById(`st_info_name_${chart_id}`);
    if (element) {
      element.textContent = company.company_name;
      element = document.getElementById(`st_info_ticker_${chart_id}`);
      element.textContent = company.ticker;
    }
  }
}

/**
 * Given a company object, will return a value of what the company should be worth using a sin wave and some randomization.
 * @param {Company} company
 * @returns integer
 */
function sin_equation(company) {
  company.sin_value += company.sin_progression;
  return Math.abs(
    Math.trunc(
      (company.sin_multiplier *
        Math.sin(company.sin_value * company.period_divider) +
        company.y_axis_offset *
          (Math.round(10 * Math.abs(0.5 + Math.random())) / 10)) *
        1
    )
  );
}
