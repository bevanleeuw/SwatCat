import { getVisionResponse } from "../ai-agents/vision";
(async () => {
  const res = await getVisionResponse("grok-vision-beta", "https://www.tradingview.com/x/JkFDeP48/", "What do you see on this 4H chart for xrpusdt?");
  console.log(res);
})();
