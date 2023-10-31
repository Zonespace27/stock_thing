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
 * Dict of companies ("chart_id" : company | null) in the secondary ticker slots
 */
var secondary_ticker_companies = {};

/// Dict of ticker : company object
var ticker_to_company = {};

const company_data = [
  {
    // Midrange stock that is about as generic as it gets
    company_name: "Fizzbuzz Inc.",
    ticker: "FZBZ",
    y_axis_offset: 350,
    sin_multiplier: 150,
    period_divider: 1.5,
    sin_progression: 0.5,
  },
  {
    // Cheap stock, not a lot of variance
    company_name: "Foobar Ltd.",
    ticker: "FBR",
    y_axis_offset: 65,
    sin_multiplier: 3.5,
    period_divider: 0.8,
    sin_progression: 0.15,
  },
  {
    // High-cost stock susceptible to large swings
    company_name: "Weston-Yamada Corp.",
    ticker: "WY",
    y_axis_offset: 1000,
    sin_multiplier: 60,
    period_divider: 1.5,
    sin_progression: 0.8,
  },
  {
    // Steady high-cost stock
    company_name: "Macrosoft Inc.",
    ticker: "MCSF",
    y_axis_offset: 1300,
    sin_multiplier: 3,
    period_divider: 2,
  },
  {
    // Midrange
    company_name: "BetterBrick Utd.",
    ticker: "BB",
    y_axis_offset: 400,
    sin_multiplier: 75,
    period_divider: 1.1,
    sin_progression: 0.3,
  },
  {
    // Penny stock
    company_name: "FauxShow Inc.",
    ticker: "FSW",
    y_axis_offset: 15,
    sin_multiplier: 12,
    period_divider: 0.3,
    sin_progression: 0.1,
  },
  {
    company_name: "Florstore",
    ticker: "FSTR",
    y_axis_offset: 1000,
    sin_multiplier: 3,
    period_divider: 2,
  },
  {
    // cheap stock, not a lot of variance
    company_name: "BargainBins Ltd.",
    ticker: "BGBN",
    y_axis_offset: 50,
    sin_multiplier: 3.5,
    period_divider: 0.8,
    sin_progression: 0.15,
  },
];

class Company {
  constructor(
    company_name = "Debugging Inc.",
    ticker = "EMPTY",
    y_axis_offset = 1,
    sin_multiplier = 1,
    period_divider = 1,
    sin_progression = 0.1
  ) {
    this.company_name = company_name;
    this.ticker = ticker;
    this.y_axis_offset = y_axis_offset; // in the formula y=m*sin(ox)+n, represents n
    this.sin_multiplier = sin_multiplier; // in the formula y=m*sin(ox)+n, represents m
    this.period_divider = period_divider; // in the formula y=m*sin(ox)+n, represents o
    this.sin_progression = sin_progression; // How much to progress sin_value by
    this.previous_price = 0;
    this.current_price = 0;

    /**
     * The last [max_data_points] pieces of historical price data
     */
    this.chart_data = [];
    this.linked_chart = null;
    this.chart_id = "";
    /**
     * The lowest value this stock has been on a given trading day
     */
    this.minimum_daily_value = 0;

    /**
     * The lowest value this stock has been on a given trading day
     */
    this.maximum_daily_value = 0;

    /**
     * At the start of each day, a company will (sometimes) ease itself to a new y_axis_offset.
     */
    this.daily_trajectory = 0.0;

    /**
     * The maximum a company can shift +- in a day, in percentage
     */
    this.daily_trajectory_upper_bound = 0.3;

    /**
     * Chance for a company's trajectory to shift in a day
     */
    this.trajectory_shift_chance = 0.75;

    /**
     * The y_axis_offset of a company at the start of the day, before trajectory starts to shift it.
     */
    this.old_y_axis_offset = y_axis_offset;

    /**
     * The current value put through sin_equation. Starts as a random int between 0 and 1 rounded to the nearest 10th place
     */
    this.sin_value = Math.abs(Math.round(10 * Math.random()) / 10);

    owned_stocks[this.ticker] = 0;
  }
  on_day_start() {
    this.minimum_daily_value = 0;
    this.maximum_daily_value = 0;
  }

  on_day_tick() {
    let new_price = sin_equation(this);
    if (new_price > this.maximum_daily_value) {
      this.maximum_daily_value = new_price;
    }
    if (
      new_price < this.minimum_daily_value ||
      this.minimum_daily_value === 0
    ) {
      this.minimum_daily_value = new_price;
    }
    if (this.daily_trajectory) {
      let current_day_progress = Number(
        (current_time / (end_time - start_time)).toFixed(2)
      );
      this.y_axis_offset =
        this.old_y_axis_offset *
        ((1 + this.daily_trajectory) * current_day_progress);
    }

    this.previous_price = this.current_price;
    this.current_price = new_price;
    if (this.chart_data.length >= max_data_points) {
      this.chart_data.shift();
    }
    this.chart_data.push(this.current_price);

    let info_div = document.getElementById(
      `stock_subcolumn_info_${this.ticker}`
    );
    info_div.innerHTML = `<div class='stock_list_subsubcolumn'>$${
      this.current_price
    }</div> <div class='stock_list_subsubcolumn'><span style='color: ${
      this.previous_price > this.current_price ? "#b32720" : "#34a333"
    }' title='Recent Movement'>${
      this.previous_price > this.current_price ? "-" : ""
    }$${Math.abs(
      this.current_price - this.previous_price
    )}</span></div>  <div class='stock_list_subsubcolumn'><span title='Daily Minimum / Daily Maximum'><span style='color: #b32720'>$${
      this.minimum_daily_value
    }</span> / <span style='color: #34a333'>$${
      this.maximum_daily_value
    }</span></span></div>`;

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
  }
  set_daily_trajectory() {
    this.old_y_axis_offset = Math.round(this.y_axis_offset);
    if (Math.random() > this.trajectory_shift_chance) {
      return;
    }
    this.daily_trajectory = random_num(
      -this.daily_trajectory_upper_bound,
      this.daily_trajectory_upper_bound
    );
  }
}

function create_company(data_dictionary) {
  let company = new Company(
    data_dictionary.get("company_name"),
    data_dictionary.get("ticker"),
    data_dictionary.get("y_axis_offset"),
    data_dictionary.get("sin_multiplier"),
    data_dictionary.get("period_divider"),
    data_dictionary.get("sin_progression")
  );
  company_list.push(company);
  ticker_to_company[company.ticker] = company;
}

function build_companies() {
  company_data.forEach((dict_data) =>
    create_company(new Map(Object.entries(dict_data)))
  );
}

function list_companies() {
  company_list.forEach((company) => create_company_entry(company));
}

/**
 * An int representing how many company entries have been made so far
 */
var entry_number = 0;

function create_company_entry(company) {
  entry_number++;

  let new_div = document.createElement("div");
  new_div.classList.add("stock_list_column");

  if (entry_number % 2 == 0) {
    new_div.classList.add("float_right");
  }
  if (entry_number <= 2) {
    new_div.classList.add("pad_top");
  }

  new_div.id = `stock_column_${company.ticker}`;

  let new_div_2 = document.createElement("div");
  new_div.classList.add("stock_list_column_container");
  new_div.id = `stock_column_container_${company.ticker}`;

  let text_div = document.createElement("div");
  text_div.classList.add("stock_list_subcolumn_text");
  text_div.id = `stock_subcolumn_text_${company.ticker}`;
  text_div.innerHTML = `<div class='stock_list_subsubcolumn'>${company.ticker}</div><div class='stock_list_subsubcolumn center_object' id='stock_list_button_div_${company.ticker}'><button class='button_base stock_list_column_button' id='stock_list_button_${company.ticker}' onclick='stock_list_add_remove_press("${company.ticker}")'>Aeiou</button></div>`;

  let info_div = document.createElement("div");
  info_div.classList.add("stock_list_subcolumn_info");
  info_div.id = `stock_subcolumn_info_${company.ticker}`;
  info_div.innerHTML = "Hello";

  new_div.appendChild(new_div_2);
  new_div_2.appendChild(text_div);
  new_div_2.appendChild(info_div);
  let parent_element = document.getElementById("stock_list");
  parent_element.appendChild(new_div);
}

function update_all_company_entry_buttons() {
  Object.keys(ticker_to_company).forEach((ticker) =>
    update_company_entry_button(ticker)
  );
}

function update_company_entry_button(company_ticker) {
  if (!company_ticker) {
    return;
  }
  let element = document.getElementById(`stock_list_button_${company_ticker}`);
  if (
    Object.values(secondary_ticker_companies).indexOf(
      ticker_to_company[company_ticker]
    ) !== -1 ||
    ticker_to_company[company_ticker] === primary_ticker_company
  ) {
    // The company is in a ticker slot
    set_button_select_color(`stock_list_button_${company_ticker}`, true);
    element.innerText = "Remove";
  } else {
    // The company isn't in a ticker slot
    set_button_select_color(`stock_list_button_${company_ticker}`, false);
    element.innerText = "Add";
  }
}

function update_company_prices() {
  company_list.forEach((company) => company.on_day_tick());
}
