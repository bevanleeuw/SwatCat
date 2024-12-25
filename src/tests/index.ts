import { getVisionResponse } from "../ai-agents/vision";
import { insertFunding, selectAllFundingRates } from "../db";
import { dbFundingRateRecord } from "../types";

(async () => {
  const query = null;
  if (query) {
    const res = await getVisionResponse("grok-vision-beta", "https://www.tradingview.com/x/JkFDeP48/", query);
    console.log(res);
  }
})();

(async () => {
  const newFunding: dbFundingRateRecord = {
    time: 1735047837000,
    symbol: "BTC",
    fundingRate: 0.0001,
    fundingRatePerc: 0.01,
    indexPrice: 95139.0506383,
    markPrice: 95112.5,
    estimatedPrice: 94836.32856726,
    payer: "Long",
  };

  if (newFunding.symbol) {
    await insertFunding(newFunding);
    const fundingRates = await selectAllFundingRates();
    return fundingRates;
  }
})();
