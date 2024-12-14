export const config = {
  data_streams: {
    pairs: ["xrpusdt@trade", "btcusdt@trade"],
    min_price: 25000,
    min_price_whale: 50000,
    dump_file_name: "src/dumps/binance_trades.csv",
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
