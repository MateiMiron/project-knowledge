export interface MeetingNote {
  id: string;
  title: string;
  date: string;
  attendees: string[];
  type: string;
  duration: string;
  notes: string;
}

export const meetingNotes: MeetingNote[] = [
  {
    id: "MEETING-001",
    title: "Sprint Planning - Sprint 24",
    date: "2026-01-12",
    attendees: [
      "Sarah Chen (Engineering Manager)",
      "Marcus Rivera (Tech Lead)",
      "Priya Patel (Senior Engineer)",
      "James O'Brien (Engineer)",
      "Tanya Kim (Engineer)",
      "Alex Novak (Scrum Master)",
      "Dana Whitfield (Product Owner)",
    ],
    type: "sprint-planning",
    duration: "90 min",
    notes: `# Sprint 24 Planning

## Sprint Goal
Complete the 3DS2 authentication flow and land the first iteration of the payment retry overhaul so that failed transactions on Stripe are automatically retried before surfacing errors to customers.

## Capacity
- Team capacity: **52 story points** (Priya out Wed-Fri, Marcus at conference Thursday)
- Velocity average (last 3 sprints): 48 pts
- Buffer for on-call rotation: 5 pts reserved (James on-call week 1, Tanya week 2)

## Stories Pulled In

| Ticket | Title | Points | Assignee |
|--------|-------|--------|----------|
| PAY-101 | Implement 3DS2 challenge flow for Stripe | 8 | Marcus Rivera |
| PAY-103 | Add idempotency key generation to checkout service | 5 | Priya Patel |
| PAY-107 | Build dead letter queue consumer for failed payments | 8 | James O'Brien |
| PAY-110 | Update PCI audit logging for new card vault | 5 | Tanya Kim |
| PAY-111 | Migrate Apple Pay tokenization to v3 API | 5 | Priya Patel |
| PAY-112 | Add retry count metrics to Datadog dashboard | 3 | James O'Brien |
| PAY-113 | Write integration tests for partial refund edge cases | 3 | Tanya Kim |
| PAY-114 | Spike: evaluate Adyen fallback for high-failure regions | 3 | Marcus Rivera |

**Total committed: 40 pts** (leaving 7 pts buffer below capacity)

## Risks & Dependencies
- **PAY-101** depends on Stripe enabling 3DS2 sandbox access -- Sarah to follow up with Stripe TAM by Jan 13
- **PAY-107** is blocked until architecture review (MEETING-002) finalizes retry strategy; James to begin with queue infrastructure in the meantime
- **PAY-111** requires updated Apple Developer certificates -- Dana confirmed these are in progress with DevOps

## Decisions
- We will not pull in the currency conversion refactor this sprint; deferring to Sprint 25
- On-call engineers should limit sprint work to 3 pts during their on-call week

## Action Items
- [ ] **Sarah**: Confirm Stripe 3DS2 sandbox access by EOD Jan 13
- [ ] **Dana**: Share updated Apple Pay certificate timeline with the team
- [ ] **Alex**: Set up Sprint 24 board and update burn-down chart
- [ ] **Marcus**: Draft technical approach for PAY-101 before Wednesday standup`,
  },
  {
    id: "MEETING-002",
    title: "Architecture Review - Payment Retry System Redesign",
    date: "2026-01-14",
    attendees: [
      "Marcus Rivera (Tech Lead)",
      "Priya Patel (Senior Engineer)",
      "James O'Brien (Engineer)",
      "Sarah Chen (Engineering Manager)",
      "Raj Mehta (Staff Engineer, Platform)",
    ],
    type: "architecture-review",
    duration: "60 min",
    notes: `# Architecture Review: Payment Retry System Redesign

## Context
Current retry logic is embedded inline in the checkout service (see wiki-001: Payment Gateway Guide for existing flow). Retry failures are silently dropped, causing ~2.3% of recoverable transactions to be lost. PAY-104 originally addressed retry logic but was descoped; this redesign supersedes it.

## Proposals Evaluated

### Option A: Exponential Backoff with Jitter
- Retries at 1s, 2s, 4s, 8s, 16s intervals with +/- 30% random jitter
- Max 5 attempts over ~31 seconds
- **Pros**: Industry standard, reduces thundering herd on gateway outages
- **Cons**: Total wait time may exceed user-facing timeout for synchronous checkouts

### Option B: Linear Retry with Circuit Breaker
- Fixed 2s interval, max 3 attempts
- Circuit breaker trips after 10 consecutive failures in 60s window
- **Pros**: Predictable latency, simpler to reason about
- **Cons**: Harder on downstream gateways during partial outages

## Architecture Diagram Description
\`\`\`
Checkout Service --> Retry Orchestrator --> Payment Gateway (Stripe/Adyen)
                          |
                          +--> Dead Letter Queue (SQS)
                                    |
                                    +--> DLQ Consumer --> Alerting + Manual Review Dashboard
\`\`\`
- The Retry Orchestrator is a new stateless service reading from an SQS FIFO queue
- Each message carries an **idempotency key** (ref PAY-103) to prevent duplicate charges
- After max retries exhausted, messages land in the Dead Letter Queue (ref PAY-107)

## Decision
**Option A (Exponential Backoff with Jitter)** selected unanimously.

**Rationale**: We will split the retry into two phases:
1. **Synchronous phase**: 2 immediate retries with 500ms/1s delays (keeps checkout under 3s SLA)
2. **Asynchronous phase**: Remaining retries via SQS with exponential backoff up to 5 min ceiling

This hybrid approach gives users fast feedback while still recovering from transient gateway failures in the background.

## Technical Constraints
- Idempotency keys must be generated at the edge (checkout-service) and propagated through all retry attempts
- DLQ retention set to 14 days per PCI-DSS requirements
- All retry attempts must be logged with correlation IDs for audit trail

## Action Items
- [ ] **James**: Draft DLQ consumer design doc by Jan 16 and share in #payments-eng
- [ ] **Priya**: Update idempotency key RFC to include retry orchestrator integration
- [ ] **Marcus**: Create ADR (Architecture Decision Record) for retry strategy in Confluence
- [ ] **Raj**: Review SQS FIFO throughput limits and confirm they support peak traffic (est. 1,200 msg/s)
- [ ] **Sarah**: Schedule follow-up review in 2 weeks to assess implementation progress`,
  },
  {
    id: "MEETING-003",
    title: "Retrospective - Sprint 23",
    date: "2026-01-09",
    attendees: [
      "Sarah Chen (Engineering Manager)",
      "Marcus Rivera (Tech Lead)",
      "Priya Patel (Senior Engineer)",
      "James O'Brien (Engineer)",
      "Tanya Kim (Engineer)",
      "Alex Novak (Scrum Master)",
    ],
    type: "retrospective",
    duration: "45 min",
    notes: `# Sprint 23 Retrospective

## Sprint Summary
- **Committed**: 46 points | **Completed**: 39 points (85% completion rate)
- **Sprint Goal**: Ship fraud detection rules engine and begin checkout reliability improvements
- Sprint goal **partially met** -- fraud detection shipped, checkout reliability work carried over

## What Went Well
- **Fraud detection rules engine shipped on time** (PAY-105). Priya and Tanya paired effectively on this and the rollout was smooth with zero incidents in the first 48 hours. The feature is already flagging ~0.8% of transactions for review, which aligns with our fraud team's projections.
- **Improved on-call runbooks**: James updated the payment failure runbook and it was used twice during the sprint, reducing MTTR from 25 min to 12 min.
- **Cross-team collaboration**: The fraud team gave us early access to their scoring API which unblocked PAY-105 by three days.

## What Didn't Go Well
- **Checkout timeout bug (PAY-106) took 5 days instead of estimated 2**. Root cause was a race condition between the cart service and payment-service that only manifested under load. We lacked integration test coverage for concurrent checkout flows. This consumed most of Marcus's week.
- **PAY-108 (refund webhook handler) was blocked for 3 days** waiting on Stripe to provision test webhook endpoints. We need a better process for managing third-party dependencies.
- **Standup attendance dropped** -- two standups had only 3 people. Async updates in Slack were inconsistent.

## Action Items (Voted by Team)

| Action Item | Owner | Votes | Priority |
|-------------|-------|-------|----------|
| Add integration tests for concurrent checkout scenarios | Marcus | 5/6 | High |
| Create a third-party dependency tracker in Notion | Alex | 4/6 | Medium |
| Implement Slack standup bot for async standups on WFH days | Tanya | 4/6 | Medium |
| Schedule mid-sprint check-in for stories > 5 points | Sarah | 3/6 | Low |
| Run a blameless post-mortem for the PAY-106 timeout bug | Marcus + Sarah | 5/6 | High |

## Kudos
- Priya for mentoring Tanya on the fraud detection work -- great knowledge sharing
- James for the runbook improvements -- directly measurable impact on incident response

## Follow-Up
- PAY-106 post-mortem scheduled for Jan 10 at 2pm
- Carried-over stories (PAY-108, PAY-109) to be re-estimated and pulled into Sprint 24 planning`,
  },
  {
    id: "MEETING-004",
    title: "Stakeholder Review - Q1 Payments Platform Update",
    date: "2026-01-22",
    attendees: [
      "Sarah Chen (Engineering Manager)",
      "Marcus Rivera (Tech Lead)",
      "Dana Whitfield (Product Owner)",
      "Lisa Tran (VP Engineering)",
      "Kevin Park (Director of Product)",
      "Omar Hassan (Finance Lead)",
    ],
    type: "stakeholder",
    duration: "60 min",
    notes: `# Q1 Payments Platform Update -- Stakeholder Review

## Attendees & Purpose
Presented to VP Engineering (Lisa Tran) and Director of Product (Kevin Park) to provide a quarterly status update on the payments platform roadmap, flag risks, and align on Q2 priorities.

## 1. Stripe Migration Status
- **Phase 1 (card payments)**: Complete. 100% of card transactions now route through Stripe. Legacy Braintree integration decommissioned as of Dec 15 (ref PAY-095).
- **Phase 2 (subscriptions)**: 72% migrated. Remaining 28% are annual enterprise plans with custom billing logic. Target completion: **Feb 28**. Tracked under PAY-116, PAY-117, PAY-118.
- **Cost impact**: Processing fees reduced by 0.15% per transaction, saving approximately $34K/month at current volume.

## 2. Apple Pay Timeline
- Apple Pay integration (PAY-111) is in active development. Tokenization v3 API migration is underway.
- **Projected launch**: March 15 for US customers, March 30 for EU (pending Strong Customer Authentication certification).
- **Dependency**: Updated Apple Developer Enterprise certificates -- DevOps confirmed delivery by Jan 30.
- Kevin raised concern about conversion rate tracking; Dana to add analytics tickets to Sprint 25.

## 3. PCI DSS Compliance Progress
- Annual PCI DSS Level 1 audit scheduled for **March 5-7** with QSA (Qualified Security Assessor).
- 9 of 12 required controls fully implemented. Remaining three:
  1. Encryption key rotation automation (PAY-120) -- in progress, ETA Feb 10
  2. Audit log retention policy enforcement (PAY-110) -- in Sprint 24
  3. Penetration test for new card vault -- scheduled Feb 18 with external vendor (contract ref: CONT-2024-0042)
- **Risk**: If PAY-120 slips, we may need to request a 2-week audit extension. Sarah to escalate if not on track by Feb 1.

## 4. Q2 Roadmap Preview
- **Google Pay integration** (April): Engineering spike complete, estimated 4 sprints of work
- **Multi-currency settlement** (April-May): Dependent on finance team finalizing banking partner agreements (Omar confirmed target signing date of March 15)
- **Real-time fraud scoring v2** (May-June): ML model retraining in partnership with Data Science team; PAY-105 (v1) provides the foundation
- **Adyen failover** (June): Secondary payment processor for EU traffic resilience (ref PAY-114 spike in Sprint 24)

## Decisions
- Lisa approved headcount request for one additional senior engineer to support Q2 scope
- Kevin agreed to defer Buy Now Pay Later integration to Q3 to avoid overloading the team
- Omar to provide updated interchange fee analysis by Feb 1 to inform multi-currency pricing

## Action Items
- [ ] **Sarah**: Share detailed Q2 roadmap with effort estimates by Jan 31
- [ ] **Dana**: Create Apple Pay analytics tracking tickets before Sprint 25 planning
- [ ] **Marcus**: Prepare PCI audit readiness checklist and circulate to stakeholders by Feb 3
- [ ] **Omar**: Deliver interchange fee analysis and banking partner status update by Feb 1
- [ ] **Lisa**: Approve and initiate senior engineer job posting by Jan 27`,
  },
];
