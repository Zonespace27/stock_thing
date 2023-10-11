/*
 * Company stuff
 */

/// List of all built company objects
var company_list = [];

/**
 * Ref to the company in the primary ticker slot
 */
var primary_ticker_company;

/**
 * List of companies in the secondary ticker slots
 */
var secondary_ticker_companies = [];

/// Dict of ticker : company object
var ticker_to_company = {};

const company_data = [
  {
    company_name: "Fizzbuzz Inc.",
    ticker: "FZBZ",
    y_axis_offset: 1,
    sin_multiplier: 1,
    period_divider: 1,
  },
  {
    company_name: "Foobar Ltd.",
    ticker: "FBR",
    y_axis_offset: 1,
    sin_multiplier: 3,
    period_divider: 2,
  },
];

class Company {
  constructor(
    company_name = "Debugging Inc.",
    ticker = "EMPTY",
    y_axis_offset = 1,
    sin_multiplier = 1,
    period_divider = 1
  ) {
    this.company_name = company_name;
    this.ticker = ticker;
    this.y_axis_offset = y_axis_offset; // in the formula y=m*sin(ox)+mn, represents n
    this.sin_multiplier = sin_multiplier; // in the formula y=m*sin(ox)+mn, represents m
    this.period_divider = period_divider; // in the formula y=m*sin(ox)+mn, represents o
    this.current_price = 0;
    /**
     * The last [max_data_points] pieces of historical price data
     */
    this.chart_data = [];
    this.linked_chart = null;
  }
  on_day_tick() {
    this.current_price = sin_equation(
      this.sin_multiplier,
      this.period_divider,
      this.y_axis_offset
    );
    if (this.chart_data.length >= max_data_points) {
      this.chart_data.shift();
    }
    this.chart_data.push(this.current_price);
    if (this.linked_chart) {
      if (
        !this.linked_chart.data ||
        !this.linked_chart.data.datasets ||
        !this.linked_chart.data.datasets[0].data
      )
        return;
      this.linked_chart.data.datasets[0].data = this.chart_data;
      this.linked_chart.update();
    }
    if (this === primary_ticker_company) {
      let element = document.getElementById("info_button_1");
      element.textContent = "1: Basics";
      element = document.getElementById("info_button_2");
      element.textContent = "2: Empty";
      element = document.getElementById("info_button_3");
      element.textContent = "3: Game";
      element = document.getElementById("info_button_4");
      element.textContent = "4: Empty";
    }
  }
}

function create_company(data_dictionary) {
  let company = new Company(
    data_dictionary.get("company_name"),
    data_dictionary.get("ticker"),
    data_dictionary.get("y_axis_offset"),
    data_dictionary.get("sin_multiplier"),
    data_dictionary.get("period_divider")
  );
  company_list.push(company);
  ticker_to_company[company.ticker] = company;
}

function build_companies() {
  company_data.forEach((dict_data) =>
    create_company(new Map(Object.entries(dict_data)))
  );
}

function update_company_prices() {
  company_list.forEach((company) => company.on_day_tick());
}

/*
 * Chart stuff
 */

const xValues = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
const max_data_points = 10;

var charts = {};

function initChart(chart_id, ticker = "", primary_ticker = false) {
  let new_chart = new Chart(chart_id, {
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
    options: {
      legend: { display: false },
    },
  });
  charts[chart_id] = new_chart;
  if (ticker && ticker != "") {
    let company = ticker_to_company[ticker];
    company.linked_chart = new_chart;
    company.chart_data = new_chart?.data?.datasets[0]?.data;
    if (primary_ticker) {
      primary_ticker_company = company;
    } else {
      secondary_ticker_companies.push(company);
    }
  }
}

function sin_equation(
  sin_multiplier = 1,
  period_divider = 1,
  y_axis_offset = 1
) {
  return Math.trunc(
    (sin_multiplier * Math.sin(Date.now() * period_divider) +
      y_axis_offset * sin_multiplier) *
      1000
  );
}
/*
function update_chart(chart) {
  if (!chart.data || !chart.data.datasets || !chart.data.datasets[0].data)
    return;

  let chart_data = chart.data.datasets[0].data;

  if (chart_data.length >= max_data_points) {
    chart_data.shift();
  }
  chart_data.push(sin_equation());
  chart.update();
}

function update_charts() {
  let values = Object.values(charts);
  values.forEach(function (chart) {
    update_chart(chart);
  });
}*/
/*
var interval = setInterval(function () {
  start_trading_day();
}, 500);*/

/*
 * Math functions
 */

function hours_to_minutes(hour) {
  return hour * 60;
}

function seconds_to_ms(seconds) {
  return seconds * 1000;
}

function pretty_time() {
  let am_pm = "AM";
  let hour_time = current_time / 60;
  if (hour_time >= 12 && hour_time < 24) {
    am_pm = "PM";
  }
  if (hour_time >= 24) {
    current_time -= hours_to_minutes(24);
    hour_time -= 24;
  } else if (hour_time >= 13) {
    // Account for 12 -> 1
    hour_time -= 12;
  }
  let minutes = "0";
  let split_hour_time = hour_time.toString().split(".");
  if (!Number.isInteger(hour_time)) {
    minutes = split_hour_time[1];
  }
  if (split_hour_time[0] == "0") {
    split_hour_time[0] = "12";
  }

  minutes = parseFloat("0.".concat(minutes));
  minutes = (60 * minutes).toString();
  if (minutes.length == 1) {
    minutes = `${minutes}0`;
  }

  return `${split_hour_time[0]}:${minutes} ${am_pm}, ${current_month} ${current_day}, ${current_year}`;
}

/*
 * Trading day tick
 */

/**
 * Ref to the interval object for the trading day
 */
var day_interval;

/**
 * The time to start at. The stock market opens at 9:30 AM weekdays.
 */
var start_time = hours_to_minutes(9.5);

/**
 * The time to end at. The stock market closes at 4:00 PM weekdays.
 */
var end_time = hours_to_minutes(16);

/**
 * How much time to advance per tick
 */
var advance_amount = hours_to_minutes(0.25);

/**
 * The current time of the trading day in minutes
 */
var current_time = start_time;

/**
 * The current in-game month
 */
var current_month = "October";

/**
 * The current in-game day
 */
var current_day = 18;

/**
 * The current in-game year
 */
var current_year = 2023;

/**
 * How many MS occur before the game will tick
 */
var time_per_tick = seconds_to_ms(2);

start_trading_day();

function start_trading_day() {
  current_time = start_time;
  day_interval = setInterval(function () {
    on_day_tick();
  }, time_per_tick);
}

function end_trading_day() {
  clearInterval(day_interval);
}

function on_day_tick() {
  advance_time();
  update_company_prices();
  //update_charts();
  if (current_time >= end_time) {
    end_trading_day();
  }
}

function advance_time() {
  current_time += advance_amount;
  update_date_time();
}

function update_date_time() {
  let element = document.getElementById("date_time");
  element.textContent = pretty_time();
}

/*
 * UI button interactions
 */

/**
 * String ID of the currently focused page
 */
var current_page = "";

function headrow_trade() {
  let element = document.getElementById("trade_interface");
  element.style.display = "block";
  element = document.getElementById("information_interface");
  element.style.display = "none";
}

function headrow_info() {
  let element = document.getElementById("trade_interface");
  element.style.display = "none";
  element = document.getElementById("information_interface");
  element.style.display = "block";
}

// Info buttons

const INFO_SUBTAB_BASIC_READING = "basic_reading";
const INFO_SUBTAB_GAME_READING = "game_reading";
const INFO_TAB_BASIC = "basic";
const INFO_TAB_NONE = "none";
const INFO_TAB_GAME = "game";

/**
 * The currently focused information tab
 */
var focused_info_tab = INFO_TAB_NONE;

function info_button_1_press() {
  let element;
  switch (focused_info_tab) {
    case INFO_TAB_NONE:
      set_tab_basic();
      break;

    case INFO_TAB_BASIC:
      focused_info_tab = INFO_SUBTAB_BASIC_READING;
      set_button_return();

      element = document.getElementById("info_body");
      element.innerHTML = `
The stock market is an exchange where shares (also called stocks) in various companies are bought and sold.<br><br>
Shares are representative of a portion of ownership in a company, though one share is almost always worth too little for it to truly be considered company ownership. 
Instead, shares are bought and sold in the stock market as a purely financial transaction for the purpose of profit. 
If a company is percieved to do well, people will want to purchase its stock, which increases demand, which raises the price.
      `;
      break;

    case INFO_TAB_GAME:
      focused_info_tab = INFO_SUBTAB_GAME_READING;
      set_button_return();

      element = document.getElementById("info_body");
      element.innerHTML = `
The game is a trading simulator, where you are tasked to make as much money as possible. 
To do this, you have access to a trading console where you are able to trade shares of companies over the course of a trading day.
As you earn more money, more tools and trading options will become available for you to use.<br><br>
To start, you will only have access to <b>day trading</b>.
      `;
      break;
  }
}

function info_button_2_press() {
  let element;
  switch (focused_info_tab) {
    case INFO_TAB_BASIC:
      focused_info_tab = INFO_SUBTAB_BASIC_READING;
      set_button_return();

      element = document.getElementById("info_body");
      element.innerHTML = `
The purpose of the stock market is twofold.<br><br>
The first is that companies are able to raise money by putting shares for public sale. 
When an investor buys a share from the company, the money will be given to the company in exchange. 
This allows companies to fund more growth and development without finding a private investor.<br><br>
The second is for the investor to earn money. 
The first and most common way of earning money from investing is through capital appreciation.
When the stock appreciates, the investor can sell it for the increased value, potentially profiting. 
The second is that some forms of shares provide a dividend on fixed intervals, giving the investor a direct share of the profits from the company.
        `;
      break;
  }
}

function info_button_3_press() {
  let element;
  switch (focused_info_tab) {
    case INFO_TAB_NONE:
      set_tab_game();
      break;

    case INFO_TAB_BASIC:
      focused_info_tab = INFO_SUBTAB_BASIC_READING;
      set_button_return();

      element = document.getElementById("info_body");
      element.innerHTML = `
The economy and the stock market are entirely different machines, but they can often affect each other. 
If the economy is on the rise, more people will have the money to invest, which raises demand for stocks. 
The inverse of this is true as well; should there be less economic stability, stocks will fall in price. 
For instance, the NASDAQ Composite Index, an index of the average stock price of more than 3300 companies, had an immediate downturn of over 30% during April and March 2020.
As you likely know, this was when the COVID-19 pandemic began. 
This downturn went hand-in-hand with a fall in consumer spending of around 30% as well.<br><br>
The stock market can affect the economy, as well. 
In late 1929, a long period of speculative trading utilizing loaned money began to decay, causing the entire stock market to go into rapid free-fall. 
By 1932 the Dow Jones Industrial Average, another aggregate index, had fallen to almost 10% of its value 3 years before. 
The money and economic faith lost were the primary causes of the Great Depression, which lasted until 1939.
          `;
      break;
  }
}

function info_button_4_press() {
  return;
}

function info_button_5_press() {
  switch (focused_info_tab) {
    case INFO_TAB_BASIC:
    case INFO_TAB_GAME:
      set_tab_none();
      break;

    case INFO_SUBTAB_BASIC_READING:
      set_tab_basic();
      break;

    case INFO_SUBTAB_GAME_READING:
      set_tab_game();
      break;
  }
}

// Button helpers

function set_button_return() {
  let element;
  element = document.getElementById("info_button_1");
  element.textContent = "";
  element = document.getElementById("info_button_2");
  element.textContent = "";
  element = document.getElementById("info_button_3");
  element.textContent = "";
  element = document.getElementById("info_button_4");
  element.textContent = "";
  element = document.getElementById("info_button_5");
  element.textContent = "Return";
}

function set_tab_none() {
  let element;
  focused_info_tab = INFO_TAB_NONE;
  element = document.getElementById("info_button_1");
  element.textContent = "1: Basics";
  element = document.getElementById("info_button_2");
  element.textContent = "2: Empty";
  element = document.getElementById("info_button_3");
  element.textContent = "3: Game";
  element = document.getElementById("info_button_4");
  element.textContent = "4: Empty";
  element = document.getElementById("info_button_5");
  element.textContent = "5: Empty";
  element = document.getElementById("info_body");
  element.innerHTML = "";
}

function set_tab_basic() {
  let element;
  focused_info_tab = INFO_TAB_BASIC;
  element = document.getElementById("info_button_1");
  element.textContent = "1.1: What is the stock market?";
  element = document.getElementById("info_button_2");
  element.textContent = "1.2: What purpose does the stock market achieve?";
  element = document.getElementById("info_button_3");
  element.textContent =
    "1.3: How does the stock market interact with the economy?";
  element = document.getElementById("info_button_4");
  element.textContent = "1.4: Empty";
  element = document.getElementById("info_button_5");
  element.textContent = "Return";
  element = document.getElementById("info_body");
  element.innerHTML = "";
}

function set_tab_game() {
  let element;
  focused_info_tab = INFO_TAB_GAME;
  element = document.getElementById("info_button_1");
  element.textContent = "3.1: About";
  element = document.getElementById("info_button_2");
  element.textContent = "3.2: Empty";
  element = document.getElementById("info_button_3");
  element.textContent = "3.3: Empty";
  element = document.getElementById("info_button_4");
  element.textContent = "3.4: Empty";
  element = document.getElementById("info_button_5");
  element.textContent = "Return";
}
