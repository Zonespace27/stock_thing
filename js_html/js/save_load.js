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
