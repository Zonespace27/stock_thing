/**
 * Makes the current time look good, returns the format of "8:00 AM, August 21, 2023"
 * @returns string
 */
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

/**
 * Advances the current day by one. If this would move to the next month, call `advance_month()`
 * @returns void
 */
function advance_day() {
  current_day++;
  if (current_day > month_to_days[current_month]) {
    advance_month();
    return;
  }
  update_date_time();
}

/**
 * Advances the current month by one. If this would move to the next year, call `advance_year()`
 * @returns void
 */
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

/**
 * Advances the current year by 1, resetting month/day to Jan 1st
 */
function advance_year() {
  current_day = 1;
  current_month = "January";
  current_year++;
  update_date_time();
}

/**
 * Advances the game time by `advance_amount`
 */
function advance_time() {
  current_time += advance_amount;
  update_date_time();
}

/**
 * Updates the bottom row's date & time
 */
function update_date_time() {
  let element = document.getElementById("date_time");
  element.textContent = pretty_time();
}
