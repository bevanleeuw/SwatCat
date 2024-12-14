import dotenv from "dotenv"; // zero-dependency module that loads environment variables from a .env
import OpenAI from "openai";
import { VisionModelResponse } from "../types";

// Load environment variables from the .env file
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.BEARER_X_AI_API || "",
  baseURL: process.env.HTTPS_X_AI_API_BASE_URL,
});

export async function getVisionResponse(model: string, imageUrl: string, prompt: string): Promise<VisionModelResponse | null> {
  if (!imageUrl || !prompt || !model) return null;

  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high",
            },
          },
        ],
      },
    ],
  });

  return response.choices[0];
}
