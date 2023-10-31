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

function pretty_cash() {
  let final_string = cash.toLocaleString();
  final_string = final_string.concat(".00");
  return final_string;
}

function random_num(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}
