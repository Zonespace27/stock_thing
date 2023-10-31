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

/**
 * Dict of "upgrade_id" : Upgrade object
 */
var upgrade_dict = {};

var purchased_upgrades = [];

var focused_upgrade = "";

class Upgrade {
  constructor() {
    this.name = "";
    this.id = "";
    this.description = "";
    this.purchased = false;
    this.cost = 0;
    this.hidden = false;
    this.upgrade_unlocks = [];
  }
  /**
   * What occurs when the upgrade is purchased
   * @returns void
   */
  on_purchase() {
    if (this.upgrade_unlocks?.length) {
      this.upgrade_unlocks.forEach((upgrade_id) => {
        let element = document.getElementById(`upgrade_entry_${upgrade_id}`);
        element.style.display = "block";
        upgrade_dict[upgrade_id].hidden = false;
      });
    }
    document.getElementById(`upgrade_entry_${this.id}`).disabled = true;
    wipe_upgrade_info();
  }
  /**
   * What occurs on each tick of the day once purchased
   * @returns void
   */
  on_day_tick() {
    return;
  }
}

class MovementPredictor extends Upgrade {
  constructor(
    name,
    id,
    desc,
    chance,
    accuracy_chance,
    cost,
    hidden,
    unlock_ids
  ) {
    super();
    this.name = name || "Movement Predictor Parent";
    this.id = id;
    this.description =
      desc ||
      "Parent of the movement predictor upgrade. Movement predictors will inform the player if a stock will be moving upwards/downwards on a given day. Higher tiers of the upgrade give higher accuracy and potentially how much the stock will be moving.";
    /**
     * The % chance (0 to 1) that the upgrade will predict movement of a moving stock
     */
    this.prediction_chance = chance;
    /**
     * The % chance (0 to 1) that the upgrade will predict the correct movement of a moving stock. Only rolls if it will predict at all
     */
    this.prediction_accuracy_chance = accuracy_chance;
    this.cost = cost;
    this.hidden = hidden;
    this.upgrade_unlocks = unlock_ids;
  }
  on_purchase() {
    super.on_purchase();
    enable_predictor(this.prediction_chance, this.prediction_accuracy_chance);
  }
}

function create_upgrade_dict() {
  upgrade_dict["predictor_1"] = new MovementPredictor(
    "Basic Prediction Algorithms",
    "predictor_1",
    "Purchase an algorithm that will attempt to predict the general movement of a company's stock in the upward or downward direction. Doesn't always work and isn't entirely accurate.",
    0.25,
    0.5,
    1500,
    false,
    ["predictor_2"]
  );
  upgrade_dict["predictor_2"] = new MovementPredictor(
    "Advanced Prediction Algorithms",
    "predictor_2",
    "Purchase a more advanced version of the previous algorithm to predict the general movement direction of a company's stock. The advancements made in this version increase accuracy and success rate.",
    0.5,
    0.75,
    10000,
    true,
    ["predictor_3"]
  );
  upgrade_dict["predictor_3"] = new MovementPredictor(
    "Scientific Prediction Algorithms",
    "predictor_3",
    "Purchase an even more advanced algorithm to predict the general movement direction of a company's stock. This beast of an algorithm can predict when a company will move fairly often and is very accurate.",
    0.75,
    0.9,
    45000,
    true,
    ["predictor_4"]
  );

  upgrade_dict["predictor_4"] = new MovementPredictor(
    "Quantum Prediction Algorithms",
    "predictor_4",
    "Purchase an algorithm advanced enough to predict the general movement direction of a company's stock with complete accuracy.",
    1,
    1,
    150000,
    true
  );
  load_upgrade_html();
}

function load_upgrade_html() {
  Object.values(upgrade_dict).forEach((upgrade) => {
    create_upgrade_entry(upgrade);
  });
}

function create_upgrade_entry(upgrade) {
  let new_button = document.createElement("button");
  if (upgrade.hidden) {
    new_button.style.display = "none";
  }
  new_button.classList.add("upgrade_section");
  new_button.classList.add("button_base");
  new_button.id = `upgrade_entry_${upgrade.id}`;
  new_button.textContent = `${upgrade.name}`;
  new_button.onclick = function () {
    upgrade_entry_click(upgrade.id);
  };

  let parent_element = document.getElementById("upgrade_tab");
  parent_element.appendChild(new_button);
}

function upgrade_entry_click(upgrade_id) {
  if (!upgrade_dict[upgrade_id]) {
    return;
  }
  focused_upgrade = upgrade_id;
  let element = document.getElementById("upgrade_body");
  element.innerHTML = upgrade_dict[upgrade_id].description;
  element = document.getElementById("upgrade_purchase_button");
  element.style.display = "block";
  element.textContent = `Purchase ($${upgrade_dict[upgrade_id].cost})`;
}

function wipe_upgrade_info() {
  focused_upgrade = "";
  let element = document.getElementById("upgrade_body");
  element.innerHTML = "";
  element = document.getElementById("upgrade_purchase_button");
  element.style.display = "none";
  element.textContent = `Purchase ($0000)`;
}

function upgrade_purchase_button_press() {
  let upgrade = upgrade_dict[focused_upgrade];
  if (cash < upgrade.cost) {
    return false;
  }
  if (upgrade.hidden) {
    return false; // you didn't get this legitimately so no :<
  }
  adjust_cash(-upgrade.cost);
  purchased_upgrades.push(upgrade);
  upgrade.on_purchase();
}

function update_main_ticker_info() {
  if (!primary_ticker_company) {
    let element = document.getElementById("main_ticker_button_buy1");
    element.disabled = true;
    element = document.getElementById("main_ticker_button_buyamount");
    element.disabled = true;
    element = document.getElementById("main_ticker_button_sell1");
    element.disabled = true;
    element = document.getElementById("main_ticker_button_sellamount");
    element.disabled = true;
    return;
  }

  let element = document.getElementById("main_ticker_info_name");
  element.textContent = `${primary_ticker_company.company_name} (${primary_ticker_company.ticker})`;
  element = document.getElementById("main_ticker_info_minmax");
  element.textContent = `$${primary_ticker_company.minimum_daily_value} / $${primary_ticker_company.maximum_daily_value}`;
  element = document.getElementById("main_ticker_info_shares");
  element.textContent = `${
    owned_stocks[primary_ticker_company.ticker]
  } Shares Owned`;
  element = document.getElementById("main_ticker_info_value");
  element.textContent = `$${primary_ticker_company.current_price}`;

  if (primary_ticker_company.current_price > cash) {
    element = document.getElementById("main_ticker_button_buy1");
    element.disabled = true;
    element = document.getElementById("main_ticker_button_buyamount");
    element.disabled = true;
  } else {
    element = document.getElementById("main_ticker_button_buy1");
    element.disabled = false;
    element = document.getElementById("main_ticker_button_buyamount");
    element.disabled = false;
  }

  if (parseInt(owned_stocks[primary_ticker_company.ticker]) <= 0) {
    element = document.getElementById("main_ticker_button_sell1");
    element.disabled = true;
    element = document.getElementById("main_ticker_button_sellamount");
    element.disabled = true;
  } else {
    element = document.getElementById("main_ticker_button_sell1");
    element.disabled = false;
    element = document.getElementById("main_ticker_button_sellamount");
    element.disabled = false;
  }
}

function trading_day_button_appear() {
  disable_trading_buttons(true);
  let element = document.getElementById("main_ticker_buy_buttons");
  element.classList.add("animate_disappear");
  element = document.getElementById("main_ticker_sell_buttons");
  element.classList.add("animate_disappear");
  element = document.getElementById("start_day_button");
  element.classList.add("animate_appear");
  element.style.display = "block";
  setTimeout(function () {
    disable_trading_buttons(false);
    update_main_ticker_info();
    let element = document.getElementById("main_ticker_buy_buttons");
    element.classList.remove("animate_disappear");
    element.style.display = "none";
    element = document.getElementById("main_ticker_sell_buttons");
    element.classList.remove("animate_disappear");
    element.style.display = "none";
    element = document.getElementById("start_day_button");
    element.classList.remove("animate_appear");
  }, 2100); // this number is hand-picked to cause minimum jank
}

function trading_day_button_disappear() {
  disable_trading_buttons(true);
  let element = document.getElementById("start_day_button");
  element.classList.remove("animate_appear");
  element.classList.add("animate_disappear");
  element = document.getElementById("main_ticker_buy_buttons");
  element.classList.add("animate_appear");
  element.style.display = "block";
  element = document.getElementById("main_ticker_sell_buttons");
  element.classList.add("animate_appear");
  element.style.display = "block";
  setTimeout(function () {
    disable_trading_buttons(false);
    update_main_ticker_info();
    let element = document.getElementById("start_day_button");
    element.classList.remove("animate_disappear");
    element.style.display = "none";
    element = document.getElementById("main_ticker_buy_buttons");
    element.classList.remove("animate_appear");
    element = document.getElementById("main_ticker_sell_buttons");
    element.classList.remove("animate_appear");
  }, 2450); // this number is hand-picked to cause minimum jank
}

function disable_trading_buttons(boolean_set = true) {
  let element = document.getElementById("main_ticker_button_buy1");
  element.disabled = boolean_set;
  element = document.getElementById("main_ticker_button_buyamount");
  element.disabled = boolean_set;
  element = document.getElementById("main_ticker_button_sell1");
  element.disabled = boolean_set;
  element = document.getElementById("main_ticker_button_sellamount");
  element.disabled = boolean_set;
  element = document.getElementById("start_day_button");
  element.disabled = boolean_set;
}

/*
 * Chart stuff
 */

const xValues = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
const max_data_points = 10;

/**
 * "chart_id" : chart ref
 */
var charts = {};

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

// Secondary ticker junk

function stock_list_add_remove_press(company_ticker) {
  if (!company_ticker) {
    return;
  }
  if (
    Object.values(secondary_ticker_companies).indexOf(
      ticker_to_company[company_ticker]
    ) !== -1
  ) {
    remove_from_secondary_ticker(company_ticker);
  } else {
    if (ticker_to_company[company_ticker] === primary_ticker_company) {
      remove_from_primary_ticker();
      update_company_entry_button(company_ticker);
      return;
    }
    if (!primary_ticker_company) {
      add_to_primary_ticker(company_ticker);
    } else {
      add_to_secondary_ticker(company_ticker);
    }
  }
  update_company_entry_button(company_ticker);
}

function add_to_primary_ticker(company_ticker) {
  if (!company_ticker) {
    return;
  }
  init_chart("primary", company_ticker, true);
  update_main_ticker_info();
}

function remove_from_primary_ticker() {
  if (!primary_ticker_company) {
    return;
  }
  primary_ticker_company.linked_chart = null;
  primary_ticker_company.chart_id = "";
  primary_ticker_company = "";
  let element = document.getElementById("main_ticker_info_name");
  element.textContent = "";
  element = document.getElementById("main_ticker_info_minmax");
  element.textContent = "";
  element = document.getElementById("main_ticker_info_shares");
  element.textContent = "";
  element = document.getElementById("main_ticker_info_value");
  element.textContent = "";
  charts["primary"].destroy();
  delete charts["primary"];
}

function add_to_secondary_ticker(company_ticker, override_chart_id = "") {
  if (!company_ticker) {
    return;
  }
  // Alas, JS doesn't support overloading
  if (override_chart_id) {
    if (
      Object.keys(secondary_ticker_companies).indexOf(override_chart_id) === -1
    ) {
      return;
    }
    let secondary_ticker_entry = secondary_ticker_companies[override_chart_id];
    if (secondary_ticker_entry) {
      remove_from_secondary_ticker(secondary_ticker_entry.ticker);
    }
    init_chart(override_chart_id, company_ticker, false);
    return;
  }

  let created_chart = false;
  Object.keys(secondary_ticker_companies).forEach((chart_id) => {
    if (created_chart || secondary_ticker_companies[chart_id]) {
      return; // ignore any ticker entries that already have a chart
    }

    init_chart(chart_id, company_ticker, false);
    created_chart = true;
  });
}

function remove_from_secondary_ticker(company_ticker) {
  if (!company_ticker) {
    return;
  }
  let chart_id = ticker_to_company[company_ticker].chart_id;
  let chart = charts[chart_id];
  delete charts[chart_id];
  ticker_to_company[company_ticker].linked_chart = null;
  secondary_ticker_companies[chart_id] = null;
  let element = document.getElementById(`st_info_name_${chart_id}`);
  element.textContent = "";
  element = document.getElementById(`st_info_ticker_${chart_id}`);
  element.textContent = "";
  ticker_to_company[company_ticker].chart_id = "";
  chart.destroy();
}

/*
 * Math functions
 */

function hours_to_minutes(hours) {
  return hours * 60;
}

function minutes_to_hours(minutes) {
  return minutes / 60;
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

function pretty_cash() {
  let final_string = cash.toLocaleString();
  final_string = final_string.concat(".00");
  return final_string;
}

function random_num(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

// Time stuff
/**
 * Dict of "month" : days in month. Leap years do not exist.
 */
var month_to_days = {
  January: 31,
  February: 28,
  March: 31,
  April: 30,
  May: 31,
  June: 30,
  July: 31,
  August: 31,
  September: 30,
  October: 31,
  November: 30,
  December: 31,
};

function advance_day() {
  current_day++;
  if (current_day > month_to_days[current_month]) {
    advance_month();
    return;
  }
  update_date_time();
}

function advance_month() {
  let months = Object.keys(month_to_days);
  let month_number = months.indexOf(current_month) + 1;
  if (month_number >= 12) {
    advance_year();
    return;
  }
  current_day = 1;
  current_month = months[month_number];
  update_date_time();
}

function advance_year() {
  current_day = 1;
  current_month = "January";
  current_year++;
  update_date_time();
}

/*
 * Trading day tick
 */

/**
 * How much cash the user is starting with today
 */
var starting_cash = 0;

/**
 * How many shares the user is starting with today
 */
var starting_shares = {};

/**
 * Ref to the interval object for the trading day
 */
var day_interval;

/**
 * If the trading day is currently going
 */
var day_in_progress = false;

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

function start_trading_day() {
  current_time = start_time;
  starting_cash = cash;
  Object.assign(starting_shares, owned_stocks);
  start_interval();
  set_company_trajectory();
  set_predictor_values();
  company_list.forEach((company) => {
    company.on_day_start();
  });
}

function set_company_trajectory() {
  company_list.forEach((company) => {
    company.set_daily_trajectory();
  });
}

function set_predictor_values() {
  if (!predictor_enabled) {
    return;
  }
  let text_value = "";
  let text_color = "";
  company_list.forEach((company) => {
    if (Math.random() < predictor_chance) {
      // Chance succeeded
      if (Math.random() < predictor_accuracy_chance) {
        // The prediction is accurate
        if (company.daily_trajectory < 0) {
          text_value = "Fall";
          text_color = "#b32720";
        } else if (company.daily_trajectory > 0) {
          text_value = "Rise";
          text_color = "#34a333";
        } else {
          text_value = "None";
          text_color = "#d9d9db";
        }
      } else {
        // It wasn't accurate, pick one at random
        let random_value = Math.random();
        if (random_value <= 0.33) {
          text_value = "Fall";
          text_color = "#b32720";
        } else if (random_value <= 0.67) {
          text_value = "Rise";
          text_color = "#34a333";
        } else {
          text_value = "None";
          text_color = "#d9d9db";
        }
      }
    } else {
      // Chance failed, we dunno
      text_value = "????";
      text_color = "#d9d9db";
    }
    let element = document.getElementById(
      `stock_list_predictor_${company.ticker}`
    );
    element.textContent = text_value;
    element.style.color = text_color;
  });
}

function end_trading_day() {
  day_in_progress = false;
  clearInterval(day_interval);
  set_day_end_report(true);
  update_headrow_buttons();
}

function start_interval() {
  day_interval = setInterval(function () {
    on_day_tick();
  }, time_per_tick);
}

function on_day_tick() {
  advance_time();
  update_company_prices();
  update_main_ticker_info();
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
 * User data
 */

/**
 * Dict of ticker : share amount that the user owns
 */
var owned_stocks = {};

/**
 * The current amount of money the user has
 */
var cash = 1000;

var predictor_enabled = false;
var predictor_chance = 0;
var predictor_accuracy_chance = 0;

function enable_predictor(chance, accuracy_chance) {
  if (predictor_enabled) {
    predictor_chance = Math.max(predictor_chance, chance);
    predictor_accuracy_chance = Math.max(
      predictor_accuracy_chance,
      accuracy_chance
    );
    return;
  }
  predictor_enabled = true;
  predictor_chance = chance;
  predictor_accuracy_chance = accuracy_chance;
  company_list.forEach((company) => {
    let div_element = document.getElementById(
      `stock_list_button_div_${company.ticker}`
    );
    let new_div = document.createElement("div");
    new_div.classList.add("text_color");
    new_div.classList.add("predictor_text");
    div_element.appendChild(new_div);
    new_div.id = `stock_list_predictor_${company.ticker}`;
    new_div.textContent = "";
    new_div.title = "Daily trend prediction";
  });
}

function adjust_cash(amount) {
  if (!amount) {
    return;
  }
  cash = Math.max(0, cash + amount);
  update_cash();
}

function update_cash() {
  let element = document.getElementById("cash_count");
  element.textContent = `Current Funds: $${pretty_cash()}`;
}

function adjust_shares(company_ticker, amount = 1) {
  owned_stocks[company_ticker] = Math.max(
    0,
    parseFloat(owned_stocks[company_ticker]) + parseFloat(amount)
  );
}

function buy_shares(company_ticker, amount = 1) {
  if (!company_ticker) {
    return;
  }
  let company = ticker_to_company[company_ticker];
  if (cash < company.current_price * amount) {
    return;
  }
  adjust_cash(-(company.current_price * amount));
  adjust_shares(company_ticker, amount);
}

function sell_shares(company_ticker, amount = 1) {
  if (!company_ticker) {
    return;
  }
  let company = ticker_to_company[company_ticker];
  if (owned_stocks[company_ticker] < amount) {
    amount = owned_stocks[company_ticker];
  }
  adjust_shares(company_ticker, -amount);
  adjust_cash(company.current_price * amount);
}

function get_shares_value() {
  let total = 0;
  Object.keys(owned_stocks).forEach((ticker) => {
    total += parseFloat(
      ticker_to_company[ticker].current_price * parseInt(owned_stocks[ticker])
    );
  });
  return total;
}

function get_share_count() {
  let total = 0;
  Object.keys(owned_stocks).forEach((ticker) => {
    total += parseInt(owned_stocks[ticker]);
  });
  return total;
}

function get_share_difference() {
  let cash_total = 0;
  let share_total = 0;
  Object.keys(owned_stocks).forEach((ticker) => {
    let share_delta =
      parseInt(owned_stocks[ticker]) - parseInt(starting_shares[ticker]);
    share_total += share_delta;
    cash_total += share_delta * ticker_to_company[ticker].current_price;
  });
  return [share_total, cash_total];
}

/*
 * UI button interactions
 */

/**
 * String ID of the currently focused page
 */

const PAGE_INFO = "information_interface";
const PAGE_TRADE = "trade_interface";
const PAGE_UPGRADE = "upgrade_interface";

var current_page = PAGE_TRADE;

// Header buttons

function headrow_trade() {
  let element = document.getElementById(PAGE_TRADE);
  element.style.display = "block";
  element = document.getElementById(PAGE_INFO);
  element.style.display = "none";
  element = document.getElementById(PAGE_UPGRADE);
  element.style.display = "none";
  current_page = PAGE_TRADE;
  set_button_select_color("headrow_info_button", false);
  set_button_select_color("headrow_trade_button", true);
  set_button_select_color("headrow_upgrade_button", false);
}

function headrow_info() {
  let element = document.getElementById(PAGE_TRADE);
  element.style.display = "none";
  element = document.getElementById(PAGE_INFO);
  element.style.display = "block";
  element = document.getElementById(PAGE_UPGRADE);
  element.style.display = "none";
  current_page = PAGE_INFO;
  set_button_select_color("headrow_info_button", true);
  set_button_select_color("headrow_trade_button", false);
  set_button_select_color("headrow_upgrade_button", false);
}

function headrow_upgrades() {
  let element = document.getElementById(PAGE_TRADE);
  element.style.display = "none";
  element = document.getElementById(PAGE_INFO);
  element.style.display = "none";
  element = document.getElementById(PAGE_UPGRADE);
  element.style.display = "block";
  current_page = PAGE_UPGRADE;
  set_button_select_color("headrow_info_button", false);
  set_button_select_color("headrow_trade_button", false);
  set_button_select_color("headrow_upgrade_button", true);
}

function set_button_select_color(button_id = "", selected = true) {
  if (!button_id) {
    return;
  }
  let button = document.getElementById(button_id);
  if (!button) {
    return;
  }

  button.style.borderBottomColor = selected ? "#3232b8" : "#5a5a94";
  button.style.boxShadow = selected
    ? "inset 0 -18px 18px -18px #3232b8"
    : "none";
}

// Save button code
function save_button_press() {
  if (day_in_progress) {
    return;
  }
  company_list.forEach((company) => {
    document.cookie = `${
      company.ticker
    }_chartdata=${company.chart_data.toString()}`;
  });
  document.cookie = `primary_ticker=${
    primary_ticker_company?.ticker || "none"
  }`;
  let secondary_ticker_copy = {};
  Object.assign(secondary_ticker_copy, secondary_ticker_companies);
  Object.keys(secondary_ticker_companies).forEach((chart_id) => {
    secondary_ticker_copy[chart_id] =
      secondary_ticker_companies[chart_id]?.ticker || null;
  });
  document.cookie = `secondary_tickers=${JSON.stringify(
    secondary_ticker_copy
  )}`;
  document.cookie = `player_cash=${cash}`;
  document.cookie = `player_shares=${JSON.stringify(owned_stocks)}`;
}

function load_button_press() {
  if (day_in_progress) {
    return;
  }
  let decoded_cookie = decodeURIComponent(document.cookie);
  let cookie_elements = decoded_cookie.split(";");
  cookie_elements.forEach((element) => {
    let key_value = element.split("=");
    let ticker_type = key_value[0].split("_");
    if (ticker_type[1] === "chartdata") {
      ticker_to_company[ticker_type[0]].chart_data = parse_cookie_chartdata(
        key_value[1]
      );
      return;
    }
    switch (key_value[0]) {
      case "player_cash":
        cash = parseFloat(key_value[1]);
        break;

      case "player_shares":
        owned_stocks = JSON.parse(key_value[1]);
        break;

      case "primary_ticker":
        if (key_value[1] !== "none") {
          remove_from_primary_ticker();
          add_to_primary_ticker(ticker_to_company[key_value[1]]);
          break;
        }

      case "secondary_tickers":
        let ticker_dict = JSON.parse(key_value[1]);
        Object.keys(ticker_dict).forEach((chart_id) => {
          let dict_value = ticker_dict[chart_id];
          if (dict_value == null) {
            if (secondary_ticker_companies[chart_id] != null) {
              remove_from_secondary_ticker(
                secondary_ticker_companies[chart_id]
              );
            }
          } else {
            if (secondary_ticker_companies[chart_id] != null) {
              remove_from_secondary_ticker(
                secondary_ticker_companies[chart_id]
              );
            }
            add_to_secondary_ticker(dict_value);
          }
        });
        break;
    }
  });
}

function parse_cookie_chartdata(chart_data = "") {
  return chart_data.split(",");
}

function new_save_press() {
  current_day = 18;
  current_month = "October";
  current_year = 2023;
  cash = 1000;
  owned_stocks = {};
  company_list.forEach((company) => {
    owned_stocks[company.ticker] = 0;
  });
  set_save_load_menu(false);
  // todo: add something to reset the prices of stocks maybe?
}

function set_save_load_menu(open = true) {
  if (day_in_progress) {
    return;
  }

  if (open) {
    dim_screen();
    let element = document.getElementById("save_load_menu");
    element.style.display = "block";
  } else {
    undim_screen();
    let element = document.getElementById("save_load_menu");
    element.style.display = "none";
  }
}

function update_headrow_buttons() {
  if (day_in_progress) {
    let element = document.getElementById("save_load_button");
    element.disabled = true;
    element = document.getElementById("headrow_upgrade_button");
    element.disabled = true;
  } else {
    let element = document.getElementById("save_load_button");
    element.disabled = false;
    element = document.getElementById("headrow_upgrade_button");
    element.disabled = false;
  }
}

// Confirmation button pop-up code

/**
 * How many shares the user is looking to buy/sell currently
 */
var share_buy_sell_amount = 0;

const CONFIRM_BUY = "buy";
const CONFIRM_SELL = "sell";

/**
 * If the user is looking to buy or sell with the current confirmation menu
 */
var buy_or_sell_confirmation_menu = CONFIRM_BUY;

function dim_screen() {
  let element = document.getElementById("dimmer");
  element.style.display = "block";
  if (day_in_progress) {
    clearInterval(day_interval); // we pause the game during anything that would dim the main screen
  }
}

function undim_screen() {
  let element = document.getElementById("dimmer");
  element.style.display = "none";
  if (day_in_progress) {
    start_interval(); // todo: this will start you off at the full 5s again
  }
}

function set_day_end_report(on = true) {
  if (on) {
    dim_screen();
    let element = document.getElementById("day_end_report_funds");
    if (cash >= starting_cash) {
      element.textContent = `Cash Earned: $${cash - starting_cash}`;
      if (cash == starting_cash) {
        element.style.color = "#d9d9db";
      } else {
        element.style.color = "#34a333";
      }
    } else {
      element.textContent = `Cash Lost: -$${Math.abs(cash - starting_cash)}`;
      element.style.color = "#b32720";
    }

    element = document.getElementById("day_end_report_shares");
    let return_string = "Shares Acquired: ";
    Object.keys(owned_stocks).forEach((ticker) => {
      let amount =
        parseInt(owned_stocks[ticker]) - parseInt(starting_shares[ticker]);
      if (amount == 0) {
        return; // acts as a continue because of how forEach works
      }
      return_string = return_string.concat(`<br><b>${ticker}</b>: ${amount}`);
    });
    element.innerHTML = return_string;

    element = document.getElementById("day_end_report");
    element.style.display = "block";
  } else {
    undim_screen();
    let element = document.getElementById("day_end_report");
    element.style.display = "none";
  }
}

function day_end_report_continue() {
  advance_day();
  trading_day_button_appear();
  set_day_end_report(false);
}

function set_buy_confirmation(on = true) {
  if (on) {
    calculate_buy_confirmation();
    set_share_buy_sell_amount(0);
    dim_screen();
    buy_or_sell_confirmation_menu = CONFIRM_BUY;
    let element = document.getElementById("buy_sell_confirmation_question");
    element.textContent = `How many shares of ${primary_ticker_company.ticker} would you like to purchase?`;
    element = document.getElementById("buy_sell_confirmation");
    element.style.display = "block";
  } else {
    let element = document.getElementById("buy_sell_confirmation");
    element.style.display = "none";
    undim_screen();
  }
}

function set_sell_confirmation(on = true) {
  if (on) {
    calculate_sell_confirmation();
    set_share_buy_sell_amount(0);
    dim_screen();
    buy_or_sell_confirmation_menu = CONFIRM_SELL;
    let element = document.getElementById("buy_sell_confirmation_question");
    element.textContent = `How many shares of ${primary_ticker_company.ticker} would you like to sell?`;
    element = document.getElementById("buy_sell_confirmation");
    element.style.display = "block";
  } else {
    let element = document.getElementById("buy_sell_confirmation");
    element.style.display = "none";
    undim_screen();
  }
}

function calculate_buy_confirmation() {
  let maximum_buy_amount = Math.max(
    0,
    Math.trunc(cash / primary_ticker_company.current_price)
  );
  let element = document.getElementById("buy_sell_slider");
  element.max = maximum_buy_amount;
  element = document.getElementById("buy_sell_input");
  element.max = maximum_buy_amount;
  element = document.getElementById("buy_sell_confirm_button");
  element.textContent = `Confirm ($0)`;
}

function calculate_sell_confirmation() {
  let maximum_sell_amount = owned_stocks[primary_ticker_company.ticker];
  let element = document.getElementById("buy_sell_slider");
  element.max = maximum_sell_amount;
  element = document.getElementById("buy_sell_input");
  element.max = maximum_sell_amount;
  element = document.getElementById("buy_sell_confirm_button");
  element.textContent = `Confirm ($0)`;
}

function set_share_buy_sell_amount(amount) {
  share_buy_sell_amount = amount;
  let element = document.getElementById("buy_sell_slider");
  element.value = share_buy_sell_amount;
  element = document.getElementById("buy_sell_input");
  element.value = share_buy_sell_amount;
}

function on_confirmation_input_change() {
  let input_element = document.getElementById("buy_sell_input");
  if (buy_or_sell_confirmation_menu === CONFIRM_BUY) {
    input_element.value = Math.max(
      0,
      Math.min(
        input_element.value,
        Math.trunc(cash / primary_ticker_company.current_price)
      )
    );
  } else if (buy_or_sell_confirmation_menu === CONFIRM_SELL) {
    input_element.value = Math.max(
      0,
      Math.min(input_element.value, owned_stocks[primary_ticker_company.ticker])
    );
  }
  let slider_element = document.getElementById("buy_sell_slider");
  slider_element.value = input_element.value;
  share_buy_sell_amount = input_element.value;
  let element = document.getElementById("buy_sell_confirm_button");
  element.textContent = `Confirm ($${
    input_element.value * primary_ticker_company.current_price
  })`;
}

function on_confirmation_slider_change() {
  let input_element = document.getElementById("buy_sell_input");
  let slider_element = document.getElementById("buy_sell_slider");
  input_element.value = slider_element.value;
  share_buy_sell_amount = slider_element.value;
  let element = document.getElementById("buy_sell_confirm_button");
  element.textContent = `Confirm ($${
    input_element.value * primary_ticker_company.current_price
  })`;
}

function on_confirmation_cancel() {
  set_buy_confirmation(false);
}

function on_confirmation_buy_sell() {
  if (buy_or_sell_confirmation_menu === CONFIRM_BUY) {
    adjust_cash(
      -(share_buy_sell_amount * primary_ticker_company.current_price)
    );
    adjust_shares(primary_ticker_company.ticker, share_buy_sell_amount);
    set_buy_confirmation(false);
    update_main_ticker_info();
  } else if (buy_or_sell_confirmation_menu === CONFIRM_SELL) {
    adjust_cash(share_buy_sell_amount * primary_ticker_company.current_price);
    adjust_shares(primary_ticker_company.ticker, -share_buy_sell_amount);
    set_sell_confirmation(false);
    update_main_ticker_info();
  }
}

function secondary_ticker_click(chart_id = "") {
  if (!chart_id) {
    return;
  }
  let second_ticker_company = secondary_ticker_companies[chart_id];
  if (!second_ticker_company) {
    if (!primary_ticker_company) {
      // We're okay with no secondary ticker only if there is a primary ticker company
      return;
    }
    let main_ticker_company = primary_ticker_company;
    remove_from_primary_ticker();
    add_to_secondary_ticker(main_ticker_company.ticker, chart_id);
    return;
  }
  let main_ticker_company = primary_ticker_company;
  remove_from_primary_ticker();
  remove_from_secondary_ticker(second_ticker_company.ticker);
  add_to_secondary_ticker(main_ticker_company.ticker, chart_id);
  add_to_primary_ticker(second_ticker_company.ticker);
}

// Buy/sell buttons

function buy_button_1_press() {
  if (!primary_ticker_company) {
    return;
  }
  buy_shares(primary_ticker_company.ticker, 1);
  update_main_ticker_info();
}

function buy_button_amount_press() {
  if (!primary_ticker_company) {
    return;
  }
  set_buy_confirmation(true);
}

function sell_button_1_press() {
  if (!primary_ticker_company) {
    return;
  }
  sell_shares(primary_ticker_company.ticker, 1);
  update_main_ticker_info();
}

function sell_button_amount_press() {
  if (!primary_ticker_company) {
    return;
  }
  set_sell_confirmation(true);
}

function start_day_button_press() {
  trading_day_button_disappear();
  day_in_progress = true;
  update_headrow_buttons();
  setTimeout(function () {
    start_trading_day();
  }, 2000); // long enough for the animation to settle
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
As you earn more money, more tools and trading options will become available for you to use.
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

    case INFO_TAB_GAME:
      focused_info_tab = INFO_SUBTAB_GAME_READING;
      set_button_return();

      element = document.getElementById("info_body");
      element.innerHTML = `
Much like real life, the price of a given stock cannot be fully predicted, but you may be able to identify trends and profit from them.
Some days, a company's price may fluctuate, but will not shift upwards or downwards in the long term.
Other days, the price of a company may permanently shift upwards or downwards by a signficant percentage.
This doesn't have an indicator and happens gradually over the day, so you will need to be astute in order to take advantage of the market.
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
  let element;
  switch (focused_info_tab) {
    case INFO_TAB_BASIC:
      focused_info_tab = INFO_SUBTAB_BASIC_READING;
      set_button_return();

      element = document.getElementById("info_body");
      element.innerHTML = `
The stock market is a good way to invest money you aren't using now to let it grow for a later time.
While banks will do this to a degree, the return value you get from leaving your money in a savings account is almost always outstripped by what you can make on the stock market.
If you want to invest in the stock market, do your research and pick companies with a proven, successful track record, like Google or Microsoft.
The stock market, when played conservatively and wisely, will rarely lose you money if you purchase shares of companies and let their value increase over time.
Day trading, like what is present in this website, is far riskier.<br><br>
Day trading requires hours of rapt attention, a lot of research, and even then can incur losses.
If you're looking to invest in the stock market, the wise option is to speak to someone experienced that you trust.
        `;
      break;
  }
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
  element.textContent = "1.4: Why should I invest in the stock market?";
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
  element.textContent = "3.2: Stock Movement";
  element = document.getElementById("info_button_3");
  element.textContent = "3.3: Empty";
  element = document.getElementById("info_button_4");
  element.textContent = "3.4: Empty";
  element = document.getElementById("info_button_5");
  element.textContent = "Return";
  element = document.getElementById("info_body");
  element.innerHTML = "";
}
