import { SearchResult } from "./vector-search";

export interface Source {
  id: string;
  type: string;
  title: string;
  sourceId: string;
}

export function buildPromptContext(
  searchResults: SearchResult[],
  userQuery: string
): { systemPrompt: string; sources: Source[] } {
  // Deduplicate by resource - keep best chunk per document
  const seen = new Set<string>();
  const uniqueResults = searchResults.filter((r) => {
    if (seen.has(r.resourceId)) return false;
    seen.add(r.resourceId);
    return true;
  });

  const context = uniqueResults
    .map(
      (result, idx) =>
        `[Source ${idx + 1}: ${result.resourceType.toUpperCase()} - ${result.resourceTitle} (${result.resourceSourceId})]
${result.chunkText}`
    )
    .join("\n\n---\n\n");

  const sources: Source[] = uniqueResults.map((r) => ({
    id: r.resourceId,
    type: r.resourceType,
    title: r.resourceTitle,
    sourceId: r.resourceSourceId,
  }));

  const systemPrompt = `You are a helpful knowledge assistant for an e-commerce payments engineering team. Answer questions based on the provided context from the team's Jira tickets, wiki pages, contracts, and Slack conversations.

Rules:
- Only answer based on the provided context. If the context doesn't contain enough information, say so clearly.
- Cite your sources by referencing the source type and ID (e.g., "According to Jira ticket PAY-103..." or "The Stripe Processing Agreement states...").
- Be concise but thorough. Use bullet points for lists.
- If the question spans multiple sources, synthesize the information and cite all relevant sources.

Context from the knowledge base:

${context}`;

  return { systemPrompt, sources };
}
