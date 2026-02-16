# Discovery - Project Knowledge RAG Demo

## Problem Statement
Team knowledge is scattered across 15+ tools (Jira, Confluence, Slack, Google Docs, Git, email, PDFs on laptops). Finding a specific piece of information (test scenario, product decision, contract term) often takes 30+ minutes of searching across multiple platforms.

## Solution
A centralized knowledge base with RAG (Retrieval-Augmented Generation) that ingests documents from all sources, indexes them with vector embeddings, and lets users ask questions in natural language - getting answers with source attribution.

## Key Questions Explored

### Q: What LLM should we use?
**A: Groq free tier (Llama 3.3 70B)**
- 1,000 requests/day free, zero cost
- Extremely fast inference (500+ tokens/sec)
- OpenAI-compatible API (easy to swap later)
- Alternatives considered: Claude API (requires paid key), OpenAI (paid), Gemini (free but less reliable)

### Q: How to handle embeddings without paying for OpenAI?
**A: Transformers.js with all-MiniLM-L6-v2**
- Runs entirely server-side in Node.js, zero API cost
- Produces 384-dimensional vectors (smaller than OpenAI's 1536 but effective for demo scale)
- No external API key required
- Trade-off: Slightly lower quality than OpenAI embeddings, but perfectly fine for ~27 documents

### Q: What vector database for Vercel free tier?
**A: Vercel Postgres + pgvector (Neon integration)**
- Free 0.5GB storage on Vercel Hobby plan
- Native pgvector extension for cosine similarity search
- Works with Drizzle ORM for type-safe queries
- Alternatives considered: Supabase (more generous but extra service), Pinecone (requires signup), in-memory (no persistence)

### Q: What about API key auth for visitors?
**A: No auth required - Groq key is server-side env var**
- Groq API key stored as Vercel environment variable
- Users never see or need any API key
- Rate limited to 10 queries/user/day via IP tracking
- If Groq free tier is exhausted, show friendly "demo limit reached" message

### Q: What demo theme best showcases cross-source knowledge?
**A: E-commerce payments team**
- Rich enough for cross-referencing (Jira bugs reference wiki docs reference contract SLAs)
- Technical enough to be impressive (payment retry logic, PCI compliance, incident response)
- Relatable to most engineers and product people
- 27 documents across 4 source types (Jira, Wiki, Contracts, Slack)

### Q: What UI style works best for a LinkedIn demo?
**A: Dashboard style**
- Landing page with stats to make immediate visual impact
- Sample questions let visitors try it in one click (no typing needed)
- Chat below for deeper exploration
- Source attribution badges build trust ("here's where this came from")

### Q: Vercel free tier limitations?
**A: Workable with careful design**
- 120s function timeout: Fine, our pipeline runs in 2-5s
- 1GB function memory: Sufficient for Transformers.js model loading
- 0.5GB Postgres: Enough for ~27 docs + embeddings
- 1M function invocations/month: More than enough
- No WebSockets: Using SSE streaming instead (Vercel AI SDK handles this)

## Alternatives Considered (and why not)

| Alternative | Why Not |
|-------------|---------|
| Onyx (Danswer) | Self-hosted, requires server infrastructure, too complex for quick demo |
| AnythingLLM | Desktop app, can't host as web demo for LinkedIn visitors |
| LangChain | Heavier dependency, Vercel AI SDK is simpler and more native |
| Streamlit | Python-based, harder to deploy on Vercel, less polished UI |
| OpenAI embeddings | Costs money (even if negligible), requires extra API key |
| Pinecone | Extra service to manage, unnecessary for 27 documents |

## Architecture Decision Records

### ADR-1: Transformers.js over OpenAI for embeddings
- **Decision**: Use local Transformers.js embeddings
- **Rationale**: Zero cost, no API key dependency, fast enough for demo
- **Trade-off**: 384-dim vectors instead of 1536-dim, slightly lower retrieval quality
- **Acceptable because**: Demo has only 27 documents, not millions

### ADR-2: In-memory rate limiting over Vercel KV
- **Decision**: Simple Map-based rate limiter in memory
- **Rationale**: Vercel KV requires paid plan or extra setup
- **Trade-off**: Rate limits reset on function cold starts
- **Acceptable because**: Demo-grade protection, not production security

### ADR-3: Pre-loaded mock data over real API connectors
- **Decision**: Ship with realistic mock data, no Jira/Confluence API integration
- **Rationale**: Visitors can try immediately without configuring OAuth tokens
- **Trade-off**: Can't demonstrate live data sync
- **Acceptable because**: The point is demonstrating RAG value, not connector configuration
