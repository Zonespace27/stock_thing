/*
 * UI button interactions
 */

const PAGE_INFO = "information_interface";
const PAGE_TRADE = "trade_interface";
const PAGE_UPGRADE = "upgrade_interface";

/**
 * String ID of the currently focused page
 */
var current_page = PAGE_TRADE;

// Header buttons

/**
 * Change the main page to the trading interface
 */
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

/**
 * Change the main page to the information interface
 */
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

/**
 * Change the main page to the upgrade interface
 */
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

/**
 * Will set the selected status/visuals of a button dependent on the `selected` argument
 * @param {string} button_id
 * @param {boolean} selected
 * @returns void
 */
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

/**
 * Updates the header's buttons dependent on if the day is in progress or not.
 */
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

/**
 * Show the screen dimmer, preventing the user from interacting with the main screen
 */
function dim_screen() {
  let element = document.getElementById("dimmer");
  element.style.display = "block";
  if (day_in_progress) {
    clearInterval(day_interval); // we pause the game during anything that would dim the main screen
  }
}

/**
 * Hide the screen dimmer, allowing the user to interact with the screen as normal
 */
function undim_screen() {
  let element = document.getElementById("dimmer");
  element.style.display = "none";
  if (day_in_progress) {
    start_interval(); // todo: this will start you off at the full 5s again
  }
}

/**
 * Shows or hides the day end report dependent on the boolean `on`
 * @param {boolean} on
 */
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

/**
 * Triggered when the user presses continue on the day end report, moving to the next day
 */
function day_end_report_continue() {
  advance_day();
  trading_day_button_appear();
  set_day_end_report(false);
}

/**
 * Shows or hides the buy confirmation dependent on the boolean `on`
 * @param {boolean} on
 */
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

/**
 * Shows or hides the buy confirmation dependent on the boolean `on`
 * @param {boolean} on
 */
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

/**
 * Calculate and set the information for the buy confirmation
 */
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

/**
 * Calculate and set the information for the sell confirmation
 */
function calculate_sell_confirmation() {
  let maximum_sell_amount = owned_stocks[primary_ticker_company.ticker];
  let element = document.getElementById("buy_sell_slider");
  element.max = maximum_sell_amount;
  element = document.getElementById("buy_sell_input");
  element.max = maximum_sell_amount;
  element = document.getElementById("buy_sell_confirm_button");
  element.textContent = `Confirm ($0)`;
}

/**
 * Sets how many shares the user is currently looking to buy or sell
 * @param {number} amount
 */
function set_share_buy_sell_amount(amount) {
  share_buy_sell_amount = amount;
  let element = document.getElementById("buy_sell_slider");
  element.value = share_buy_sell_amount;
  element = document.getElementById("buy_sell_input");
  element.value = share_buy_sell_amount;
}

/**
 * Called whenever someone changes the input in the buy/sell confirmation menu
 */
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

/**
 * Called whenever someone changes the slider in the buy/sell confirmation menu
 */
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

/**
 * Called when the user presses cancel on the buy/sell confirmation menu
 */
function on_confirmation_cancel() {
  set_buy_confirmation(false);
}

/**
 * Called when someone confirms that they wish to buy/sell in the confirmation menu
 */
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

/**
 * Called when the user clicks on one of the secondary ticker buttons. Swaps it with the primary ticker company, if possible
 * @param {string} chart_id
 * @returns void
 */
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

/**
 * Called when the user presses the button to buy one share of a company
 * @returns void
 */
function buy_button_1_press() {
  if (!primary_ticker_company) {
    return;
  }
  buy_shares(primary_ticker_company.ticker, 1);
  update_main_ticker_info();
}

/**
 * Called when the user presses the button to buy multiple shares of a company
 * @returns void
 */
function buy_button_amount_press() {
  if (!primary_ticker_company) {
    return;
  }
  set_buy_confirmation(true);
}

/**
 * Called when the user presses the button to sell one share of a company
 * @returns void
 */
function sell_button_1_press() {
  if (!primary_ticker_company) {
    return;
  }
  sell_shares(primary_ticker_company.ticker, 1);
  update_main_ticker_info();
}

/**
 * Called when the user presses the button to sell multiple shares of a company
 * @returns void
 */
function sell_button_amount_press() {
  if (!primary_ticker_company) {
    return;
  }
  set_sell_confirmation(true);
}

/**
 * Called when someone presses the start button for the trading day. Starts the day 2s after.
 */
function start_day_button_press() {
  trading_day_button_disappear();
  day_in_progress = true;
  update_headrow_buttons();
  setTimeout(function () {
    start_trading_day();
  }, 2000); // long enough for the animation to settle
}
