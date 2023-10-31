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
