# Plan - Project Knowledge RAG Demo

## Overview
Build a dashboard-style RAG demo app for an e-commerce payments team's knowledge base. Pre-loaded with 27 mock documents across 4 source types. Visitors ask questions, get streamed AI answers with source attribution. Fully free to host.

## Tech Stack
- **Framework**: Next.js 14+ (App Router) on Vercel free tier
- **LLM**: Groq free tier - Llama 3.3 70B (1,000 req/day)
- **Embeddings**: Transformers.js - all-MiniLM-L6-v2 (384-dim, local, free)
- **Vector DB**: Vercel Postgres + pgvector (free via Neon)
- **ORM**: Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Total cost**: $0/month

## Data Architecture
- **resources** table: id, type, source_id, title, content, metadata (jsonb)
- **embeddings** table: id, resource_id, chunk_text, embedding (vector(384))
- Chunking: 800 chars with 200 char overlap, split by document structure

## RAG Pipeline
1. User question → generate 384-dim query embedding (Transformers.js)
2. pgvector cosine similarity search → top 6 chunks
3. Deduplicate by source → build context prompt with citations
4. Stream response from Groq (Llama 3.3 70B, temp=0.3)
5. Return answer + source metadata for UI badges

## UI Layout
1. Header with branding + rate limit counter
2. Stats bar (27 docs, 4 types, 150+ chunks, <2s response)
3. 6 clickable sample question cards
4. Streaming chat with source attribution panel
5. Footer with GitHub/LinkedIn links

## Demo Data (27 documents)
- 10 Jira tickets (PAY-101 to PAY-110): bugs, stories, tasks
- 8 Wiki pages: guides, ADRs, playbooks, API docs
- 4 Contracts: Stripe SLA, Delivery partner, AWS, GDPR DPA
- 5 Slack threads: incidents, decisions, onboarding help

## Implementation Order
1. Foundation (Next.js, Tailwind, Drizzle, schema)
2. Demo data (4 seed files in parallel)
3. RAG pipeline (embeddings, chunking, search, LLM, API routes)
4. Frontend (dashboard components in parallel)
5. Polish (errors, responsive, docs, deploy)

## Environment Variables
```
POSTGRES_URL=        # Vercel Postgres
GROQ_API_KEY=        # Free from console.groq.com
SEED_SECRET=         # Protect seed endpoint
```
