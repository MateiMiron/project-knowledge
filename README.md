# TeamBrain

AI-powered knowledge base that consolidates scattered team knowledge from Jira, Wiki, Contracts, Slack, Emails, Meeting Notes, Postmortems, Support Tickets, API Tests, and E2E Scenarios into one searchable interface. Ask questions in plain English, get answers with source attribution.

**Live Demo:** [project-knowledge.vercel.app](https://project-knowledge.vercel.app)
**Author:** [Matei Miron](https://www.linkedin.com/in/miron-matei/)

## What This Does

Teams scatter knowledge across 15+ tools. This demo shows how RAG (Retrieval-Augmented Generation) can consolidate everything into a single chat interface where anyone can ask questions like:

- "What's our SLA for payment processing uptime?"
- "How do we handle failed payment retries?"
- "What did we decide about Apple Pay?"

The system retrieves relevant documents from multiple sources, synthesizes an answer, and shows exactly which sources it used.

## Demo Data

Pre-loaded with 55 realistic documents for a fictional e-commerce payments team:

| Source Type | Count | Examples |
|-------------|-------|---------|
| Jira Tickets | 10 | Stripe integration, Apple Pay, checkout bugs, PCI compliance |
| Wiki Pages | 8 | API docs, onboarding guide, incident playbook, ADRs |
| Contracts | 4 | Stripe SLA, delivery partner agreement, AWS infra, GDPR DPA |
| Slack Threads | 5 | Refund edge cases, outage incident, product decisions |
| Emails | 5 | Migration announcements, PCI audit, Apple Pay go/no-go, performance reports |
| Meeting Notes | 4 | Sprint planning, architecture reviews, retrospectives, stakeholder reviews |
| Postmortems | 3 | Black Friday outage, double charge incident, PCI data exposure |
| Support Tickets | 5 | Billing disputes, technical inquiries, refund requests, security concerns |
| API Tests | 5 | Payment intents, refund processing, Apple Pay tokens, webhooks, fraud detection |
| E2E Scenarios | 6 | Full checkout, Apple Pay flow, refund flow, retry recovery, PCI validation, flash sale |

All documents cross-reference each other to demonstrate multi-source knowledge synthesis.

## Tech Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Framework | Next.js 14 (App Router) | Free |
| LLM | Groq (Llama 3.3 70B) | Free (1,000 req/day) |
| Embeddings | Transformers.js (all-MiniLM-L6-v2) | Free (runs locally) |
| Vector DB | Vercel Postgres + pgvector | Free (0.5GB) |
| ORM | Drizzle ORM | Free |
| UI | Tailwind CSS + Lucide Icons | Free |
| Hosting | Vercel Hobby | Free |

**Total cost: $0/month**

## Getting Started

### Prerequisites

- Node.js 18+
- A [Groq](https://console.groq.com) account (free)
- A [Vercel](https://vercel.com) account (free) with Postgres database

### 1. Clone and Install

```bash
git clone https://github.com/MateiMiron/project-knowledge.git
cd project-knowledge
npm install
```

### 2. Set Up Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** > **Create Database** > **Postgres**
3. Copy the connection string

### 3. Configure Environment

```bash
cp .env.example .env
```

Fill in your `.env`:

```
POSTGRES_URL=your-vercel-postgres-connection-string
GROQ_API_KEY=your-groq-api-key
SEED_SECRET=any-random-string
```

### 4. Set Up Database Tables

```bash
npm run db:push
```

### 5. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Seed Demo Data

Hit the seed endpoint to populate the database with demo documents:

```bash
curl -X POST "http://localhost:3000/api/seed?secret=your-seed-secret"
```

This will:
- Insert all 55 demo documents
- Generate embeddings for each chunk using Transformers.js
- Store everything in your Postgres database

First run takes ~2-3 minutes (downloading the embedding model). Subsequent runs are faster.

## Deploying to Vercel

1. Push to GitHub
2. Import in Vercel: **New Project** > **Import Git Repository**
3. Add environment variables in Vercel project settings:
   - `POSTGRES_URL` (auto-configured if using Vercel Postgres)
   - `GROQ_API_KEY`
   - `SEED_SECRET`
4. Deploy
5. Seed production: `curl -X POST "https://your-app.vercel.app/api/seed?secret=your-seed-secret"`

## UI Endpoint

After deployment, the main UI is at the root URL:

```
https://your-app.vercel.app
```

API endpoints:
- `POST /api/chat` - RAG query endpoint (streaming)
- `GET /api/resources` - Browse all source documents
- `POST /api/seed?secret=xxx` - Database seeder (protected)

## How It Works

```
User question
  → Generate 384-dim query embedding (Transformers.js)
  → Cosine similarity search against pgvector (top 6 chunks)
  → Deduplicate by source document
  → Build prompt with retrieved context + source metadata
  → Stream response from Groq (Llama 3.3 70B)
  → Display answer with source attribution badges
```

### Rate Limiting

- 10 queries per user per day (tracked by IP)
- Remaining queries shown in the chat header
- Groq free tier: 1,000 requests/day total

## Project Structure

```
project-knowledge/
├── app/
│   ├── page.tsx                    # Dashboard page
│   ├── api/chat/route.ts           # RAG query endpoint
│   ├── api/seed/route.ts           # Database seeder
│   └── components/                 # UI components
├── lib/
│   ├── db/schema.ts                # Drizzle + pgvector schema
│   ├── embeddings.ts               # Transformers.js wrapper
│   ├── chunking.ts                 # Document chunking
│   ├── vector-search.ts            # Cosine similarity search
│   ├── context-builder.ts          # Prompt assembly
│   ├── groq.ts                     # Groq LLM client
│   ├── rate-limit.ts               # IP-based rate limiting
│   └── seed-data/                  # Mock demo data
│       ├── jira-tickets.ts         # 10 Jira tickets
│       ├── wiki-pages.ts           # 8 wiki pages
│       ├── contracts.ts            # 4 contracts
│       ├── slack-threads.ts        # 5 Slack threads
│       ├── emails.ts               # 5 emails
│       ├── meeting-notes.ts        # 4 meeting notes
│       ├── postmortems.ts          # 3 postmortems
│       ├── support-tickets.ts      # 5 support tickets
│       ├── api-tests.ts            # 5 API test suites
│       └── e2e-scenarios.ts        # 6 E2E test scenarios
├── discovery.md                    # Research & decisions
├── plan.md                         # Implementation plan
└── progress.md                     # Implementation checklist
```

## Adapting for Your Team

To use this with your own data:

1. Replace the files in `lib/seed-data/` with your actual documents
2. Update the chunking logic in `lib/chunking.ts` if needed
3. Run the seed endpoint to re-index
4. Update sample questions in `app/components/sample-questions.tsx`

## Related Tools (Self-Hosted)

For production self-hosted knowledge bases:

- **[Onyx](https://github.com/onyx-dot-app/onyx)** (formerly Danswer) - Open source, self-hosted, connects to Jira/Confluence/Slack/Google Drive
- **[AnythingLLM](https://github.com/Mintplex-Labs/anything-llm)** - Desktop app, fully local

## Author

Built by [Matei Miron](https://www.linkedin.com/in/miron-matei/)

## License

MIT
