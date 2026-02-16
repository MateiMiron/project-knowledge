import { db } from "@/lib/db";
import { resources, embeddings } from "@/lib/db/schema";
import { generateEmbedding } from "@/lib/embeddings";
import {
  chunkText,
  formatJiraForEmbedding,
  formatWikiForEmbedding,
  formatContractForEmbedding,
  formatSlackForEmbedding,
} from "@/lib/chunking";
import { jiraTickets } from "@/lib/seed-data/jira-tickets";
import { wikiPages } from "@/lib/seed-data/wiki-pages";
import { contracts } from "@/lib/seed-data/contracts";
import { slackThreads } from "@/lib/seed-data/slack-threads";

export const maxDuration = 300;

export async function POST(req: Request) {
  // Protect with secret
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.SEED_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const stats = { resources: 0, chunks: 0, types: { jira: 0, wiki: 0, contract: 0, slack: 0 } };

    // Clear existing data
    await db.delete(embeddings);
    await db.delete(resources);

    // Process Jira tickets
    for (const ticket of jiraTickets) {
      const content = formatJiraForEmbedding(ticket);
      const [resource] = await db
        .insert(resources)
        .values({
          type: "jira",
          sourceId: ticket.id,
          title: ticket.title,
          content,
          metadata: ticket as unknown as Record<string, unknown>,
        })
        .returning({ id: resources.id });

      const chunks = chunkText(content);
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
      stats.types.jira++;
    }

    // Process Wiki pages
    for (const page of wikiPages) {
      const content = formatWikiForEmbedding(page);
      const [resource] = await db
        .insert(resources)
        .values({
          type: "wiki",
          sourceId: page.id,
          title: page.title,
          content,
          metadata: page as unknown as Record<string, unknown>,
        })
        .returning({ id: resources.id });

      const chunks = chunkText(content);
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
      stats.types.wiki++;
    }

    // Process Contracts
    for (const contract of contracts) {
      const content = formatContractForEmbedding(contract);
      const [resource] = await db
        .insert(resources)
        .values({
          type: "contract",
          sourceId: contract.id,
          title: contract.title,
          content,
          metadata: contract as unknown as Record<string, unknown>,
        })
        .returning({ id: resources.id });

      const chunks = chunkText(content);
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
      stats.types.contract++;
    }

    // Process Slack threads
    for (const thread of slackThreads) {
      const content = formatSlackForEmbedding(thread);
      const [resource] = await db
        .insert(resources)
        .values({
          type: "slack",
          sourceId: thread.id,
          title: thread.topic,
          content,
          metadata: thread as unknown as Record<string, unknown>,
        })
        .returning({ id: resources.id });

      const chunks = chunkText(content);
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
      stats.types.slack++;
    }

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
        error: "Seed failed",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
