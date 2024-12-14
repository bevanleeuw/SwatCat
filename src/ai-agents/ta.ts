import dotenv from "dotenv"; // zero-dependency module that loads environment variables from a .env
import chalk from "chalk"; // Library for terminal styling
import { config } from "../config"; // Configuration parameters for our bot
import puppeteer from "puppeteer"; // Puppeteer is a JavaScript library which provides a high-level API to control Chrome or Firefox
import { getVisionResponse } from "./vision";
import { VisionModelAnalysisResponse } from "../types";

// Load environment variables from the .env file
dotenv.config();

// Create a new browser
let browser: any;
async function initBrowser() {
  browser = await puppeteer.launch({
    headless: config.data_scrape.run_headless || false,
    executablePath: config.my_system.default_browser,
    userDataDir: config.my_system.default_browser_data,
    args: ["--start-maximized"], // Launch maximized Window
    defaultViewport: null, // Disable default viewport settings
  });
}

// Function to get the image urls once the browser is open.
async function getChartImageUrlsFromTradingview(chartString: string): Promise<string | null> {
  // Create new browser if not available
  if (!browser) await initBrowser();
  if (!chartString) return null;

  // Get url
  const [timeframe, pair, url] = chartString.split("@");

  // Open a new page in the browser
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "load" });

  // Wait for 1 more second to be sure we can copy the link
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Perform the Ctrl+S shortcut to create sceenshot
  await page.keyboard.down("Alt");
  await page.keyboard.press("KeyS");
  await page.keyboard.up("Alt");

  // Wait for 1 more second to be sure we copied the link
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Get the copied chart URL
  const copiedImageUrl = await page.evaluate(() => navigator.clipboard.readText());

  await page.close();

  return copiedImageUrl ? `${timeframe}@${pair}@${copiedImageUrl}` : null;
}

async function analyseCharts(): Promise<void> {
  const myCharts = config.ai_agents.charts; // Replace with your desired link

  try {
    // Get all the image urls
    const myChartImages = [];
    for (const chart of myCharts) {
      const result = await getChartImageUrlsFromTradingview(chart);
      myChartImages.push(result);
    }

    // Close and erase browser
    await browser.close();
    browser = null;

    // Get response from Ai agent
    for (const chartImage of myChartImages) {
      if (!chartImage) return;

      // Extract chart string information
      const [timeframe, pair, url] = chartImage.split("@");

      // Request analysis from AI agent
      const prompt =
        `Analyse this ${timeframe} chart for cryptocurrency pair @${pair} really good! ` +
        `Please provide in the following format back if this chart looks bearish or bullish and a 2 sentence explanation why. ` +
        `This is the format that you will answer in {"state":"BULLISH or BEARISH", "analyses":"explanation why"} ` +
        `Just answer in this format (json string), i dont want any other explanation`;
      const visionResponse = await getVisionResponse(config.ai_agents.x_vision_model, url, prompt);
      if (!visionResponse || !visionResponse?.message.content) return;

      // Safely convert json string response into object
      try {
        const vistionResponseObject: VisionModelAnalysisResponse = JSON.parse(visionResponse?.message.content);

        // Console log the results
        const chartAnalysisState = vistionResponseObject.state.toUpperCase().replace(/[^A-Z]/g, ""); // Remove non-alphabetic characters
        const chartAnalysisNotes = vistionResponseObject.analyses.trim();

        let chartAnalysisColor = chartAnalysisState === "BULLISH" ? chalk.green : chalk.red;
        let chartAnalysisEmoji = chartAnalysisState === "BULLISH" ? "🤑" : "😡";

        console.log(`==================== ${timeframe.toUpperCase()} ${pair.toUpperCase()} ====================`);
        console.log(chartAnalysisColor(chartAnalysisEmoji + " " + chartAnalysisState));
        console.log(url);
        console.log(chartAnalysisNotes + "\n\n");
      } catch (e) {
        return;
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

analyseCharts().catch(console.error);
