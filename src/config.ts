export const config = {
  settings: {
    db_name_tracker: "src/dumps/main.db", // Sqlite Database location
  },
  data_streams: {
    orders: {
      pairs: ["xrpusdt@trade", "btcusdt@trade"],
      min_price: 25000,
      min_price_whale: 50000,
      dump_file_name: "src/dumps/binance_trades.csv",
    },
    funding: {
      position_value: 25000,
      pairs: [
        "xrpusdt@markPrice",
        "btcusdt@markPrice",
        "atomusdt@markPrice",
        "adausdt@markPrice",
        "dogeusdt@markPrice",
        "neousdt@markPrice",
        "dotusdt@markPrice",
      ],
    },
  },
  data_scrape: {
    run_headless: false,
  },
  ai_agents: {
    x_vision_model: "grok-vision-beta",
    openai_vision_model: "gpt-4o-mini",
    charts: [
      "4h@xrpusdt@https://www.tradingview.com/chart/UrkcEDao/",
      "4h@btcusdt@https://www.tradingview.com/chart/17ZKVGzu/",
      "4h@solusdt@https://www.tradingview.com/chart/17ZKVGzu/",
    ],
  },
  my_system: {
    default_browser: "C:/Program Files/Google/Chrome/Application/chrome.exe", // Replace with the path to your browser
    default_browser_data: "C:/Users/bevan/AppData/Local/Google/Chrome/User Data", // Replace with the path to your browser's user data directory
  },
};
