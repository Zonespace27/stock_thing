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

/**
 * Start the trading day, calling and setting what's necessary
 */
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

/**
 * Call `set_daily_trajectory()` on every company
 */
function set_company_trajectory() {
  company_list.forEach((company) => {
    company.set_daily_trajectory();
  });
}

/**
 * Should the player have the predictor upgrades, attempt to predict the movement of all stock companies.
 * @returns void
 */
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

/**
 * End the trading day
 */
function end_trading_day() {
  day_in_progress = false;
  clearInterval(day_interval);
  set_day_end_report(true);
  update_headrow_buttons();
}

/**
 * The thing that calls the game tick every `time_per_tick`
 */
function start_interval() {
  day_interval = setInterval(function () {
    on_day_tick();
  }, time_per_tick);
}

/**
 * Called every `time_per_tick`, effectively the game's update cycle
 */
function on_day_tick() {
  advance_time();
  update_company_prices();
  update_main_ticker_info();
  if (current_time >= end_time) {
    end_trading_day();
  }
  tick_upgrades();
}
