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

// This is what makes everything work; it doesn't need its own file, so it can go here.
// Don't touch
document.addEventListener(
  "DOMContentLoaded",
  function () {
    list_companies();
    update_company_prices();
    update_main_ticker_info();
    update_cash();
    update_all_company_entry_buttons();
    set_button_select_color("headrow_trade_button", true);
    create_upgrade_dict();
  },
  false
);
