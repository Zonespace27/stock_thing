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
