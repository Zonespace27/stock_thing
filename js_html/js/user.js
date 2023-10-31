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

/**
 * If the user has the predictor upgrade currently enabled
 */
var predictor_enabled = false;

/**
 * The chance for the predictor to work
 */
var predictor_chance = 0;

/**
 * The chance for the predictor to be accurate
 */
var predictor_accuracy_chance = 0;

/**
 * Enables the predictor. If already enabled, sets the predictor values to the existing values or the new ones, whichever are larger.
 * @param {number} chance
 * @param {number} accuracy_chance
 * @returns void
 */
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

/**
 * Increases/decreases player cash
 * @param {number} amount
 * @returns void
 */
function adjust_cash(amount) {
  if (!amount) {
    return;
  }
  cash = Math.max(0, cash + amount);
  update_cash();
}

/**
 * Updates the bottom row's cash visual
 */
function update_cash() {
  let element = document.getElementById("cash_count");
  element.textContent = `Current Funds: $${pretty_cash()}`;
}

/**
 * Adjusts the amount of shares the user has in a company
 * @param {string} company_ticker
 * @param {number} amount
 */
function adjust_shares(company_ticker, amount = 1) {
  owned_stocks[company_ticker] = Math.max(
    0,
    parseFloat(owned_stocks[company_ticker]) + parseFloat(amount)
  );
}

/**
 * Attempts to purchase an amount of shares from a specific company
 * @param {string} company_ticker
 * @param {number} amount
 * @returns void
 */
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

/**
 * Attempts to sell an amount of shares of a specific company
 * @param {string} company_ticker
 * @param {number} amount
 * @returns void
 */
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
