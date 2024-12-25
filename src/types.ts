// Data Streams
// Binance Spot Order Data Stream
interface binanceStreamData {
  s: string; // Symbol
  E: number; // Event time
  t: number; // Aggregate trade ID
  p: string; // Price
  q: string; // Quantity
  T: number; // Trade time
  m: boolean; // Is the buyer the market maker?
}
interface binanceStreamDataWithConfirmation extends binanceStreamData {
  id?: number; // Confirmation ID
  result?: null; // Confirmation result
}
export type BinanceStreamMessage = binanceStreamData | binanceStreamDataWithConfirmation;

// Binance Mark Price Data Stream
export interface dbFundingRateRecord {
  id?: number; // Optional because it's added by the database
  time: number;
  symbol: string;
  fundingRate: number;
  fundingRatePerc: number;
  indexPrice: number;
  markPrice: number;
  estimatedPrice: number;
  payer: string;
}
interface binanceMarkPriceData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  p: string; // Mark price
  i: string; // Index price
  P: string; // Estimated Settle Price, only useful in the last hour before the settlement starts
  r: string; // Funding rate
  T: number; // Next funding time
}
interface binanceMarkPriceDataWithConfirmation extends binanceMarkPriceData {
  id?: number; // Confirmation ID
  result?: null; // Confirmation result
}
export type BinanceMarkPriceMessage = binanceMarkPriceData | binanceMarkPriceDataWithConfirmation;

// ai agents
// Vision
export interface VisionModelResponse {
  index: number;
  message: {
    role: "assistant" | "user" | "system";
    content: string | null; // Allow null to handle cases where content is absent
    refusal: string | null;
  };
  finish_reason: "stop" | "length" | "content_filter" | string;
}
export interface VisionModelAnalysisResponse {
  state: string;
  analyses: string;
}
