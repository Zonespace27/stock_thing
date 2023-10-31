/*
 * Math functions
 */

/**
 * Takes a number of hours and returns the value in minutes
 * @param {number} hours
 * @returns number
 */
function hours_to_minutes(hours) {
  return hours * 60;
}

/**
 * Takes a number of minutes and returns the value in hours
 * @param {number} minutes
 * @returns number
 */
function minutes_to_hours(minutes) {
  return minutes / 60;
}

/**
 * Takes a number of seconds and returns the value in miliseconds
 * @param {number} seconds
 * @returns number
 */
function seconds_to_ms(seconds) {
  return seconds * 1000;
}

/**
 * Returns a good-looking version of the player's current cash in the form of "123,456,789.00"
 * @returns string
 */
function pretty_cash() {
  let final_string = cash.toLocaleString();
  final_string = final_string.concat(".00");
  return final_string;
}

/**
 * Returns a random float number between two numbers
 * @param {number} min
 * @param {number} max
 * @returns number
 */
function random_num(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}
