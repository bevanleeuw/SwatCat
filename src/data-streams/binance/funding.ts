import WebSocket from "ws"; // Node.js websocket library
import dotenv from "dotenv"; // zero-dependency module that loads environment variables from a .env
import { config } from "../../config"; // Configuration parameters for our bot
import { BinanceMarkPriceMessage, dbFundingRateRecord } from "../../types"; // Typescript Types for type safety
import chalk from "chalk"; // Library for terminal styling
import { DateTime } from "luxon"; //  library for working with dates and times in JavaScript.
import { insertFunding } from "../../db";

// Load environment variables from the .env file
dotenv.config();

async function binanceFundingStream(): Promise<void> {
  let ws: WebSocket | null = new WebSocket(process.env.WS_BINANCE_FSTREAM || "");

  // Object used to subscribe to the streams
  const subscriptionMessage = {
    method: "SUBSCRIBE",
    params: config.data_streams.funding.pairs || "btcusdt@markPrice",
    id: 1,
  };

  // Object used to unsubscribe to the streams
  const unsubscriptionMessage = {
    method: "UNSUBSCRIBE",
    params: config.data_streams.funding.pairs || "btcusdt@markPrice",
    id: 1,
  };

  // Map for funding rates
  let fundingRateMap = new Map();
  let databaseError = false;

  // Logic when websocket opens
  ws.on("open", () => {
    // Close all current connections
    ws.send(JSON.stringify(unsubscriptionMessage));
    // Open New connection
    console.log("🔓 WebSocket is open");
    ws.send(JSON.stringify(subscriptionMessage));
    console.log("➡️ Subscription message sent.");
  });

  // Logic when websocket receives a message
  ws.on("message", async (data: WebSocket.Data) => {
    try {
      const jsonString = data.toString(); // Convert data to a string
      const marketPrice: BinanceMarkPriceMessage = JSON.parse(jsonString); // Parse the JSON string

      // Handle subscription confirmation
      if ("result" in marketPrice && marketPrice.result === null && marketPrice.id === subscriptionMessage.id) {
        console.log("✅ Subscribe / Unsubscribe successful for streams:", subscriptionMessage.params);
        return;
      }

      // Get market price information
      const displaySymbol = marketPrice.s.toUpperCase().replace("USDT", "");
      const fundingRate = parseFloat(marketPrice.r); // Raw Funding Rate
      const fundingRatePercent = fundingRate ? fundingRate * 100 : 0; // Percent Funding Rate
      const myPositionSize = config.data_streams.funding.position_value || 10000;
      const fundingPayment = Math.abs(myPositionSize * fundingRate);
      const nextFundingTime = marketPrice.T;
      const eventTime = marketPrice.E;
      const indexPrice = parseFloat(marketPrice.i);
      const markPrice = parseFloat(marketPrice.p);
      const estimatedPrice = parseFloat(marketPrice.P);

      // Convert Next Funding Time
      let cet = DateTime.fromMillis(nextFundingTime).toLocal();
      const nextFundingTimeCet = cet.toFormat("HH:mm:ss");

      // Convert Event Time
      cet = DateTime.fromMillis(eventTime).toLocal();
      const eventTimeCET = cet.toFormat("HH:mm:ss");

      // Who Pays who?
      let payer = "";
      let colorPays = chalk.gray;
      let emojiPays = "";
      if (fundingRate > 0) {
        // Longs have to pays
        payer = "Long";
        colorPays = chalk.red;
        emojiPays = "😡";
      } else if (fundingRate < 0) {
        // Shorts have to pays
        payer = "Short";
        colorPays = chalk.green;
        emojiPays = "🤑";
      } else {
        payer = "";
      }

      // Prepare and send output
      const output =
        `${emojiPays} ${displaySymbol} ` +
        colorPays(`${payer} cost: $${fundingPayment.toFixed(2)} / $${myPositionSize}`) +
        ` (${fundingRatePercent.toFixed(5)}%)`;

      // Add to temp fundingRateMap
      const existingEntry = fundingRateMap.get(displaySymbol);
      const addDbRecord = existingEntry ? existingEntry.rate !== fundingRate : true;
      fundingRateMap.set(displaySymbol, { rate: fundingRate, log: output });

      // Log all funding rates
      console.clear();
      fundingRateMap.forEach((value, key) => {
        console.log(`${value.log}`);
      });
      console.log(`Next funding time: ${nextFundingTimeCet} CET`);
      console.log(`Last updated: ${eventTimeCET} CET`);

      // Store in database
      if (addDbRecord) {
        const newFunding: dbFundingRateRecord = {
          time: eventTime,
          symbol: displaySymbol,
          fundingRate: fundingRate,
          fundingRatePerc: fundingRatePercent,
          indexPrice: indexPrice,
          markPrice: markPrice,
          estimatedPrice: estimatedPrice,
          payer: payer,
        };

        await insertFunding(newFunding).catch((err) => {
          databaseError = true;
          if (ws) ws.close(1000, "Error storing record");
          console.log("⛔ Database Error: " + err);
          console.log("Record:");
          console.log(newFunding);
        });
      }
    } catch (e) {
      console.error("Error processing message:", e);
    }
  });

  // Logic when websocket Has an error
  ws.on("error", (err: Error) => {
    console.error("🚫 WebSocket error:", err);
  });

  // Logic when websocket Closes
  ws.on("close", () => {
    if (!databaseError) {
      console.log(`🔐 WebSocket closed. Trying to reconnect...`);
      setTimeout(() => binanceFundingStream(), 5000);
    }
  });
}

binanceFundingStream().catch(console.error);
