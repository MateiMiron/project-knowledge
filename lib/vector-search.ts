import { db } from "./db";
import { embeddings, resources } from "./db/schema";
import { eq } from "drizzle-orm";
import { cosineSimilarity, generateEmbedding } from "./embeddings";

export interface SearchResult {
  chunkText: string;
  similarity: number;
  resourceId: string;
  resourceType: string;
  resourceTitle: string;
  resourceSourceId: string;
  metadata: Record<string, unknown> | null;
}

export async function searchSimilarChunks(
  query: string,
  limit: number = 6,
  similarityThreshold: number = 0.3
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query);

  // Fetch all embeddings with their resources
  const allEmbeddings = await db
    .select({
      chunkText: embeddings.chunkText,
      embedding: embeddings.embedding,
      resourceId: embeddings.resourceId,
      resourceType: resources.type,
      resourceTitle: resources.title,
      resourceSourceId: resources.sourceId,
      metadata: resources.metadata,
    })
    .from(embeddings)
    .innerJoin(resources, eq(embeddings.resourceId, resources.id));

  // Calculate similarity scores
  const scored = allEmbeddings.map((row) => {
    const embeddingVector = JSON.parse(row.embedding) as number[];
    const similarity = cosineSimilarity(queryEmbedding, embeddingVector);
    return {
      chunkText: row.chunkText,
      similarity,
      resourceId: row.resourceId,
      resourceType: row.resourceType,
      resourceTitle: row.resourceTitle,
      resourceSourceId: row.resourceSourceId,
      metadata: row.metadata,
    };
  });

  // Filter and sort by similarity
  return scored
    .filter((r) => r.similarity >= similarityThreshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}
