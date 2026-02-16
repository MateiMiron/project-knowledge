export interface JiraTicket {
  id: string;
  type: 'story' | 'bug' | 'task';
  title: string;
  status: string;
  priority: string;
  assignee: string;
  storyPoints: number;
  description: string;
  comments: Array<{ author: string; text: string; date: string }>;
}

export const jiraTickets: JiraTicket[] = [
  {
    id: 'PAY-101',
    type: 'story',
    title: 'Integrate Stripe Payment Intents API for checkout flow',
    status: 'in_progress',
    priority: 'critical',
    assignee: 'Sarah Chen',
    storyPoints: 13,
    description: `## Summary

Migrate our current checkout payment processing from the legacy Stripe Charges API to the Payment Intents API. This is required to support Strong Customer Authentication (SCA) regulations and to enable future support for additional payment methods. Per the Stripe Processing Agreement (Section 4.2), our SLA target is 99.95% uptime on payment processing endpoints.

## Technical Details

The migration involves replacing all calls to \`/v1/charges\` with the new \`/v1/payment_intents\` endpoint. The Payment Intents API uses a stateful object that tracks the lifecycle of a payment through multiple stages: \`requires_payment_method\`, \`requires_confirmation\`, \`requires_action\`, \`processing\`, \`succeeded\`, and \`canceled\`.

Our backend service at \`/api/payments/create-intent\` must create a PaymentIntent with the following parameters:

\`\`\`typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: order.totalInCents,
  currency: order.currency,
  payment_method_types: ['card'],
  metadata: { orderId: order.id, customerId: order.customerId },
  idempotency_key: \`order_\${order.id}_attempt_\${attemptNumber}\`,
});
\`\`\`

See the **Payment Gateway Integration Guide** on the wiki for the full architectural overview and sequence diagrams.

## Acceptance Criteria

- [ ] PaymentIntent is created server-side with correct amount, currency, and metadata
- [ ] Client-side uses \`stripe.confirmCardPayment()\` with the returned \`client_secret\`
- [ ] 3D Secure authentication flows are handled without user-visible errors
- [ ] Idempotency keys prevent duplicate charges on network retries
- [ ] All existing unit and integration tests pass with the new flow
- [ ] Webhook handler updated to listen for \`payment_intent.succeeded\` and \`payment_intent.payment_failed\`
- [ ] Monitoring dashboard updated with new PaymentIntent metric dimensions`,
    comments: [
      {
        author: 'Mike Rodriguez',
        text: 'Sarah, I reviewed the Stripe migration docs. One thing to flag: we need to handle the `requires_action` status carefully for 3DS challenges. The client must call `stripe.handleCardAction()` in that case. I updated the sequence diagram on the wiki under Payment Gateway Integration Guide > 3DS Flow.',
        date: '2026-01-08',
      },
      {
        author: 'Sarah Chen',
        text: 'Good catch Mike. I also noticed we need to update our error mapping. The PaymentIntents API returns `last_payment_error` instead of the top-level error object. I\'ve added a translation layer in `PaymentErrorMapper.ts`. Will push the branch today for early review.',
        date: '2026-01-09',
      },
      {
        author: 'Priya Sharma',
        text: 'Just a heads up from the platform side -- make sure the idempotency keys are scoped per-attempt, not per-order. We had an incident last quarter (see post-mortem INC-2045) where a retry with the same key silently returned the old failed response. As discussed in #payments-eng on Jan 8, we agreed on the format `order_{id}_attempt_{n}`.',
        date: '2026-01-10',
      },
    ],
  },
  {
    id: 'PAY-102',
    type: 'bug',
    title: 'Checkout timeout causing 504 errors under high concurrency',
    status: 'done',
    priority: 'critical',
    assignee: 'Mike Rodriguez',
    storyPoints: 8,
    description: `## Bug Report

**Environment:** Production (us-east-1)
**Frequency:** Intermittent, correlated with traffic spikes above 2,000 concurrent checkouts
**First Observed:** 2026-01-05 14:32 UTC

## Description

Under high concurrency, the checkout endpoint \`POST /api/checkout/complete\` returns HTTP 504 Gateway Timeout after the default 30-second Nginx proxy timeout. The root cause appears to be connection pool exhaustion on the payment service's HTTP client connecting to Stripe.

Error logs show the following pattern:

\`\`\`
[ERROR] 2026-01-05T14:32:18Z PaymentService - Connection pool exhausted:
  ActiveConnections=50/50, PendingRequests=312,
  AvgWaitTime=28.4s, Endpoint=api.stripe.com
TimeoutError: Request to https://api.stripe.com/v1/charges timed out after 30000ms
  at HttpClient.request (payment-client.ts:142)
  at CheckoutService.processPayment (checkout-service.ts:89)
\`\`\`

The connection pool is configured with a hard limit of 50 connections (see \`config/http-clients.yaml\`), which is insufficient during peak traffic. Additionally, there is no circuit breaker to shed load gracefully when Stripe latency degrades.

See the **Payment Service Architecture** page on the wiki for the current connection pool topology.

## Acceptance Criteria

- [ ] Increase connection pool limit to 200 with a configurable environment variable
- [ ] Implement circuit breaker with half-open state after 10 seconds
- [ ] Add request queuing with a bounded buffer (max 500 pending) and fast-fail beyond that
- [ ] Return HTTP 503 with \`Retry-After\` header instead of 504 when load shedding
- [ ] Add DataDog metrics for pool utilization, queue depth, and circuit breaker state
- [ ] Load test confirms stable operation at 5,000 concurrent checkouts`,
    comments: [
      {
        author: 'James Wilson',
        text: 'I pulled the DataDog traces from the incident window. The p99 latency to Stripe jumped from 800ms to 12s around 14:30 UTC. Looks like Stripe had a partial degradation on their end (they posted on status.stripe.com at 14:45). But our system should have handled it gracefully. The connection pool was the bottleneck -- once all 50 connections were waiting on slow Stripe responses, everything backed up.',
        date: '2026-01-06',
      },
      {
        author: 'Mike Rodriguez',
        text: 'Fix is up in PR #1847. I went with `opossum` for the circuit breaker implementation. Config: `errorThresholdPercentage: 50, resetTimeout: 10000, rollingCountTimeout: 30000`. The pool is now at 200 connections with a 5s per-request timeout. Also added a bulkhead pattern so payment requests can\'t starve the health check endpoint. Per the Stripe Processing Agreement, we need to handle their degraded mode without cascading failures on our side.',
        date: '2026-01-07',
      },
      {
        author: 'Sarah Chen',
        text: 'Verified in staging with Locust. At 5,000 concurrent users, success rate is 99.2% and p99 is 2.1s. When I injected 15s Stripe latency via toxiproxy, the circuit breaker opened within 4 seconds and we returned 503 with Retry-After. No 504s observed. Ship it.',
        date: '2026-01-08',
      },
    ],
  },
  {
    id: 'PAY-103',
    type: 'story',
    title: 'Add Apple Pay support to web and mobile checkout',
    status: 'code_review',
    priority: 'high',
    assignee: 'Alex Kim',
    storyPoints: 8,
    description: `## Summary

Enable Apple Pay as a payment method across our web checkout (via Stripe's Payment Request Button) and native iOS app. Market research shows 38% of our mobile users are on iOS, and Apple Pay conversion rates are 2-3x higher than manual card entry. As discussed in #payments-eng on Jan 15, this is a top priority for Q1.

## Technical Details

**Web Implementation:**
Use Stripe's Payment Request API integration via \`@stripe/stripe-js\`. The Payment Request Button automatically handles Apple Pay on Safari and Google Pay on Chrome. Our frontend must:

1. Check for Apple Pay support via \`stripe.paymentRequest()\` with \`canMakePayment()\`
2. Render the native payment sheet with order summary
3. Handle the \`paymentmethod\` event to confirm the PaymentIntent server-side

\`\`\`typescript
const paymentRequest = stripe.paymentRequest({
  country: 'US',
  currency: 'usd',
  total: { label: 'Order Total', amount: cart.totalInCents },
  requestPayerName: true,
  requestPayerEmail: true,
});
\`\`\`

**iOS Implementation:**
Integrate \`PKPaymentAuthorizationViewController\` and pass the resulting \`PKPayment.token\` to our backend, which forwards it to Stripe as a tokenized payment method.

Domain verification is required: we must host \`/.well-known/apple-developer-merchantid-domain-association\` on our checkout domain. See the **Apple Pay Domain Verification** section on the wiki.

## Acceptance Criteria

- [ ] Apple Pay button renders on supported devices and hides gracefully on unsupported devices
- [ ] Payment sheet displays correct order total, line items, and shipping options
- [ ] Successful payments create a PaymentIntent with \`payment_method_types: ['card']\` (Apple Pay is tokenized as a card)
- [ ] Domain verification file is deployed and validated by Apple
- [ ] Analytics events fire for: button_shown, button_clicked, sheet_dismissed, payment_succeeded, payment_failed
- [ ] A/B test framework configured to roll out to 10% of eligible users initially`,
    comments: [
      {
        author: 'Priya Sharma',
        text: 'Alex, for the domain verification -- I already have the association file from our previous Apple Pay investigation. I\'ll open a separate infra PR to deploy it to `/.well-known/`. Also, make sure we\'re using the merchant ID `merchant.com.ourstore.payments` that\'s registered in our Apple Developer account, not the sandbox one.',
        date: '2026-01-16',
      },
      {
        author: 'Sarah Chen',
        text: 'One thing to watch: the `paymentRequest` API returns shipping address updates via the `shippingaddresschange` event. We need to recalculate tax in real-time when the user changes their shipping address in the Apple Pay sheet. I\'d suggest hitting our existing `POST /api/tax/estimate` endpoint from the event handler. Also, the wiki page on Payment Gateway Integration Guide has a section on tokenized payment methods that covers the backend flow.',
        date: '2026-01-17',
      },
      {
        author: 'Alex Kim',
        text: 'Good points. I\'ve updated the PR to handle shipping address changes and recalculate tax. For the A/B test, I\'m using our LaunchDarkly flag `apple-pay-web-enabled` with a 10% rollout targeting iOS Safari users. The flag check happens before we even call `canMakePayment()` to avoid unnecessary Stripe SDK initialization.',
        date: '2026-01-18',
      },
    ],
  },
  {
    id: 'PAY-104',
    type: 'bug',
    title: 'Double charge occurring on retry after network interruption',
    status: 'in_progress',
    priority: 'critical',
    assignee: 'Priya Sharma',
    storyPoints: 5,
    description: `## Bug Report

**Environment:** Production (all regions)
**Frequency:** ~0.3% of all transactions (approx 45 per day)
**Severity:** Critical -- direct financial impact to customers
**First Observed:** 2026-01-12 via customer support escalation (CS-4521)

## Description

Customers are being charged twice for the same order when a network interruption occurs between our backend confirming the Stripe PaymentIntent and our database committing the order record. The race condition occurs in \`CheckoutService.finalizeOrder()\`:

\`\`\`typescript
// PROBLEMATIC CODE PATH:
async finalizeOrder(orderId: string, paymentIntentId: string) {
  // Step 1: Confirm payment with Stripe (succeeds)
  const intent = await stripe.paymentIntents.confirm(paymentIntentId);

  // --- Network blip or process restart here ---

  // Step 2: Update order in DB (fails/never executes)
  await this.orderRepo.markAsPaid(orderId, intent.id);

  // Step 3: Customer retries, new PaymentIntent created, charged again
}
\`\`\`

The core issue is that Steps 1 and 2 are not atomic. When the process crashes or the database connection drops after Stripe confirms but before the DB write, the order remains in \`pending_payment\` status. The customer (or our retry logic) initiates a new payment, resulting in a double charge.

Customer impact: 127 double charges identified in the last 30 days totaling $14,832. Finance team has been issuing manual refunds (see Slack thread in #payments-oncall from Jan 12).

## Acceptance Criteria

- [ ] Implement idempotency at the order level: check for existing successful PaymentIntent before creating a new one
- [ ] Add a \`payment_intent_id\` column to the orders table with a unique constraint
- [ ] Wrap the confirm + DB write in a distributed transaction or use the outbox pattern
- [ ] Create a reconciliation job that detects orphaned PaymentIntents and auto-refunds them
- [ ] Backfill refunds for all 127 affected customers
- [ ] Add alerting for duplicate payment detection (threshold: > 5 in any 1-hour window)`,
    comments: [
      {
        author: 'James Wilson',
        text: 'I ran a query against Stripe and our DB for the last 30 days. Confirmed 127 double charges. I\'ve exported the list to a CSV in the shared drive and flagged the finance team. For the fix, I strongly recommend the outbox pattern over distributed transactions. We had bad experiences with 2PC in the inventory service last year. Reference: see the **Distributed Transactions** page on the wiki for our recommended patterns.',
        date: '2026-01-13',
      },
      {
        author: 'Priya Sharma',
        text: 'Agreed on the outbox pattern. My plan:\n1. Before calling Stripe, write a `payment_attempt` record with status `initiated`\n2. Call Stripe confirm\n3. Update `payment_attempt` to `confirmed` with the PaymentIntent ID\n4. A separate processor picks up `confirmed` attempts and updates the order\n\nIf step 2 fails, we clean up. If step 3 fails, the processor reconciles by checking Stripe. The idempotency key on the PaymentIntent ensures Stripe never double-charges even if we retry step 2.',
        date: '2026-01-14',
      },
      {
        author: 'Mike Rodriguez',
        text: 'Per the Stripe Processing Agreement, Section 7.1: we are liable for any duplicate charges not refunded within 5 business days. Let\'s make sure the reconciliation job runs hourly and auto-refunds anything it catches. Also flagging that we need a migration to add the `payment_intent_id` column -- I\'ll coordinate with the DBA team on the rollout window since the orders table has 40M rows.',
        date: '2026-01-15',
      },
    ],
  },
  {
    id: 'PAY-105',
    type: 'story',
    title: 'Automated refund processing system with configurable rules engine',
    status: 'todo',
    priority: 'high',
    assignee: 'James Wilson',
    storyPoints: 13,
    description: `## Summary

Build an automated refund processing system to replace the current manual workflow handled by the CS team. Currently, all refund requests go through a Zendesk queue where agents manually issue refunds via the Stripe Dashboard. Average processing time is 2.3 business days. The goal is to auto-approve and process refunds that meet configurable policy rules within 5 minutes of request.

## Technical Details

The system consists of three components:

**1. Rules Engine (\`RefundRulesEngine\`)**
A configurable rules engine that evaluates refund requests against business policies. Rules are defined in a YAML config and evaluated in order:

\`\`\`yaml
refund_rules:
  - name: auto_approve_small_amount
    condition: "amount <= 50.00 AND daysSincePurchase <= 30"
    action: auto_approve
  - name: auto_approve_digital_goods
    condition: "itemType == 'digital' AND NOT consumed AND daysSincePurchase <= 14"
    action: auto_approve
  - name: flag_high_value
    condition: "amount > 200.00 OR refundCountLast90Days > 3"
    action: manual_review
  - name: reject_final_sale
    condition: "itemTag == 'final_sale'"
    action: auto_reject
\`\`\`

**2. Refund Processor (\`RefundProcessor\`)**
Executes approved refunds via the Stripe Refunds API (\`POST /v1/refunds\`). Supports full and partial refunds. Must handle Stripe's refund failure scenarios (insufficient balance, disputed charge, etc.).

**3. Notification Service**
Sends real-time status updates to customers via email and push notification. Integrates with our existing notification service at \`POST /api/notifications/send\`.

See the **Refund Policy Matrix** on the wiki for the complete set of business rules that need to be implemented. As discussed in #payments-eng on Jan 20, the CS team has signed off on the initial rule set.

## Acceptance Criteria

- [ ] Rules engine evaluates requests against configurable YAML policies
- [ ] Auto-approved refunds are processed via Stripe within 5 minutes
- [ ] Manual review queue created for flagged refunds with CS agent dashboard
- [ ] Partial refunds supported for multi-item orders
- [ ] Audit trail records every decision with the rule that triggered it
- [ ] Customer notified at each status change (requested, approved, processed, rejected)
- [ ] Admin API to update rules without deployment (\`PUT /api/admin/refund-rules\`)`,
    comments: [
      {
        author: 'Sarah Chen',
        text: 'James, for the rules engine I\'d recommend using `json-rules-engine` (npm package) rather than building from scratch. It supports complex boolean logic, priority ordering, and has good TypeScript support. We used it in the fraud detection PoC last quarter and it worked well. I can share the wrapper code from that project.',
        date: '2026-01-21',
      },
      {
        author: 'Alex Kim',
        text: 'From the frontend side -- I\'ll need an API contract for the CS agent review dashboard. Can we define the endpoints early? I\'m thinking: `GET /api/admin/refunds?status=pending_review` for the queue, `POST /api/admin/refunds/:id/approve` and `POST /api/admin/refunds/:id/reject` for actions. Also, the notification service expects a specific payload schema documented on the wiki under Notification Service API.',
        date: '2026-01-22',
      },
      {
        author: 'James Wilson',
        text: 'Great suggestions. I\'ll use json-rules-engine and define the API contract in an OpenAPI spec this week. One concern from the finance team: per our Stripe Processing Agreement, refunds on transactions older than 180 days must go through a different flow (credits instead of card refunds). I\'ll add that as a rule. Also adding an escape hatch: any refund over $500 requires two-person approval regardless of rules.',
        date: '2026-01-23',
      },
    ],
  },
  {
    id: 'PAY-106',
    type: 'task',
    title: 'PCI DSS v4.0 compliance audit preparation and remediation',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Sarah Chen',
    storyPoints: 8,
    description: `## Summary

Prepare for our annual PCI DSS compliance audit, now against the v4.0 standard (effective March 2025). Our QSA (Qualified Security Assessor) from CoalFire has scheduled the on-site audit for February 24-28, 2026. Several new requirements in v4.0 need remediation before the audit.

## Technical Details

**Key v4.0 changes affecting our payment stack:**

1. **Requirement 6.4.3 -- Client-side script management:** All JavaScript loaded on payment pages must be inventoried, authorized, and integrity-checked. We need to implement Subresource Integrity (SRI) hashes for all third-party scripts on the checkout page and set up a Content Security Policy (CSP) that restricts script sources.

2. **Requirement 8.3.6 -- Password complexity:** Minimum 12 characters for all system accounts accessing the cardholder data environment (CDE). Our current minimum is 8. Requires updating IAM policies in AWS and our internal auth service.

3. **Requirement 11.6.1 -- Change detection on payment pages:** Deploy a mechanism to detect unauthorized modifications to HTTP headers and script content on payment pages. We need to implement a monitoring solution that alerts on any DOM changes to the checkout page.

4. **Requirement 12.3.1 -- Targeted risk analysis:** Document a formal risk analysis for each PCI requirement where we use a "customized approach." Our current documentation needs to be updated in Confluence.

See the **PCI DSS Compliance Tracker** on the wiki for the full requirement matrix and current status. Per our contract with CoalFire (Statement of Work dated Nov 2025), the pre-audit documentation package is due February 14.

## Acceptance Criteria

- [ ] SRI hashes added to all third-party scripts on checkout pages
- [ ] CSP headers configured and tested (report-only mode first, then enforce)
- [ ] Password minimum length updated to 12 characters across all CDE systems
- [ ] Payment page change detection monitoring deployed and alerting
- [ ] All compliance documentation updated in Confluence
- [ ] Pre-audit self-assessment questionnaire (SAQ) completed and submitted to CoalFire
- [ ] Penetration test results from Q4 2025 remediation items verified as closed`,
    comments: [
      {
        author: 'Priya Sharma',
        text: 'Sarah, I\'ve completed the SRI hash generation for all checkout page scripts. Here\'s what we\'re loading:\n- `stripe-js@3.1.0`: `sha384-abc123...`\n- `analytics.min.js`: `sha384-def456...`\n- `checkout-ui@2.8.1`: `sha384-ghi789...`\n\nI\'ve also drafted the CSP header. Running it in report-only mode this week. We\'re getting some violations from our A/B testing script that loads dynamic content -- need to whitelist that or find an alternative approach.',
        date: '2026-01-25',
      },
      {
        author: 'Mike Rodriguez',
        text: 'For Requirement 11.6.1, I\'m proposing we use a combination of Cloudflare Page Shield (we already have an Enterprise plan) and a custom Lambda@Edge function that computes a hash of the payment page DOM and compares it against a known-good baseline. Any deviation triggers a PagerDuty alert. I\'ve documented the architecture in the **PCI DSS Compliance Tracker** on the wiki.',
        date: '2026-01-27',
      },
    ],
  },
  {
    id: 'PAY-107',
    type: 'bug',
    title: 'Stripe webhook signature validation failing intermittently',
    status: 'code_review',
    priority: 'high',
    assignee: 'Alex Kim',
    storyPoints: 3,
    description: `## Bug Report

**Environment:** Production (us-east-1, us-west-2)
**Frequency:** ~2% of incoming webhooks (approx 800/day)
**First Observed:** 2026-01-18 after deployment v3.42.0

## Description

Stripe webhook signature validation is failing intermittently on our webhook endpoint \`POST /api/webhooks/stripe\`. The failures correlate with requests routed through our new API gateway (Kong) which was deployed in v3.42.0. The error from the Stripe SDK:

\`\`\`
Stripe webhook signature verification failed:
  No matching signature found for payload.
  Expected signature: whsec_...
  Are you passing the raw request body?
StripeSignatureVerificationError
  at Webhook.constructEvent (node_modules/stripe/lib/Webhooks.js:45:15)
  at WebhookController.handleStripeEvent (webhook-controller.ts:28)
\`\`\`

**Root Cause Analysis:**
Kong's request body parsing middleware is consuming the raw request body and re-serializing it as JSON. This changes whitespace and key ordering, invalidating the HMAC signature. The Stripe SDK requires the **exact raw bytes** received from Stripe to verify the \`Stripe-Signature\` header.

\`\`\`typescript
// CURRENT (BROKEN) - body has been parsed and re-serialized by Kong
const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

// FIXED - use raw body buffer before any parsing
const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
\`\`\`

As discussed in #payments-eng on Jan 19, the quick fix is to configure Kong to pass through the raw body for the webhook route. Long-term, we should extract the raw body at the edge before any middleware processes it.

## Acceptance Criteria

- [ ] Kong configured to skip body parsing for \`/api/webhooks/stripe\` route
- [ ] Webhook handler uses \`req.rawBody\` (raw buffer) for signature verification
- [ ] Express middleware added to capture raw body: \`app.use(express.raw({ type: 'application/json' }))\` on webhook routes
- [ ] Signature verification success rate returns to 100%
- [ ] Alert configured for signature failure rate > 0.1%
- [ ] No dropped webhook events during the fix deployment (verify via Stripe webhook logs)`,
    comments: [
      {
        author: 'James Wilson',
        text: 'I checked the Stripe webhook dashboard and we have 2,341 failed deliveries in the last 72 hours. Stripe auto-retries failed webhooks for up to 72 hours, so we haven\'t lost any events yet -- but we need to fix this before the retry window expires. Some of those are `payment_intent.succeeded` events that trigger order fulfillment, so missing them means orders stuck in "processing" state.',
        date: '2026-01-19',
      },
      {
        author: 'Alex Kim',
        text: 'Fix is up in PR #1863. Two changes:\n1. Kong route config: added `strip_request_body: false` and `request_buffering: off` for the webhook path\n2. Express middleware: `app.use(\'/api/webhooks/stripe\', express.raw({ type: \'application/json\' }))` before the JSON parser\n\nI\'ve verified in staging that all test webhook events from Stripe CLI (`stripe trigger payment_intent.succeeded`) pass signature validation. The raw body is preserved byte-for-byte.',
        date: '2026-01-20',
      },
      {
        author: 'Priya Sharma',
        text: 'Reviewed the PR -- looks good. One suggestion: add a fallback that logs the raw body hash and Stripe\'s expected signature hash when verification fails, so we can debug faster if this recurs. Also please add a unit test that sends a webhook with known signature and asserts verification passes even after Express middleware chain. See the **Webhook Integration Patterns** page on the wiki for our testing conventions.',
        date: '2026-01-21',
      },
    ],
  },
  {
    id: 'PAY-108',
    type: 'story',
    title: 'Real-time fraud detection scoring for payment transactions',
    status: 'todo',
    priority: 'medium',
    assignee: 'Priya Sharma',
    storyPoints: 13,
    description: `## Summary

Implement a real-time fraud detection scoring system that evaluates every payment transaction before authorization. Currently, we rely solely on Stripe Radar, which catches ~85% of fraudulent transactions. Our chargeback rate is 0.42%, above the Visa threshold of 0.65% that would place us in their monitoring program. We need a supplementary in-house scoring layer to bring this below 0.3%.

## Technical Details

The fraud scoring pipeline evaluates transactions in real-time (<200ms p99) using a combination of rules and ML signals:

**Signal Sources:**
- Device fingerprinting (via FingerprintJS Pro, already integrated)
- IP geolocation and velocity (requests per IP per hour)
- Card BIN analysis and velocity (unique cards per customer per day)
- Shipping/billing address mismatch detection
- Historical customer behavior (purchase frequency, average order value deviation)
- Email domain risk scoring (disposable email detection)

**Architecture:**
1. Pre-authorization hook intercepts the payment at \`PaymentService.authorize()\`
2. Signals are gathered in parallel from Redis (velocity counters), PostgreSQL (customer history), and external APIs (IP/device)
3. Rule engine evaluates signals and produces a score from 0-100
4. Score determines action: \`approve\` (0-40), \`review\` (41-70), \`block\` (71-100)
5. Results are logged to our analytics pipeline for model training

\`\`\`typescript
interface FraudSignals {
  deviceFingerprint: string;
  ipRiskScore: number;
  velocityScore: number;
  addressMismatch: boolean;
  customerTrustScore: number;
  emailDomainRisk: 'low' | 'medium' | 'high';
}
\`\`\`

Per our contract with Visa (Merchant Agreement Section 9), we must demonstrate active fraud mitigation measures during our quarterly review. See the **Fraud Prevention Strategy** page on the wiki for the full model architecture and signal weights.

## Acceptance Criteria

- [ ] Fraud scoring evaluates every transaction in <200ms p99 latency
- [ ] Scoring result (approve/review/block) is enforced before Stripe authorization
- [ ] Manual review queue exposed via internal admin API for flagged transactions
- [ ] Velocity counters implemented in Redis with sliding window (1h, 24h, 7d)
- [ ] Dashboard displays real-time fraud metrics: score distribution, block rate, false positive rate
- [ ] A/B test in shadow mode (score but don't block) for 2 weeks before enforcement
- [ ] All signals and scores logged for offline ML model training`,
    comments: [
      {
        author: 'Sarah Chen',
        text: 'Priya, I did some analysis on our last 6 months of chargebacks. The top fraud vectors are: 1) Card testing attacks from single IPs (34%), 2) Stolen cards with mismatched billing/shipping (28%), 3) Account takeover with changed shipping address (22%). Velocity checks alone would catch most of category 1. I\'ve put the detailed analysis in a doc linked from the **Fraud Prevention Strategy** wiki page.',
        date: '2026-01-28',
      },
      {
        author: 'Mike Rodriguez',
        text: 'For the latency requirement, I\'d suggest we pre-compute as much as possible. The velocity counters in Redis should use `INCR` with `EXPIRE` for the sliding windows rather than sorted sets -- it\'s O(1) vs O(log n). Device fingerprint lookup is already cached. The only blocking call will be the IP geolocation API; we should cache those aggressively (IPs don\'t change geo often). I can help with the Redis schema design.',
        date: '2026-01-29',
      },
      {
        author: 'Priya Sharma',
        text: 'Great data, Sarah. Mike, agreed on Redis optimization. I\'m also going to integrate with Stripe Radar\'s risk_score via the PaymentIntent metadata so we can combine their ML score with ours. The combined approach should give us much better coverage. For the shadow mode rollout, I\'ll use the same LaunchDarkly flag pattern Alex used for Apple Pay (PAY-103). As discussed in #payments-eng on Jan 28, we\'ll run shadow mode for 2 weeks before enforcing.',
        date: '2026-01-30',
      },
    ],
  },
  {
    id: 'PAY-109',
    type: 'task',
    title: 'Payment service load testing and capacity planning for Q2 sale event',
    status: 'todo',
    priority: 'medium',
    assignee: 'Mike Rodriguez',
    storyPoints: 5,
    description: `## Summary

Conduct comprehensive load testing of the payment service to establish capacity baselines and ensure we can handle the projected Q2 Summer Sale traffic. Last year's Summer Sale peak was 8,500 concurrent checkouts with a 12x traffic multiplier over normal baseline. This year, marketing projects a 15x multiplier based on expanded product catalog and new market launches.

## Technical Details

**Test Scenarios:**

1. **Steady-state baseline:** 500 concurrent users, sustained for 30 minutes. Measure throughput, latency percentiles (p50, p95, p99), and error rate.

2. **Ramp-up:** Linear ramp from 500 to 10,000 concurrent users over 15 minutes. Identify the breaking point where p99 exceeds 3 seconds or error rate exceeds 1%.

3. **Spike test:** Instant jump from baseline to 12,000 concurrent users. Verify auto-scaling triggers within 90 seconds and the circuit breaker (from PAY-102) handles the initial load.

4. **Endurance test:** 5,000 concurrent users sustained for 2 hours. Monitor for memory leaks, connection pool drift, and database connection exhaustion.

5. **Failure injection:** Simulate Stripe API degradation (5s latency) and complete outage during peak load. Verify graceful degradation and recovery.

**Tooling:**
- k6 for load generation (scripts in \`/test/load/\` directory)
- Grafana dashboards for real-time monitoring during tests
- DataDog APM for distributed tracing of slow requests

Results should be documented in the **Capacity Planning** page on the wiki. Per our SLA with the business (see internal Operations Agreement), payment processing must maintain 99.9% availability during sale events.

## Acceptance Criteria

- [ ] All 5 test scenarios executed in staging environment with production-equivalent config
- [ ] Auto-scaling verified: payment service scales from 4 to 20 pods within 90 seconds
- [ ] Database connection pool tuned for peak load (currently 20 per pod, may need increase)
- [ ] Stripe rate limits verified: we are on the Scale tier (10,000 req/s), confirm with Stripe
- [ ] Results documented with graphs: throughput vs. latency, error rate, and resource utilization
- [ ] Remediation plan for any bottlenecks identified
- [ ] Runbook updated with expected metrics during sale event for on-call team`,
    comments: [
      {
        author: 'Alex Kim',
        text: 'Mike, I updated the k6 scripts in `/test/load/` to include the new Payment Intents flow from PAY-101. The old scripts were still using the Charges API. I also added a scenario that tests Apple Pay tokenized payments (PAY-103) at 15% of total traffic, which matches our projected adoption. The scripts pull test card numbers from `test/fixtures/stripe-test-cards.json`.',
        date: '2026-02-01',
      },
      {
        author: 'James Wilson',
        text: 'I checked with our Stripe account manager -- we\'re confirmed on the Scale tier with 10,000 req/s rate limit. However, during last year\'s sale, we hit 7,200 req/s at peak. With the 15x multiplier, we might exceed the limit. I\'ve requested a temporary rate limit increase for the sale window (June 15-22). They said they\'ll confirm by Feb 15. Per the Stripe Processing Agreement, rate limit increases for planned events must be requested 30 days in advance.',
        date: '2026-02-02',
      },
    ],
  },
  {
    id: 'PAY-110',
    type: 'story',
    title: 'Implement payment method tokenization vault for recurring billing',
    status: 'todo',
    priority: 'medium',
    assignee: 'James Wilson',
    storyPoints: 8,
    description: `## Summary

Build a secure payment method tokenization vault that stores customer payment methods as Stripe Customer + PaymentMethod objects for recurring billing. This supports the upcoming subscription feature (tracked separately in SUB-201) and enables one-click checkout for returning customers. Currently, customers must re-enter card details for every purchase.

## Technical Details

**Architecture:**

The vault is a thin service layer over Stripe's Customer and PaymentMethod APIs. We never store raw card data (PAN, CVV) -- only Stripe's opaque token references.

\`\`\`typescript
interface StoredPaymentMethod {
  id: string;                    // Our internal UUID
  customerId: string;            // Our customer ID
  stripeCustomerId: string;      // Stripe Customer ID (cus_xxx)
  stripePaymentMethodId: string; // Stripe PaymentMethod ID (pm_xxx)
  type: 'card' | 'apple_pay' | 'google_pay';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: Date;
}
\`\`\`

**Key Flows:**

1. **Save payment method:** After successful checkout, prompt user to save card. Call \`stripe.paymentMethods.attach(pm_xxx, { customer: cus_xxx })\` and store the reference in our database.

2. **One-click checkout:** Retrieve saved payment methods via \`GET /api/customers/:id/payment-methods\`. Create PaymentIntent with \`customer\` and \`payment_method\` params, set \`off_session: false\` for on-session payments.

3. **Recurring billing:** For subscriptions, create PaymentIntent with \`off_session: true\` and \`confirm: true\`. Handle \`requires_action\` status by sending the customer an email with a link to complete authentication.

4. **Card update:** When Stripe sends \`payment_method.updated\` webhook (card network auto-updates expiry), update our stored reference.

See the **Customer Data Architecture** page on the wiki for the database schema and data retention policies. As discussed in #payments-eng on Feb 3, we need to coordinate with the accounts team on the customer identity merge flow.

## Acceptance Criteria

- [ ] Customers can save payment methods during checkout (opt-in with checkbox)
- [ ] Saved methods displayed on account page with card brand, last 4, and expiry
- [ ] One-click checkout works with saved payment method (skip card entry form)
- [ ] Default payment method can be set and changed by customer
- [ ] Payment methods can be deleted by customer (detaches from Stripe Customer)
- [ ] Card auto-updates handled via \`payment_method.updated\` webhook
- [ ] Stored references encrypted at rest using AWS KMS (CMK: \`alias/payment-vault-key\`)
- [ ] GDPR deletion: payment methods purged when customer requests account deletion`,
    comments: [
      {
        author: 'Sarah Chen',
        text: 'James, important note on PCI scope: since we\'re only storing Stripe token references (not card numbers), this doesn\'t expand our CDE. But we still need to treat the `stripePaymentMethodId` as sensitive since it can be used to charge the card. I recommend encrypting the `stripe_payment_method_id` and `stripe_customer_id` columns with application-level encryption via AWS KMS, in addition to RDS encryption at rest. See our PCI DSS compliance notes on the wiki (PAY-106 related).',
        date: '2026-02-04',
      },
      {
        author: 'Priya Sharma',
        text: 'For the recurring billing flow with `off_session: true`, we need to handle SCA challenges carefully. If the bank requires 3DS on an off-session payment, Stripe returns `requires_action` and we can\'t pop up the 3DS modal. The recommended pattern is:\n1. Email the customer a link to `/payments/authenticate?pi=pi_xxx`\n2. That page calls `stripe.confirmCardPayment()` with the existing PaymentIntent\n3. After auth, the payment completes\n\nI\'ll handle this in the notification templates for the subscription service (SUB-201).',
        date: '2026-02-05',
      },
      {
        author: 'James Wilson',
        text: 'Great points. I\'ve updated the design doc to include KMS encryption for Stripe references. For the database schema, I\'m adding a `payment_methods` table with a foreign key to `customers` and a unique constraint on `(customer_id, stripe_payment_method_id)`. Migration will be in a separate PR since it touches production schema. Per the Stripe Processing Agreement, we must notify customers before their first off-session charge -- I\'ll add that to the acceptance criteria for SUB-201.',
        date: '2026-02-06',
      },
    ],
  },
];
