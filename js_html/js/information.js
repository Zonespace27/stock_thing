// Info buttons

// Const variables for `focused_info_tab` to be set to
const INFO_SUBTAB_BASIC_READING = "basic_reading";
const INFO_SUBTAB_GAME_READING = "game_reading";
const INFO_TAB_BASIC = "basic";
const INFO_TAB_NONE = "none";
const INFO_TAB_GAME = "game";

/**
 * The currently focused information tab
 */
var focused_info_tab = INFO_TAB_NONE;

/**
 * Function for when the 1st info button is pressed
 */
function info_button_1_press() {
  let element;
  switch (focused_info_tab) {
    case INFO_TAB_NONE:
      set_tab_basic();
      break;

    case INFO_TAB_BASIC:
      focused_info_tab = INFO_SUBTAB_BASIC_READING;
      set_button_return();

      element = document.getElementById("info_body");
      element.innerHTML = `
The stock market is an exchange where shares (also called stocks) in various companies are bought and sold.<br><br>
Shares are representative of a portion of ownership in a company, though one share is almost always worth too little for it to truly be considered company ownership. 
Instead, shares are bought and sold in the stock market as a purely financial transaction for the purpose of profit. 
If a company is percieved to do well, people will want to purchase its stock, which increases demand, which raises the price.
      `;
      break;

    case INFO_TAB_GAME:
      focused_info_tab = INFO_SUBTAB_GAME_READING;
      set_button_return();

      element = document.getElementById("info_body");
      element.innerHTML = `
The game is a trading simulator, where you are tasked to make as much money as possible. 
To do this, you have access to a trading console where you are able to trade shares of companies over the course of a trading day.
As you earn more money, more tools and trading options will become available for you to use.
      `;
      break;
  }
}

/**
 * Function for when the 2nd info button is pressed
 */
function info_button_2_press() {
  let element;
  switch (focused_info_tab) {
    case INFO_TAB_BASIC:
      focused_info_tab = INFO_SUBTAB_BASIC_READING;
      set_button_return();

      element = document.getElementById("info_body");
      element.innerHTML = `
The purpose of the stock market is twofold.<br><br>
The first is that companies are able to raise money by putting shares for public sale. 
When an investor buys a share from the company, the money will be given to the company in exchange. 
This allows companies to fund more growth and development without finding a private investor.<br><br>
The second is for the investor to earn money. 
The first and most common way of earning money from investing is through capital appreciation.
When the stock appreciates, the investor can sell it for the increased value, potentially profiting. 
The second is that some forms of shares provide a dividend on fixed intervals, giving the investor a direct share of the profits from the company.
        `;
      break;

    case INFO_TAB_GAME:
      focused_info_tab = INFO_SUBTAB_GAME_READING;
      set_button_return();

      element = document.getElementById("info_body");
      element.innerHTML = `
Much like real life, the price of a given stock cannot be fully predicted, but you may be able to identify trends and profit from them.
Some days, a company's price may fluctuate, but will not shift upwards or downwards in the long term.
Other days, the price of a company may permanently shift upwards or downwards by a signficant percentage.
This doesn't have an indicator and happens gradually over the day, so you will need to be astute in order to take advantage of the market.
        `;
      break;
  }
}

/**
 * Function for when the 3rd info button is pressed
 */
function info_button_3_press() {
  let element;
  switch (focused_info_tab) {
    case INFO_TAB_NONE:
      set_tab_game();
      break;

    case INFO_TAB_BASIC:
      focused_info_tab = INFO_SUBTAB_BASIC_READING;
      set_button_return();

      element = document.getElementById("info_body");
      element.innerHTML = `
The economy and the stock market are entirely different machines, but they can often affect each other. 
If the economy is on the rise, more people will have the money to invest, which raises demand for stocks. 
The inverse of this is true as well; should there be less economic stability, stocks will fall in price. 
For instance, the NASDAQ Composite Index, an index of the average stock price of more than 3300 companies, had an immediate downturn of over 30% during April and March 2020.
As you likely know, this was when the COVID-19 pandemic began. 
This downturn went hand-in-hand with a fall in consumer spending of around 30% as well.<br><br>
The stock market can affect the economy, as well. 
In late 1929, a long period of speculative trading utilizing loaned money began to decay, causing the entire stock market to go into rapid free-fall. 
By 1932 the Dow Jones Industrial Average, another aggregate index, had fallen to almost 10% of its value 3 years before. 
The money and economic faith lost were the primary causes of the Great Depression, which lasted until 1939.
          `;
      break;
  }
}

/**
 * Function for when the 4th info button is pressed
 */
function info_button_4_press() {
  let element;
  switch (focused_info_tab) {
    case INFO_TAB_BASIC:
      focused_info_tab = INFO_SUBTAB_BASIC_READING;
      set_button_return();

      element = document.getElementById("info_body");
      element.innerHTML = `
The stock market is a good way to invest money you aren't using now to let it grow for a later time.
While banks will do this to a degree, the return value you get from leaving your money in a savings account is almost always outstripped by what you can make on the stock market.
If you want to invest in the stock market, do your research and pick companies with a proven, successful track record, like Google or Microsoft.
The stock market, when played conservatively and wisely, will rarely lose you money if you purchase shares of companies and let their value increase over time.
Day trading, like what is present in this website, is far riskier.<br><br>
Day trading requires hours of rapt attention, a lot of research, and even then can incur losses.
If you're looking to invest in the stock market, the wise option is to speak to someone experienced that you trust.
        `;
      break;
  }
}

/**
 * Function for when the 5th info button is pressed
 */
function info_button_5_press() {
  switch (focused_info_tab) {
    case INFO_TAB_BASIC:
    case INFO_TAB_GAME:
      set_tab_none();
      break;

    case INFO_SUBTAB_BASIC_READING:
      set_tab_basic();
      break;

    case INFO_SUBTAB_GAME_READING:
      set_tab_game();
      break;
  }
}

// Button helpers

/**
 * Sets all the information buttons (minus #5) to blank, with button #5 becoming the return button
 */
function set_button_return() {
  let element;
  element = document.getElementById("info_button_1");
  element.textContent = "";
  element = document.getElementById("info_button_2");
  element.textContent = "";
  element = document.getElementById("info_button_3");
  element.textContent = "";
  element = document.getElementById("info_button_4");
  element.textContent = "";
  element = document.getElementById("info_button_5");
  element.textContent = "Return";
}

/**
 * Sets the information tab to the main screen
 */
function set_tab_none() {
  let element;
  focused_info_tab = INFO_TAB_NONE;
  element = document.getElementById("info_button_1");
  element.textContent = "1: Basics";
  element = document.getElementById("info_button_2");
  element.textContent = "2: Empty";
  element = document.getElementById("info_button_3");
  element.textContent = "3: Game";
  element = document.getElementById("info_button_4");
  element.textContent = "4: Empty";
  element = document.getElementById("info_button_5");
  element.textContent = "5: Empty";
  element = document.getElementById("info_body");
  element.innerHTML = "";
}

/**
 * Sets the information tab to the basic screen
 */
function set_tab_basic() {
  let element;
  focused_info_tab = INFO_TAB_BASIC;
  element = document.getElementById("info_button_1");
  element.textContent = "1.1: What is the stock market?";
  element = document.getElementById("info_button_2");
  element.textContent = "1.2: What purpose does the stock market achieve?";
  element = document.getElementById("info_button_3");
  element.textContent =
    "1.3: How does the stock market interact with the economy?";
  element = document.getElementById("info_button_4");
  element.textContent = "1.4: Why should I invest in the stock market?";
  element = document.getElementById("info_button_5");
  element.textContent = "Return";
  element = document.getElementById("info_body");
  element.innerHTML = "";
}

/**
 * Sets the information tab to the game screen
 */
function set_tab_game() {
  let element;
  focused_info_tab = INFO_TAB_GAME;
  element = document.getElementById("info_button_1");
  element.textContent = "3.1: About";
  element = document.getElementById("info_button_2");
  element.textContent = "3.2: Stock Movement";
  element = document.getElementById("info_button_3");
  element.textContent = "3.3: Empty";
  element = document.getElementById("info_button_4");
  element.textContent = "3.4: Empty";
  element = document.getElementById("info_button_5");
  element.textContent = "Return";
  element = document.getElementById("info_body");
  element.innerHTML = "";
}
