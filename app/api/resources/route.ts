import { db } from "@/lib/db";
import { resources } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allResources = await db
      .select({
        id: resources.id,
        type: resources.type,
        sourceId: resources.sourceId,
        title: resources.title,
        content: resources.content,
        metadata: resources.metadata,
      })
      .from(resources)
      .orderBy(asc(resources.sourceId));

    // Group by type
    const grouped: Record<string, typeof allResources> = {};
    for (const r of allResources) {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type].push(r);
    }

    return Response.json({ resources: grouped });
  } catch (error) {
    console.error("Resources API error:", error);
    return Response.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
