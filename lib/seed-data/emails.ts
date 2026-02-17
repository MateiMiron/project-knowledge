export interface Email {
  id: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  date: string;
  body: string;
  thread?: string;
}

export const emails: Email[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // EMAIL-001: VP Engineering — Legacy gateway migration to Stripe
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "EMAIL-001",
    subject: "Payment Gateway Migration: Legacy → Stripe Payment Intents — Timeline & Assignments",
    from: "David Kim <david.kim@acmecommerce.com>",
    to: [
      "payments-eng@acmecommerce.com",
      "sarah.chen@acmecommerce.com",
      "mike.rodriguez@acmecommerce.com",
      "priya.sharma@acmecommerce.com",
    ],
    cc: [
      "lisa.park@acmecommerce.com",
      "james.wilson@acmecommerce.com",
      "alex.kim@acmecommerce.com",
    ],
    date: "2026-01-06T09:15:00Z",
    body: `Team,

Following our architecture review last Friday, I want to formalize the plan for migrating off the legacy Charges API to Stripe Payment Intents. This is our top engineering priority for Q1 and is tracked under **PAY-101**.

## Why Now

The legacy Charges API does not support Strong Customer Authentication (SCA) required by European regulators, and it limits our ability to add new payment methods such as Apple Pay and Google Pay. Our ADR on this decision is documented in **wiki-006** (ADR: Why We Chose Stripe), which outlines why the Payment Intents API is the correct long-term path.

## Timeline

| Phase | Dates | Owner | Milestone |
|---|---|---|---|
| Backend migration | Jan 12 – Jan 30 | Sarah Chen | All \`/v1/charges\` calls replaced with \`/v1/payment_intents\` |
| Frontend integration | Jan 19 – Feb 6 | Alex Kim | \`stripe.confirmCardPayment()\` integrated into checkout |
| Webhook updates | Jan 26 – Feb 10 | Priya Sharma | New event handlers for \`payment_intent.succeeded\` / \`payment_intent.payment_failed\` |
| Load testing | Feb 10 – Feb 14 | Mike Rodriguez | Confirm stable operation at 5,000 concurrent checkouts |
| Staged rollout | Feb 17 – Feb 28 | Full team | 5% → 25% → 50% → 100% traffic migration |

## Risk Mitigation

1. **Dual-write period**: During rollout we will process through both APIs and reconcile nightly. Any discrepancy triggers an automatic alert.
2. **Feature flag**: LaunchDarkly flag \`stripe-payment-intents-enabled\` controls the rollout percentage. We can kill-switch to legacy within 60 seconds.
3. **Rollback plan**: The legacy Charges API path will remain deployed but dormant for 30 days post-migration. No code deletion until March 31.

Please review the detailed implementation spec attached to PAY-101 and raise any concerns in #payments-eng by EOD Wednesday. I have blocked 90 minutes on Thursday for a migration kickoff meeting.

Thanks,
David`,
    thread: "Initial announcement — no prior thread",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // EMAIL-002: Security team — PCI compliance audit findings
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "EMAIL-002",
    subject: "[ACTION REQUIRED] PCI DSS v4.0 Pre-Audit Findings — 3 Critical Items, Response Due Feb 14",
    from: "Marcus Rivera <marcus.rivera@acmecommerce.com>",
    to: [
      "sarah.chen@acmecommerce.com",
      "david.kim@acmecommerce.com",
      "payments-eng@acmecommerce.com",
    ],
    cc: [
      "priya.sharma@acmecommerce.com",
      "mike.rodriguez@acmecommerce.com",
      "compliance@acmecommerce.com",
    ],
    date: "2026-01-28T14:30:00Z",
    body: `Team,

Our internal pre-audit sweep ahead of the CoalFire PCI DSS v4.0 on-site (Feb 24–28) has surfaced findings that require immediate remediation. Full details are in **wiki-002** (PCI Compliance Checklist), but I am escalating here because of the timeline.

## Critical Findings (must resolve before Feb 14)

1. **CRIT-01 — Client-side script inventory incomplete** (Req 6.4.3): The checkout page loads 3 third-party scripts that are not in our authorized script manifest. One of them is an A/B testing snippet injected dynamically, which also violates our Content Security Policy. Priya has started work on SRI hashes — see the latest comment on **PAY-107** for overlap with our Kong gateway changes.

2. **CRIT-02 — CDE password policy non-compliant** (Req 8.3.6): Minimum password length for systems inside the cardholder data environment is still 8 characters. The v4.0 standard requires 12. This affects our AWS IAM policies, the payments-service database accounts, and the Vault admin users.

3. **CRIT-03 — Missing change-detection monitoring on payment pages** (Req 11.6.1): We have no mechanism to detect unauthorized DOM modifications on the checkout page. Mike has proposed a Cloudflare Page Shield + Lambda@Edge approach — please prioritize implementation.

## Medium Findings (must resolve before Feb 21)

4. MED-01 — Quarterly vulnerability scan from Q4 2025 has two unpatched medium-severity CVEs in Node.js dependencies.
5. MED-02 — Risk analysis documentation for customized-approach requirements is outdated (last updated Aug 2025).
6. MED-03 — Webhook endpoint (/api/webhooks/stripe) does not enforce mutual TLS; relies on signature verification only.
7. MED-04 — Penetration test remediation item PT-2025-09 (insecure deserialization in legacy refund endpoint) is still open.
8. MED-05 — Logging configuration in payments-service does not mask full PAN in debug-level logs when running locally.

## Next Steps

I need remediation owners assigned to each item by **Thursday Jan 30**. Please reply-all with your assignments. I will track progress daily in the #security-compliance Slack channel and update the compliance matrix in wiki-002.

The CoalFire pre-audit document package is contractually due **February 14**. Missing this deadline puts our PCI certification at risk and could trigger penalty clauses under our Stripe Processing Agreement.

Marcus Rivera
Head of Security & Compliance`,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // EMAIL-003: Product manager — Apple Pay go/no-go decision
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "EMAIL-003",
    subject: "Apple Pay Launch: Go/No-Go Decision — Phased Rollout Approved with Conditions",
    from: "Lisa Park <lisa.park@acmecommerce.com>",
    to: [
      "payments-eng@acmecommerce.com",
      "david.kim@acmecommerce.com",
      "sarah.chen@acmecommerce.com",
      "alex.kim@acmecommerce.com",
    ],
    cc: [
      "marketing@acmecommerce.com",
      "mike.rodriguez@acmecommerce.com",
      "priya.sharma@acmecommerce.com",
    ],
    date: "2026-01-24T16:45:00Z",
    body: `Hi everyone,

Following yesterday's stakeholder meeting with Engineering, Marketing, and Finance, I want to share the Apple Pay launch decision. This pertains to **PAY-103** (Add Apple Pay support to web and mobile checkout).

## Decision: Conditional GO — Phased Rollout

We are proceeding with a phased approach, as David proposed in the #product-payments Slack thread on Jan 22 (slack-thread-002):

- **Phase 1 — Web Checkout (April 1 GA):** Apple Pay via Stripe Payment Request Button on Safari desktop and mobile web. This is the simpler integration path and gives Marketing their Q2 launch headline.
- **Phase 2 — Native iOS App (April 30 GA):** In-app Apple Pay via PKPaymentAuthorizationViewController. Requires additional mobile SDK work and a separate App Store review cycle.

## Conditions for Phase 1 Go-Live

The following must be completed before we flip the flag to 100% on April 1:

1. **Domain verification** — Apple merchant ID certificate must be renewed and \`/.well-known/apple-developer-merchantid-domain-association\` deployed to production. Current cert expires March 1; renewal is in progress.
2. **Load testing** — Apple Pay token decryption adds ~200ms to the payment path. Mike needs to confirm this does not push our p99 above the 3-second SLA threshold. This will be validated as part of the broader load testing effort in PAY-109.
3. **A/B test results** — The 10% canary rollout (LaunchDarkly flag \`apple-pay-web-enabled\`) must run for a minimum of 2 weeks with no statistically significant increase in payment failure rate.
4. **Finance sign-off** — Confirm that Apple Pay transactions are captured correctly in our revenue recognition pipeline. Apple Pay settles as a card-present-equivalent transaction, which has different interchange rates.

## Action Items

- Sarah: Update PAY-103 with revised milestones for the two phases
- Alex: Continue PR review for the web checkout implementation
- Mike: Schedule load test window for Apple Pay flow by Feb 14
- Lisa (me): Draft product brief and Marketing launch materials by Feb 7

If any condition cannot be met by March 15, we push Phase 1 to April 15. I would rather delay than launch with quality issues.

Thanks,
Lisa Park
Senior Product Manager, Payments`,
    thread: "Follow-up to stakeholder meeting on Jan 23 and Slack thread slack-thread-002 in #product-payments",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // EMAIL-004: Engineering lead — Q2 performance review results
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "EMAIL-004",
    subject: "Payment Service Q1 Performance Report — Latency, Error Rates, and Capacity Planning",
    from: "Mike Rodriguez <mike.rodriguez@acmecommerce.com>",
    to: [
      "payments-eng@acmecommerce.com",
      "david.kim@acmecommerce.com",
    ],
    cc: [
      "sre-team@acmecommerce.com",
      "lisa.park@acmecommerce.com",
    ],
    date: "2026-02-03T10:00:00Z",
    body: `Team,

Here are the Q1 2026 performance numbers for payments-service, pulled from our DataDog dashboards covering Jan 1 – Jan 31. I am sharing these now to establish baselines ahead of the **PAY-109** load testing and Q2 Summer Sale capacity planning.

## Latency (checkout endpoint POST /api/checkout/complete)

| Percentile | January Avg | December Avg | Change |
|---|---|---|---|
| p50 | 245ms | 238ms | +2.9% |
| p95 | 780ms | 745ms | +4.7% |
| p99 | 1,420ms | 1,180ms | +20.3% |

The p99 regression is concerning. Root cause analysis points to the Kong API gateway deployment (v3.42.0) on Jan 18, which added ~150ms of overhead on the webhook verification path. This is the same deployment that caused the signature verification failures in **PAY-107**. After Alex's fix landed on Jan 22, p99 improved but has not fully recovered. I am investigating whether Kong's request buffering is adding latency even on non-webhook routes.

## Error Rates

- **Overall payment success rate**: 99.72% (target: 99.9%)
- **Gateway timeout (504)**: 0.08% — down from 0.31% after the circuit breaker fix in PAY-102
- **Stripe API errors (5xx)**: 0.04% — within normal range per Stripe's status page
- **Double charge incidents**: 0.03% — addressed in PAY-104, fix pending production deploy
- **Webhook delivery failures**: 0.12% — elevated due to PAY-107, trending down post-fix

## Availability

- **Monthly uptime**: 99.96% (SLA target per Stripe Processing Agreement: 99.95%)
- **Longest incident**: 18 minutes on Jan 15 (Stripe partial outage, tracked in slack-thread-003)
- **Mean time to recovery**: 6.2 minutes

## Capacity Planning Concerns

At current traffic levels (~1,200 concurrent checkouts at peak), we are operating at approximately 24% of our tested capacity ceiling. However, the Q2 Summer Sale projects a 15x traffic multiplier. At that scale, we would need to handle ~12,000 concurrent checkouts. Our current auto-scaling config maxes out at 20 pods, which based on January's numbers gives us headroom to roughly 6,000 concurrent checkouts before latency degrades.

I will present a detailed capacity plan after the PAY-109 load testing is complete. For now, I recommend we begin discussions with Infrastructure about increasing our pod ceiling to 40 and pre-warming the connection pools before the sale window.

Mike Rodriguez
Staff Engineer, Payments Platform`,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // EMAIL-005: CTO — EU data processing agreement announcement
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "EMAIL-005",
    subject: "New EU Data Processing Requirements — Updated DPA and Mandatory Team Training",
    from: "David Kim <david.kim@acmecommerce.com>",
    to: [
      "engineering-all@acmecommerce.com",
      "payments-eng@acmecommerce.com",
    ],
    cc: [
      "legal@acmecommerce.com",
      "marcus.rivera@acmecommerce.com",
      "hr@acmecommerce.com",
    ],
    date: "2026-02-10T08:30:00Z",
    body: `All Engineering,

I am writing to inform you of important changes to our data processing obligations following the updated Data Processing Agreement (**CONTRACT-004**) that went through legal review last month. These changes affect every engineer who works with payment data or customer PII.

## What Changed

The EU Data Protection Board issued updated guidance in December 2025 that tightens requirements for companies processing EU cardholder data under GDPR Article 28. Our Legal team has revised CONTRACT-004 to reflect these obligations. The key changes are:

1. **Breach notification window reduced from 72 to 48 hours.** If we detect or suspect any unauthorized access to EU customer data, the DPO must be notified within 24 hours so we can meet the 48-hour regulator notification deadline. The incident response process in wiki-002 (PCI Compliance Checklist) is being updated to reflect this.

2. **Data minimization audit required by March 31.** Every service that stores or processes EU customer data must complete a data inventory documenting what PII is collected, why it is necessary, and the retention period. The payments-service is the highest priority — Marcus Rivera will coordinate the audit.

3. **Sub-processor re-approval.** All third-party services that process EU customer data on our behalf (Stripe, AWS, DataDog, etc.) must be re-approved under the updated DPA terms. Legal is handling vendor outreach but Engineering must verify that data flows to each sub-processor are documented accurately.

4. **Right to erasure SLA tightened to 7 business days** (previously 14). Our current account deletion pipeline takes approximately 10 business days end-to-end. We need to optimize this — I am creating a Jira ticket for the payments-service portion.

## Mandatory Training

All engineers with access to production payment systems must complete the updated GDPR & Data Privacy training module by **February 28, 2026**. HR will send enrollment links this week. This is not optional — CONTRACT-004 Section 8.3 requires documented evidence of annual training for all personnel handling EU personal data.

## Action Items

- **Marcus Rivera**: Lead the data minimization audit for all payment services; update wiki-002 with revised incident response timelines.
- **Sarah Chen & Priya Sharma**: Review the payments-service account deletion flow and identify optimizations to meet the 7-day SLA.
- **All engineers**: Complete GDPR training by Feb 28 and confirm completion to your manager.

If you have questions about how these changes affect your specific work, reach out to Marcus or the #security-compliance Slack channel.

David Kim
VP of Engineering`,
    thread: "References CONTRACT-004 legal review completed Jan 2026; follow-up to company-wide GDPR policy update",
  },
];
