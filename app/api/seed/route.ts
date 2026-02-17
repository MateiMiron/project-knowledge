import { db } from "@/lib/db";
import { resources, embeddings } from "@/lib/db/schema";
import { generateEmbedding } from "@/lib/embeddings";
import {
  chunkText,
  formatJiraForEmbedding,
  formatWikiForEmbedding,
  formatContractForEmbedding,
  formatSlackForEmbedding,
  formatEmailForEmbedding,
  formatMeetingForEmbedding,
  formatPostmortemForEmbedding,
  formatSupportTicketForEmbedding,
  formatApiTestForEmbedding,
  formatE2eScenarioForEmbedding,
} from "@/lib/chunking";
import { jiraTickets } from "@/lib/seed-data/jira-tickets";
import { wikiPages } from "@/lib/seed-data/wiki-pages";
import { contracts } from "@/lib/seed-data/contracts";
import { slackThreads } from "@/lib/seed-data/slack-threads";
import { emails } from "@/lib/seed-data/emails";
import { meetingNotes } from "@/lib/seed-data/meeting-notes";
import { postmortems } from "@/lib/seed-data/postmortems";
import { supportTickets } from "@/lib/seed-data/support-tickets";
import { apiTests } from "@/lib/seed-data/api-tests";
import { e2eScenarios } from "@/lib/seed-data/e2e-scenarios";

export const maxDuration = 300;

async function seedItems(
  items: Array<{ type: string; sourceId: string; title: string; content: string; metadata: Record<string, unknown> }>,
  stats: { resources: number; chunks: number; types: Record<string, number> }
) {
  for (const item of items) {
    const [resource] = await db
      .insert(resources)
      .values({
        type: item.type,
        sourceId: item.sourceId,
        title: item.title,
        content: item.content,
        metadata: item.metadata,
      })
      .returning({ id: resources.id });

    const chunks = chunkText(item.content);
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.text);
      await db.insert(embeddings).values({
        resourceId: resource.id,
        chunkText: chunk.text,
        chunkIndex: chunk.index,
        embedding: JSON.stringify(embedding),
      });
      stats.chunks++;
    }
    stats.resources++;
    stats.types[item.type] = (stats.types[item.type] || 0) + 1;
  }
}

export async function POST(req: Request) {
  // Accept secret via Authorization header (preferred) or query param (legacy)
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const { searchParams } = new URL(req.url);
  const secret = bearerToken || searchParams.get("secret");

  if (!secret || secret !== process.env.SEED_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const stats = { resources: 0, chunks: 0, types: {} as Record<string, number> };

    // Clear existing data
    await db.delete(embeddings);
    await db.delete(resources);

    // Prepare all items
    const allItems = [
      ...jiraTickets.map((t) => ({
        type: "jira",
        sourceId: t.id,
        title: t.title,
        content: formatJiraForEmbedding(t),
        metadata: t as unknown as Record<string, unknown>,
      })),
      ...wikiPages.map((p) => ({
        type: "wiki",
        sourceId: p.id,
        title: p.title,
        content: formatWikiForEmbedding(p),
        metadata: p as unknown as Record<string, unknown>,
      })),
      ...contracts.map((c) => ({
        type: "contract",
        sourceId: c.id,
        title: c.title,
        content: formatContractForEmbedding(c),
        metadata: c as unknown as Record<string, unknown>,
      })),
      ...slackThreads.map((t) => ({
        type: "slack",
        sourceId: t.id,
        title: t.topic,
        content: formatSlackForEmbedding(t),
        metadata: t as unknown as Record<string, unknown>,
      })),
      ...emails.map((e) => ({
        type: "email",
        sourceId: e.id,
        title: e.subject,
        content: formatEmailForEmbedding(e),
        metadata: e as unknown as Record<string, unknown>,
      })),
      ...meetingNotes.map((m) => ({
        type: "meeting",
        sourceId: m.id,
        title: m.title,
        content: formatMeetingForEmbedding(m),
        metadata: m as unknown as Record<string, unknown>,
      })),
      ...postmortems.map((p) => ({
        type: "postmortem",
        sourceId: p.id,
        title: p.title,
        content: formatPostmortemForEmbedding(p),
        metadata: p as unknown as Record<string, unknown>,
      })),
      ...supportTickets.map((t) => ({
        type: "support",
        sourceId: t.id,
        title: t.subject,
        content: formatSupportTicketForEmbedding(t),
        metadata: t as unknown as Record<string, unknown>,
      })),
      ...apiTests.map((t) => ({
        type: "api-test",
        sourceId: t.id,
        title: t.suite,
        content: formatApiTestForEmbedding(t),
        metadata: t as unknown as Record<string, unknown>,
      })),
      ...e2eScenarios.map((s) => ({
        type: "e2e",
        sourceId: s.id,
        title: s.title,
        content: formatE2eScenarioForEmbedding(s),
        metadata: s as unknown as Record<string, unknown>,
      })),
    ];

    await seedItems(allItems, stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Database seeded successfully",
        stats,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({
        error: "Seed failed. Check server logs for details.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
