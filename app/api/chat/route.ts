import { searchSimilarChunks } from "@/lib/vector-search";
import { buildPromptContext } from "@/lib/context-builder";
import { streamGroqResponse } from "@/lib/groq";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const userMessage = messages?.[messages.length - 1]?.content;

    if (!userMessage || typeof userMessage !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. You have 10 queries per day.",
          remaining: 0,
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Vector search for relevant chunks
    const searchResults = await searchSimilarChunks(userMessage, 6);

    // Build prompt with context
    const { systemPrompt, sources } = buildPromptContext(
      searchResults,
      userMessage
    );

    // Stream response from Groq
    const result = await streamGroqResponse(systemPrompt, userMessage);

    // Return streaming response with sources in a custom header
    const response = result.toDataStreamResponse();

    // Add sources and rate limit info as headers
    response.headers.set("X-Sources", JSON.stringify(sources));
    response.headers.set("X-Rate-Remaining", String(rateLimit.remaining));

    return response;
  } catch (error) {
    console.error("Chat API error:", error);
    console.error(error instanceof Error ? error.message : String(error));
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
