import WebSocket from "ws"; // Node.js websocket library
import dotenv from "dotenv"; // zero-dependency module that loads environment variables from a .env
import { config } from "../../config"; // Configuration parameters for our bot
import { BinanceStreamMessage } from "../../types"; // Typescript Types for type safety
import chalk from "chalk"; // Library for terminal styling
import { DateTime } from "luxon"; //  library for working with dates and times in JavaScript.
import fs from "fs"; // Interact with filesystem

// Load environment variables from the .env file
dotenv.config();

// Check if the CSV file exists
if (!fs.existsSync(config.data_streams.orders.dump_file_name)) {
  fs.writeFileSync(
    config.data_streams.orders.dump_file_name,
    "Event Time, Symbol, Aggregate Trade ID, Price, Quantity, First Trade ID, Trade Time, Is Buyer Maker\n"
  );
}

async function binanceTradeStream(): Promise<void> {
  let ws: WebSocket | null = new WebSocket(process.env.WSS_BINANCE_SPOT || "");

  // Object used to subscribe to the streams
  const subscriptionMessage = {
    method: "SUBSCRIBE",
    params: config.data_streams.orders.pairs || "btcusdt@trade",
    id: 1,
  };

  // Logic when websocket opens
  ws.on("open", () => {
    console.log("🔓 WebSocket is open");
    ws.send(JSON.stringify(subscriptionMessage));
    console.log("➡️ Subscription message sent.");
  });

  // Logic when websocket receives a message
  ws.on("message", (data: WebSocket.Data) => {
    try {
      const jsonString = data.toString(); // Convert data to a string
      const order: BinanceStreamMessage = JSON.parse(jsonString); // Parse the JSON string

      // Handle subscription confirmation
      if ("result" in order && order.result === null && order.id === subscriptionMessage.id) {
        console.log("✅ Subscription successful for streams:", subscriptionMessage.params);
        return;
      }

      const displaySymbol = order.s.toUpperCase().replace("USDT", "");
      const orderPrice = parseFloat(order.p);
      const orderQty = parseFloat(order.q);
      const orderUsdAmount = orderPrice * orderQty;
      const tradeTime = order.T;
      const tradeMaker = order.m;
      const orderTime = order.E;
      const tradeId = order.t;

      // Conver Trade Time
      const centralEuropenTime = DateTime.fromMillis(tradeTime).setZone("Europe/Stockholm");
      const hrTradeTime = centralEuropenTime.toFormat("HH:mm:ss");

      // Filer out small orders
      if (orderUsdAmount > config.data_streams.orders.min_price) {
        // Check if this is a sell or buy order
        const tradeType = tradeMaker ? "SELL" : "BUY";

        // Set the color and emoji for sell and buy orders
        let color = tradeType === "SELL" ? chalk.red : chalk.green;
        let emoji = tradeType === "BUY" ? "🤑" : "😡";

        // Filter Whale orders
        if (orderUsdAmount >= config.data_streams.orders.min_price_whale) {
          // Set the color and emoji for whale sell and buy orders
          emoji = tradeType === "BUY" ? "🚀" : "🐻";
          color = tradeType === "SELL" ? chalk.bgRedBright : chalk.bgGreenBright;
        }

        // Prepare and send output
        const output = color(`${emoji} ${tradeType} ${displaySymbol} ${hrTradeTime} $${orderUsdAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })} `);
        console.log(output);

        // Log the order in the CSV file
        fs.appendFileSync(
          config.data_streams.orders.dump_file_name,
          `${orderTime},${displaySymbol.toUpperCase()},${tradeId},${orderPrice},${orderQty},${tradeTime},${tradeMaker}\n`
        );
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
    console.log(`🔐 WebSocket closed. Trying to reconnect...`);
    setTimeout(() => binanceTradeStream(), 5000);
  });
}

binanceTradeStream().catch(console.error);
