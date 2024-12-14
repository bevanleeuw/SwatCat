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
