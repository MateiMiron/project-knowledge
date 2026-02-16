export interface SlackThread {
  id: string;
  channel: string;
  topic: string;
  messages: Array<{
    user: string;
    text: string;
    timestamp: string;
  }>;
}

export const slackThreads: SlackThread[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // Thread 1: #payments-eng — Refund edge case for partially fulfilled orders
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "slack-thread-001",
    channel: "#payments-eng",
    topic: "Refund logic for partially fulfilled orders",
    messages: [
      {
        user: "@sarah.chen",
        text: "hey team, got a support escalation that's raising an interesting edge case. customer placed an order for 3 items, only 1 has shipped so far, and they want a full refund. our current refund service doesn't handle partial fulfillment states at all - it either refunds the whole thing or nothing. anyone dealt with this before?",
        timestamp: "2026-01-20T09:14:00Z",
      },
      {
        user: "@mike.rodriguez",
        text: "yeah this has come up a few times actually. the problem is our `RefundService.process()` only looks at the order-level payment capture, not individual line items. we'd need to break it down by fulfillment status. i started scoping something for this in PAY-112 but it got deprioritized last quarter",
        timestamp: "2026-01-20T09:18:00Z",
      },
      {
        user: "@priya.sharma",
        text: "before we go too deep on the technical side - we need to check the Delivery Partner Agreement. section 4.2 covers refund obligations for partially fulfilled orders. iirc there's language about who eats the cost of restocking fees on the shipped item vs the unshipped ones. @david.nguyen can you confirm?",
        timestamp: "2026-01-20T09:23:00Z",
      },
      {
        user: "@david.nguyen",
        text: "good call @priya.sharma. i just pulled up the Delivery Partner Agreement - section 4.2.1 says: for items not yet shipped, the merchant is responsible for full refund within 48 hours. for items already in transit, the customer can either refuse delivery for a full line-item refund, or accept and initiate a return per the standard return policy. so we definitely need line-item level refund capability.",
        timestamp: "2026-01-20T09:31:00Z",
      },
      {
        user: "@sarah.chen",
        text: "ok so the approach should be:\n1. calculate refund amount per line item based on fulfillment status\n2. unshipped items -> immediate refund to original payment method\n3. shipped/in-transit items -> hold until delivery outcome is known\n4. apply any restocking fees per the merchant's policy (capped at 15% per our Merchant Services Agreement section 7.3)\n\nsound right?",
        timestamp: "2026-01-20T09:38:00Z",
      },
      {
        user: "@mike.rodriguez",
        text: "that lines up with how Stripe handles partial refunds on their end too. we can use `refunds.create()` with an `amount` param instead of refunding the full charge. i'll update PAY-112 with this spec and break it into subtasks. should be a ~2 sprint effort to do it properly with the fulfillment status checks",
        timestamp: "2026-01-20T09:42:00Z",
      },
      {
        user: "@priya.sharma",
        text: "one more thing - we should emit a `refund.partial.initiated` event so the analytics pipeline picks it up. right now our Refund Metrics Dashboard only tracks full refunds and the finance team has been asking about partial refund volume. i'll add a note to the wiki page on Refund Processing Architecture",
        timestamp: "2026-01-20T09:47:00Z",
      },
      {
        user: "@david.nguyen",
        text: "great discussion. @mike.rodriguez go ahead and pull PAY-112 into the current sprint, mark it as high priority. @sarah.chen can you respond to the support escalation and let them know we have a workaround for now (manual partial refund via Stripe dashboard) while we build the automated solution? let's target having this in staging by Feb 3rd.",
        timestamp: "2026-01-20T09:52:00Z",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Thread 2: #product-payments — Apple Pay launch timeline
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "slack-thread-002",
    channel: "#product-payments",
    topic: "Apple Pay integration readiness and launch timeline",
    messages: [
      {
        user: "@lisa.park",
        text: "hey payments team! marketing is finalizing the Q2 launch calendar and they really want Apple Pay in the press release. can someone give me an honest status update? last i saw PAY-101 was in progress but i don't know how close we actually are",
        timestamp: "2026-01-22T14:05:00Z",
      },
      {
        user: "@sarah.chen",
        text: "honest answer: we're closer than it looks but there are real blockers. the Stripe integration for Apple Pay is done and passing tests locally. the two open issues on PAY-101 are:\n1. we need Apple's merchant ID certificate renewed - the current one expires March 1st and the renewal process takes 2-3 weeks\n2. we haven't done the domain verification for our production environment yet\nneither is a ton of work but both have external dependencies",
        timestamp: "2026-01-22T14:12:00Z",
      },
      {
        user: "@mike.rodriguez",
        text: "also worth flagging - we haven't load tested the Apple Pay token decryption flow yet. it adds ~200ms to the payment processing path because of the extra crypto ops. i want to make sure we're not going to blow our p99 latency budget. that's tracked as a subtask on PAY-101",
        timestamp: "2026-01-22T14:17:00Z",
      },
      {
        user: "@lisa.park",
        text: "ok so what's a realistic date? marketing is pushing for April 1st announcement with general availability. is that doable or am i going to have to push back?",
        timestamp: "2026-01-22T14:20:00Z",
      },
      {
        user: "@david.nguyen",
        text: "i think April 1st for GA is tight but possible if we don't hit surprises. counterproposal: what if we do a phased rollout? launch Apple Pay for web checkout only on April 1st (that's the easier path, no mobile SDK work needed), then roll out in-app Apple Pay by end of April. that way marketing gets their date and we have breathing room for the mobile integration. the Apple Pay Integration Guide wiki page has the full breakdown of web vs in-app requirements",
        timestamp: "2026-01-22T14:28:00Z",
      },
      {
        user: "@lisa.park",
        text: "phased rollout actually works better for the marketing narrative too - we can do two announcements instead of one. let me run it by the team. @sarah.chen can you update PAY-101 with the revised milestones? i'll create a product brief this week",
        timestamp: "2026-01-22T14:33:00Z",
      },
      {
        user: "@sarah.chen",
        text: "will do. i'll break PAY-101 into PAY-101a (web checkout) and PAY-101b (in-app) so we can track them independently. @mike.rodriguez let's pair on the load testing this week - i booked time on the staging environment Thursday afternoon",
        timestamp: "2026-01-22T14:37:00Z",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Thread 3: #incidents — Payment outage on Jan 15
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "slack-thread-003",
    channel: "#incidents",
    topic: "Payment processing outage - Jan 15, 2026",
    messages: [
      {
        user: "@mike.rodriguez",
        text: ":rotating_light: ALERT: PagerDuty fired - payment success rate dropped to 34% in the last 5 minutes. Grafana dashboard showing massive spike in 400 errors from our `/api/payments/charge` endpoint. I'm on-call, investigating now.",
        timestamp: "2026-01-15T03:12:00Z",
      },
      {
        user: "@mike.rodriguez",
        text: "initial findings: the errors are all `webhook_signature_verification_failed`. looks like our Stripe webhook endpoint is rejecting every incoming event. checking if something changed with our signing secret. see Incident Response Playbook for the runbook on webhook failures",
        timestamp: "2026-01-15T03:18:00Z",
      },
      {
        user: "@sarah.chen",
        text: "i'm jumping on too. just checked the deploy log - we pushed v2.14.3 at 03:05 UTC which is right before the alerts started. @mike.rodriguez the diff for that release touched the webhook middleware. let me pull it up",
        timestamp: "2026-01-15T03:22:00Z",
      },
      {
        user: "@sarah.chen",
        text: "found it. in the v2.14.3 release, the `STRIPE_WEBHOOK_SECRET` env var got renamed to `STRIPE_WEBHOOK_SIGNING_SECRET` as part of the config cleanup in PAY-106, but the production environment still has the old variable name. the webhook handler is reading an undefined value and every signature check fails. this is tracked in PAY-106 - the migration step for env vars was marked as done but clearly wasn't applied to prod",
        timestamp: "2026-01-15T03:28:00Z",
      },
      {
        user: "@mike.rodriguez",
        text: "confirmed. fix options:\n1. rollback to v2.14.2 (fast, ~3 min)\n2. add the new env var to production config (also fast but need vault access)\n\ni'm going with option 1 for now to stop the bleeding, then we do option 2 properly. initiating rollback.",
        timestamp: "2026-01-15T03:31:00Z",
      },
      {
        user: "@mike.rodriguez",
        text: "rollback to v2.14.2 complete. payment success rate recovering - back to 89% and climbing. giving it a few more minutes to stabilize.",
        timestamp: "2026-01-15T03:36:00Z",
      },
      {
        user: "@david.nguyen",
        text: "thanks for the fast response both of you. @mike.rodriguez once we're fully stable, please open a postmortem doc. this one concerns me - our Stripe agreement guarantees 99.95% uptime on our end and this outage was ~25 minutes of severely degraded service. we need to understand why the env var rename wasn't caught in the deploy checklist",
        timestamp: "2026-01-15T03:42:00Z",
      },
      {
        user: "@mike.rodriguez",
        text: "fully recovered now - success rate back to 99.7% which is normal. total impact window: 03:07 to 03:36 UTC (29 minutes). estimated failed transactions: ~1,200. i'll have the postmortem doc ready by EOD tomorrow. creating PAY-118 to track adding env var validation to our CI pipeline so this can't happen again",
        timestamp: "2026-01-15T03:48:00Z",
      },
      {
        user: "@priya.sharma",
        text: "just FYI - i checked the Stripe dashboard and about 340 of those failed charges were retried successfully by client-side retry logic. so actual customer impact is closer to ~860 failed payments. i'll pull the full list for the postmortem and cross-reference with support tickets. also updating the Incident Response Playbook to add 'check recent deploys for env var changes' as a step in the webhook failure runbook",
        timestamp: "2026-01-15T04:05:00Z",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Thread 4: #engineering — New hire test environment setup
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "slack-thread-004",
    channel: "#engineering",
    topic: "New hire payment testing environment setup",
    messages: [
      {
        user: "@alex.kim",
        text: "hi everyone! first week on the team :wave: i'm trying to set up my local dev environment for the payments service and running into issues. i followed the README but when i run `make dev-setup` i get an error about missing Stripe test keys. where do i get those? didn't want to just google around for fear of using the wrong ones",
        timestamp: "2026-01-27T10:30:00Z",
      },
      {
        user: "@sarah.chen",
        text: "welcome @alex.kim! the README is a bit outdated for that step unfortunately. check the Onboarding Guide wiki page - section 3 has the full local dev setup walkthrough. for Stripe test keys specifically:\n1. go to 1Password -> \"Engineering Vaults\" -> \"Stripe Test Environment\"\n2. copy `STRIPE_TEST_SECRET_KEY` and `STRIPE_TEST_PUBLISHABLE_KEY`\n3. paste them into your `.env.local` file (there's a `.env.example` template in the repo root)\n\ndo NOT use the production keys - those are in a separate vault you shouldn't have access to yet anyway",
        timestamp: "2026-01-27T10:38:00Z",
      },
      {
        user: "@alex.kim",
        text: "found the 1Password vault, thanks! ok now i have the keys set up and the service starts, but when i try to create a test charge i get `No such customer: cus_test_xxx`. do i need to seed the local database with test data first?",
        timestamp: "2026-01-27T10:52:00Z",
      },
      {
        user: "@mike.rodriguez",
        text: "yep! run `make seed-test-data` - that'll populate your local db with test customers, products, and payment methods. it uses the Stripe test mode API to create matching resources on their end too, so everything stays in sync. should take about 30 seconds. the Onboarding Guide has a troubleshooting section if the seeding fails - usually it's a timezone mismatch thing",
        timestamp: "2026-01-27T10:58:00Z",
      },
      {
        user: "@alex.kim",
        text: "that did it! test charge went through and i can see it in the Stripe test dashboard. one more quick question - is there a way to simulate webhook events locally? i want to test the payment confirmation flow end to end",
        timestamp: "2026-01-27T11:09:00Z",
      },
      {
        user: "@sarah.chen",
        text: "use the Stripe CLI! run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` in a separate terminal. it'll forward test webhook events to your local server. you can also trigger specific events with `stripe trigger payment_intent.succeeded`. we have a cheat sheet of common test scenarios in the Onboarding Guide under section 3.4 - \"Testing Payment Flows Locally\". feel free to DM me if you hit any other snags!",
        timestamp: "2026-01-27T11:15:00Z",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Thread 5: #product-decisions — Should we support crypto payments?
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "slack-thread-005",
    channel: "#product-decisions",
    topic: "Crypto payments support - go/no-go decision",
    messages: [
      {
        user: "@lisa.park",
        text: "putting this on the table for discussion: we've gotten requests from a handful of enterprise clients asking about crypto payment support (mostly Bitcoin and USDC). before we spend any cycles on it i want to get the team's honest take. i did some initial research - the Competitor Analysis doc shows that 2 of our 5 main competitors added crypto in 2025 but neither has shared adoption numbers. thoughts?",
        timestamp: "2026-02-03T15:00:00Z",
      },
      {
        user: "@david.nguyen",
        text: "i'll be direct - i think this is a distraction right now. from an engineering perspective, crypto adds significant complexity: volatile exchange rates, longer settlement times, regulatory compliance per jurisdiction, and we'd need a whole new reconciliation pipeline. that's easily a quarter of dedicated work for 2-3 engineers. the ROI calculation in the Competitor Analysis doc suggests crypto payments would account for <1% of our transaction volume based on industry benchmarks",
        timestamp: "2026-02-03T15:08:00Z",
      },
      {
        user: "@priya.sharma",
        text: "agreeing with @david.nguyen. there's also a compliance angle that's really non-trivial. i talked to legal last month and they flagged that accepting crypto would require us to update our Payment Processing Agreement with every merchant, plus we'd need to register as a money services business in several states where we currently aren't. the legal cost alone would be significant. this is referenced in the Regulatory Compliance Checklist wiki page",
        timestamp: "2026-02-03T15:15:00Z",
      },
      {
        user: "@james.wilson",
        text: "counterpoint though - the enterprise clients asking for this are some of our bigger accounts. losing even one of them because we don't support crypto would cost more than building it. could we do a lightweight version? Stripe actually supports crypto payouts now, so we could potentially lean on their infrastructure instead of building our own. wouldn't need a custom reconciliation pipeline that way",
        timestamp: "2026-02-03T15:22:00Z",
      },
      {
        user: "@sarah.chen",
        text: "i looked into the Stripe crypto offering when it launched. it's limited to USDC on a few networks and they charge 1.5% on top of their standard fees. we'd also still need to handle the UI/UX for crypto checkout, wallet connection flows, and transaction status tracking (crypto confirmations are way slower than card payments). even with Stripe doing the heavy lifting it's not trivial. my estimate would be 6-8 weeks minimum for an MVP",
        timestamp: "2026-02-03T15:30:00Z",
      },
      {
        user: "@lisa.park",
        text: "ok i'm hearing a pretty clear consensus. let me summarize the decision:\n\n*DECISION: We will NOT pursue crypto payments support at this time.*\n\nReasoning:\n- Engineering cost is high (quarter of dedicated work or 6-8 weeks for stripped-down MVP)\n- Projected transaction volume is <1% based on industry data\n- Significant legal/compliance overhead (MSB registration, merchant agreement updates)\n- Core payment methods (cards, Apple Pay per PAY-101, ACH bank transfers) have higher ROI and unfilled gaps\n\nNext steps:\n- I'll communicate this to the enterprise clients who requested it and position it as \"on our long-term roadmap, not near-term\"\n- We revisit in 6 months (August 2026) if crypto adoption trends change materially\n- @james.wilson can you add a note to the Product Roadmap wiki page under \"Evaluated and Deferred\"?\n\nThanks everyone for the thoughtful input.",
        timestamp: "2026-02-03T15:42:00Z",
      },
      {
        user: "@james.wilson",
        text: "makes sense, i'll update the Product Roadmap page today. for the enterprise clients - we might want to point them to the Stripe crypto docs as a self-serve option they can integrate on their own checkout pages independent of our platform. that way they're not completely blocked and we look helpful rather than just saying no",
        timestamp: "2026-02-03T15:48:00Z",
      },
    ],
  },
];
