import {
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
  integer,
  index,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const resources = pgTable(
  "resources",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: varchar("type", { length: 20 }).notNull(), // jira | wiki | contract | slack
    sourceId: varchar("source_id", { length: 255 }).notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    typeIdx: index("resources_type_idx").on(table.type),
  })
);

export const embeddings = pgTable(
  "embeddings",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    chunkText: text("chunk_text").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    embedding: text("embedding").notNull(), // stored as JSON string, parsed for queries
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    resourceIdx: index("embeddings_resource_idx").on(table.resourceId),
  })
);

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;
