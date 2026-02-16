import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export async function streamGroqResponse(systemPrompt: string) {
  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    temperature: 0.3,
    maxTokens: 800,
  });

  return result;
}
