export interface Postmortem {
  id: string;
  title: string;
  incidentDate: string;
  severity: string;
  duration: string;
  author: string;
  content: string;
}

export const postmortems: Postmortem[] = [
  {
    id: "POSTMORTEM-001",
    title: "Payment Processing Outage - Black Friday 2024",
    incidentDate: "2024-11-29",
    severity: "SEV-1",
    duration: "2h 15m",
    author: "Marcus Chen",
    content: `# Postmortem: Payment Processing Outage - Black Friday 2024

## Summary

On November 29, 2024, our payment processing pipeline experienced a full outage lasting 2 hours and 15 minutes during peak Black Friday traffic. Stripe webhook processing backed up due to insufficient worker pool capacity, causing approximately 15,000 orders to either fail or remain in a pending state. The incident resulted in an estimated $1.2M in lost revenue and significant customer dissatisfaction during our highest-traffic sales event of the year.

## Impact

- **Orders affected:** ~15,000 (failed or stuck in pending)
- **Estimated lost revenue:** $1.2M
- **Customer support tickets filed:** 3,200
- **Refunds issued post-resolution:** 1,850 (for duplicate or ghost charges)
- **Merchant SLA violation:** Yes, breach of 99.95% uptime per CONTRACT-001 (Stripe SLA)

## Timeline (all times UTC)

- **13:42** - Traffic begins ramping to 10x normal levels as Black Friday doorbusters go live.
- **14:05** - Monitoring alerts fire: webhook processing latency exceeds 30s threshold.
- **14:08** - On-call engineer Marcus Chen acknowledges alert and begins investigation.
- **14:15** - Database connection pool saturation identified. Active connections at 100/100 limit. Webhook worker threads are blocking on DB writes.
- **14:22** - Incident escalated to SEV-1. War room opened in Slack (#incident-20241129).
- **14:35** - First mitigation attempted: connection pool limit raised to 200. Partial relief observed but queue continues growing.
- **14:50** - Stripe webhook retry backlog reaches 40,000 events. Stripe begins dropping webhooks per retry policy.
- **15:10** - Decision made to horizontally scale webhook worker pods from 4 to 16 replicas.
- **15:25** - New pods online. Connection pool distributed across replicas with 50 connections each.
- **15:45** - Webhook backlog begins draining. Processing latency drops below 5s.
- **16:20** - Backlog fully cleared. All systems nominal. Incident downgraded to monitoring phase.

## Root Cause

The root cause was connection pool exhaustion under approximately 10x normal transaction load. Our webhook processing workers shared a single connection pool configured with a hard limit of 100 connections. Under normal load (~500 webhooks/min), this was sufficient. During Black Friday peak (~5,000 webhooks/min), all 100 connections were consumed by long-running payment confirmation DB writes. Subsequent webhook handlers blocked waiting for connections, causing a cascading backlog. The Stripe webhook retry mechanism compounded the problem by redelivering unacknowledged events, further increasing inbound volume. Load testing conducted under PAY-109 had only simulated 3x normal load, which was insufficient to surface this bottleneck.

## Resolution

Immediate resolution involved scaling the webhook worker deployment from 4 to 16 pods and distributing the connection pool across replicas. A post-incident database parameter tuning increased the max connections from 100 to 500 at the database level. The Stripe webhook endpoint was updated to return 200 OK immediately upon receipt, deferring processing to an async queue to prevent retry storms.

## Action Items

1. **Implement async webhook ingestion queue** - Decouple webhook receipt from processing using SQS/Redis. Webhook endpoint should enqueue and acknowledge immediately. Owner: Sarah Kim. Due: 2024-12-13. See PAY-109.
2. **Update load testing to simulate 15x peak traffic** - Current load tests (PAY-109) only cover 3x. Must include sustained burst scenarios matching Black Friday patterns. Owner: Marcus Chen. Due: 2024-12-20.
3. **Configure auto-scaling policies for webhook workers** - HPA should trigger at 60% connection pool utilization, not 80% CPU. Owner: DevOps. Due: 2024-12-10.
4. **Establish Stripe webhook replay procedure** - Document and test the process for requesting webhook replay from Stripe for dropped events. Add to Incident Playbook (wiki-003). Owner: James Liu. Due: 2024-12-06.
5. **Negotiate updated SLA terms with Stripe** - Review CONTRACT-001 for burst traffic provisions and webhook delivery guarantees during high-volume events. Owner: Emily Carter. Due: 2025-01-15.

## Lessons Learned

- Load testing must reflect actual peak scenarios, not conservative estimates. Our 3x multiplier was dangerously optimistic for a Black Friday event.
- Synchronous webhook processing is a single point of failure. Async ingestion with backpressure controls should be the default pattern.
- The Incident Playbook (wiki-003) was instrumental in coordinating the response. The war room structure and escalation paths worked well and should be maintained.
- We lacked runbooks for Stripe-specific failure modes. The team spent 20 minutes diagnosing what turned out to be a well-known connection pool pattern.`,
  },
  {
    id: "POSTMORTEM-002",
    title: "Double Charge Incident - Mobile Checkout",
    incidentDate: "2024-10-14",
    severity: "SEV-2",
    duration: "45m",
    author: "Sarah Kim",
    content: `# Postmortem: Double Charge Incident - Mobile Checkout

## Summary

On October 14, 2024, approximately 200 customers using the mobile checkout flow were charged twice for the same order. The issue persisted for 45 minutes before detection and resolution. The root cause was a missing idempotency key on payment retry requests originating from the mobile client. When users experienced network timeouts and the client auto-retried, the payment gateway processed each retry as a new charge. Total duplicate charges amounted to $12,400, all of which were refunded within 24 hours.

## Impact

- **Customers affected:** ~200
- **Duplicate charges total:** $12,400
- **Average duplicate charge:** $62.00
- **Customer support tickets:** 87 (within first 2 hours)
- **Social media complaints:** 14 tweets, 3 Reddit threads
- **Refund processing time:** All refunds issued within 24 hours
- **Reputational impact:** Moderate - several customers posted screenshots of duplicate charges

## Timeline (all times UTC)

- **09:30** - Mobile app release v3.8.2 deployed to production, including updated checkout retry logic (PAY-104).
- **11:12** - Customer support flags unusual spike in "charged twice" complaints via Slack.
- **11:18** - On-call engineer Sarah Kim begins investigation. Queries payment logs for duplicate payment intents.
- **11:25** - Pattern identified: all double charges originate from mobile app v3.8.2. Retry requests are missing the \`Idempotency-Key\` header.
- **11:32** - Root cause confirmed. The retry logic refactored in PAY-104 inadvertently removed the idempotency key from retry headers.
- **11:38** - Hotfix branch created. Idempotency key generation restored in retry path.
- **11:50** - Hotfix deployed via server-side feature flag disabling client retries and enabling server-side retry with idempotency.
- **11:57** - Monitoring confirms no new duplicate charges. Incident resolved.
- **12:30** - Full list of affected customers compiled. Automated refund batch initiated.

## Root Cause

The retry logic for payment requests was refactored in PAY-104 to improve timeout handling on the mobile client. During this refactoring, the code path that generated and attached the \`Idempotency-Key\` header to Stripe payment intent creation requests was inadvertently removed. Without this key, Stripe treated each retry as a distinct payment request and processed the charge again. The original implementation generated the idempotency key in a middleware layer that was bypassed by the new retry module. The bug was not caught in code review because the existing unit tests mocked the HTTP layer and did not assert on header presence. The related ticket PAY-106 was opened after initial customer reports but was not yet triaged when the incident was escalated.

## Resolution

Immediate resolution was achieved by enabling a server-side feature flag that disabled client-initiated retries and routed all retry logic through the backend payment service, which correctly included idempotency keys. A subsequent hotfix to the mobile client restored idempotency key generation in the retry code path. All 200 affected customers were identified via a query matching duplicate \`payment_intent\` fingerprints within a 60-second window, and automated refunds were processed within 24 hours.

## Action Items

1. **Add idempotency key assertion to payment integration tests** - Every test that exercises the payment creation path must assert the presence of \`Idempotency-Key\` in outbound request headers. Owner: Sarah Kim. Due: 2024-10-21. See PAY-106.
2. **Implement server-side idempotency enforcement** - The backend should generate and track idempotency keys server-side, not relying on the client. Duplicate payment intents with the same order ID within a configurable window should be rejected. Owner: James Liu. Due: 2024-11-01.
3. **Add duplicate charge detection alert** - Create a real-time monitoring rule that fires when more than 3 duplicate charges (same customer, same amount, within 5 minutes) are detected. Owner: Marcus Chen. Due: 2024-10-25.
4. **Mandate integration test coverage for payment retry paths** - Update the code review checklist to require end-to-end tests covering retry scenarios for any PR touching payment logic (PAY-104 scope). Owner: Emily Carter. Due: 2024-10-28.

## Lessons Learned

- Idempotency is a critical safety mechanism for payment systems and must be treated as a first-class concern, not an implementation detail hidden in middleware. The key should be generated and validated at multiple layers.
- Mocking HTTP layers in tests can hide header-level regressions. Payment tests should include integration-level assertions that verify actual request structure against the payment gateway.
- The 45-minute detection time was too long for a customer-facing billing issue. Automated anomaly detection on charge patterns would have caught this within minutes.
- Feature flags saved us during resolution. The ability to shift retry behavior server-side without a client deploy was crucial for rapid mitigation.`,
  },
  {
    id: "POSTMORTEM-003",
    title: "PCI Compliance Data Exposure Risk",
    incidentDate: "2024-09-22",
    severity: "SEV-2",
    duration: "0m (no downtime)",
    author: "Emily Carter",
    content: `# Postmortem: PCI Compliance Data Exposure Risk

## Summary

On September 22, 2024, a routine PCI DSS security scan performed by our QSA (Qualified Security Assessor) detected unencrypted cardholder data present in application logs. Specifically, full card numbers (PANs) were being written to the payment service logs in debug-level entries during transaction error handling. While there was no system downtime and no evidence of unauthorized access or data breach, this finding constituted a direct violation of PCI DSS Requirement 3.4, which mandates that PANs be rendered unreadable anywhere they are stored. The finding was classified as SEV-2 due to the compliance and regulatory risk, despite having zero operational impact.

## Impact

- **System downtime:** None
- **Data breach confirmed:** No - log access is restricted to authorized engineers via IAM roles
- **PCI DSS requirement violated:** Requirement 3.4 (render PAN unreadable wherever stored)
- **Logs containing PANs:** 34 log files spanning August 3 - September 22, 2024 (~50 days)
- **Estimated PAN entries:** ~2,300 unique card numbers in log output
- **Compliance risk:** Potential failure of upcoming PCI DSS Level 1 audit (scheduled November 2024)
- **Regulatory exposure:** Non-compliance could result in fines of $5,000-$100,000/month per CONTRACT-004 (DPA) and acquiring bank agreements

## Timeline (all times UTC)

- **10:00** - QSA initiates quarterly automated scan of production environment as part of PCI DSS audit preparation.
- **10:45** - Scan flags pattern matches for 16-digit sequences consistent with card numbers in application log files stored in CloudWatch.
- **11:00** - QSA notifies Emily Carter (Security Lead) of finding with HIGH severity classification.
- **11:15** - Emily confirms finding by reviewing sample log entries. Debug-level log statements in the payment error handler include the full PaymentRequest object, which contains the unmasked PAN.
- **11:30** - Immediate remediation begins. Log level for payment service elevated from DEBUG to INFO in production, suppressing the offending log statements.
- **11:45** - All 34 affected log files identified and queued for secure deletion from CloudWatch.
- **12:00** - Secure deletion of affected log files completed with verification.
- **13:00** - Code fix submitted: PAN fields added to the global log sanitization filter with masking (first 6, last 4 digits only).
- **14:00** - Fix deployed to production. Verified that no PAN data appears in subsequent log output.
- **14:30** - Incident report drafted for QSA and compliance team.

## Root Cause

The payment service error handler included a catch block that logged the full PaymentRequest object at DEBUG level when a transaction failed. This object contained the raw PAN as submitted by the client before tokenization. The log sanitization middleware maintained a deny-list of sensitive field names (e.g., \`cvv\`, \`password\`, \`secret\`), but the PAN was stored in a field named \`cardNumber\` which was not included in the deny-list. This logging pattern was introduced three months prior during debugging of intermittent transaction failures and was never removed. The PCI compliance checklist (wiki-002) includes a step to verify that no cardholder data is logged, but this check was performed only during initial service deployment, not on subsequent code changes. The related compliance tracking ticket PAY-107 had flagged the need for automated PAN detection in logs but was deprioritized in sprint planning.

## Resolution

Immediate resolution involved elevating the production log level to INFO to suppress debug output, followed by secure deletion of all 34 affected log files from CloudWatch with cryptographic verification. A permanent code fix added \`cardNumber\`, \`pan\`, \`card_number\`, and \`account_number\` to the global log sanitization deny-list. The sanitizer now applies regex-based masking for any 13-19 digit numeric sequences matching Luhn validation, regardless of field name, as a defense-in-depth measure.

## Action Items

1. **Implement automated PAN detection in CI/CD pipeline** - Add a pre-deployment scan that searches for potential PAN patterns in log output during integration tests. Any Luhn-valid 13-19 digit sequence in test log output should fail the build. Owner: Marcus Chen. Due: 2024-10-07. See PAY-107.
2. **Mandate PCI compliance review for all payment service PRs** - Update the code review process to require explicit PCI compliance sign-off for any change to the payment service, referencing the PCI checklist (wiki-002). Owner: Emily Carter. Due: 2024-10-01. See CONTRACT-004 (DPA).
3. **Deploy real-time log monitoring for cardholder data** - Implement a CloudWatch metric filter that detects Luhn-valid numeric sequences in log streams and triggers an immediate alert. Owner: Sarah Kim. Due: 2024-10-14.

## Lessons Learned

- Debug logging in payment services must be treated as a security-critical operation. Logging full request objects is never acceptable in payment code paths, regardless of log level, because log levels can be changed and debug output may be enabled during production incidents.
- Deny-list approaches to log sanitization are inherently fragile. The regex-based Luhn detection we implemented as a fallback is a better defense-in-depth pattern since it catches PANs regardless of field naming conventions.
- PCI compliance checks (wiki-002) must be integrated into the continuous development process, not treated as a point-in-time gate. The checklist should be referenced in PR templates for payment-related services.
- We were fortunate that log access was tightly controlled via IAM, which limited the blast radius. However, compliance violations carry risk independent of actual data exposure, and the regulatory and financial consequences could have been severe.`,
  },
];
