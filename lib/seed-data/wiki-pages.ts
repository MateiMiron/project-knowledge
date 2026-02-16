export interface WikiPage {
  id: string;
  title: string;
  content: string;
  category: string;
  lastUpdated: string;
  author: string;
}

export const wikiPages: WikiPage[] = [
  {
    id: "wiki-001",
    title: "Payment Gateway Integration Guide",
    category: "Engineering",
    lastUpdated: "2025-12-10",
    author: "Sarah Chen",
    content: `# Payment Gateway Integration Guide

## Overview

This guide covers the end-to-end integration of Stripe as our primary payment gateway. For context on why Stripe was chosen over alternatives, see **ADR: Why We Chose Stripe** (wiki-006). The initial integration work was tracked under **PAY-101** (Stripe gateway integration epic).

## Prerequisites

- Access to the \`payments-service\` repository (see **Onboarding Guide for New Engineers**, wiki-004)
- Stripe dashboard access (request via #infra-access on Slack)
- Familiarity with our **Payment Service API Documentation** (wiki-005)

## Stripe Account Configuration

### API Keys

We maintain separate API keys per environment:

| Environment | Key Prefix    | Vault Path                        |
|-------------|---------------|-----------------------------------|
| Development | \`sk_test_\`  | \`secret/dev/stripe/secret_key\`  |
| Staging     | \`sk_test_\`  | \`secret/stg/stripe/secret_key\`  |
| Production  | \`sk_live_\`  | \`secret/prod/stripe/secret_key\` |

> **Never** hardcode API keys. All keys are stored in HashiCorp Vault and injected at runtime. Per our **Stripe Processing Agreement**, any key exposure must be rotated within 1 hour and reported to the security team. See **PAY-234** for the key rotation runbook.

### Dashboard Setup

1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Ensure the restricted key has only the following permissions:
   - \`Charges\`: Write
   - \`Refunds\`: Write
   - \`Customers\`: Write
   - \`PaymentIntents\`: Write
   - \`Events\`: Read

## Webhook Configuration

Webhooks are critical for asynchronous payment state updates. Related ticket: **PAY-112** (webhook reliability improvements).

### Registered Events

\`\`\`
payment_intent.succeeded
payment_intent.payment_failed
charge.refunded
charge.dispute.created
charge.dispute.closed
customer.subscription.deleted
\`\`\`

### Endpoint Registration

Our webhook receiver lives at:

\`\`\`
Production:  https://api.acmepay.com/webhooks/stripe
Staging:     https://api-staging.acmepay.com/webhooks/stripe
\`\`\`

### Signature Verification

Every incoming webhook **must** be verified using the signing secret:

\`\`\`typescript
import Stripe from 'stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function handleWebhook(req: Request): Promise<Response> {
  const sig = req.headers.get('stripe-signature');
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
      break;
    case 'charge.refunded':
      await handleRefund(event.data.object as Stripe.Charge);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }

  return new Response('OK', { status: 200 });
}
\`\`\`

### Retry Policy

Stripe retries failed webhook deliveries up to 3 times with exponential backoff. Our endpoint must respond with a 2xx status within **20 seconds**. If processing takes longer, acknowledge the webhook immediately and process asynchronously via our internal message queue (SQS). This pattern was established during the incident tracked in **PAY-189** (webhook timeout causing duplicate charges).

## Idempotency

All payment operations must include an idempotency key:

\`\`\`typescript
const paymentIntent = await stripe.paymentIntents.create(
  {
    amount: 2000,
    currency: 'usd',
    payment_method: paymentMethodId,
    confirm: true,
  },
  {
    idempotencyKey: \`order_\${orderId}_attempt_\${attemptNumber}\`,
  }
);
\`\`\`

## Monitoring & Alerts

- Stripe API error rates are tracked in Datadog: \`stripe.api.error_rate\`
- Webhook processing lag is monitored via: \`stripe.webhook.processing_time_ms\`
- PagerDuty alert fires if webhook failure rate exceeds 5% over 10 minutes

Per our **Stripe Processing Agreement**, uptime SLA is 99.95%. We track Stripe's status at https://status.stripe.com and have an automated Slack alert in **#payments-alerts**.

## Related Resources

- **PAY-101**: Initial Stripe integration epic
- **PAY-112**: Webhook reliability improvements
- **PAY-189**: Webhook timeout incident
- **PAY-234**: Key rotation runbook
- Slack: **#product-payments**, **#payments-alerts**
- See **Testing Strategy for Payment Flows** (wiki-007) for how to test integrations locally`,
  },
  {
    id: "wiki-002",
    title: "PCI Compliance Checklist",
    category: "Security & Compliance",
    lastUpdated: "2025-11-28",
    author: "Marcus Rivera",
    content: `# PCI Compliance Checklist

## Overview

As a Level 2 merchant processing between 1-6 million transactions annually, we must maintain PCI DSS 4.0 compliance. Our last successful audit was completed on **2025-09-15** (see **PAY-105** for the compliance update tracking ticket). The next annual Self-Assessment Questionnaire (SAQ-D) is due by **2026-09-15**.

Per our **Stripe Processing Agreement**, we are required to maintain PCI DSS compliance at all times. Failure to do so may result in increased processing fees or contract termination with 30 days notice.

## PCI DSS 4.0 Key Requirements

### Requirement 1: Network Security Controls

- [x] Firewall rules reviewed quarterly (last review: 2025-10-01)
- [x] Network segmentation between cardholder data environment (CDE) and corporate network
- [x] Inbound/outbound traffic restricted to necessary protocols only
- [x] DMZ implemented for public-facing systems
- [ ] **Action needed**: Document all network flows for Q1 2026 review (**PAY-301**)

### Requirement 2: Secure Configurations

- [x] Default passwords changed on all systems
- [x] Unnecessary services disabled on payment processing servers
- [x] TLS 1.2+ enforced on all connections (TLS 1.3 preferred)
- [x] System hardening standards applied per CIS benchmarks

### Requirement 3: Protect Stored Account Data

- [x] No raw PAN stored in our systems (delegated to Stripe via tokenization)
- [x] Stripe tokens (\`tok_*\`) stored instead of card numbers
- [x] Encryption at rest (AES-256) for all payment metadata
- [x] Data retention policy: payment records purged after 7 years

> **Important**: We never store CVV, full track data, or PIN data. All card data handling is delegated to Stripe's PCI Level 1 certified infrastructure. This was a key factor in our gateway selection (see **ADR: Why We Chose Stripe**, wiki-006).

### Requirement 4: Encrypt Transmission of Cardholder Data

- [x] All API calls to Stripe use TLS 1.3
- [x] Internal service-to-service communication uses mTLS
- [x] Certificate management automated via cert-manager
- [x] HSTS enabled on all public endpoints

### Requirement 5: Malware Protection

- [x] Endpoint protection on all developer machines
- [x] Container image scanning via Trivy in CI pipeline
- [x] Runtime security monitoring via Falco on payment service pods

### Requirement 6: Secure Development

- [x] SAST scanning on every PR (Semgrep)
- [x] Dependency vulnerability scanning (Snyk, runs daily)
- [x] Security review required for all payment-related PRs
- [x] Quarterly developer security training completed

Discussed in **#product-payments** on Oct 5: all payment-related PRs now require explicit security review sign-off. See **PAY-278** for the process update.

### Requirement 7: Restrict Access

- [x] Role-based access control (RBAC) on all payment systems
- [x] Production database access limited to SRE on-call and payment service accounts
- [x] Access reviews conducted quarterly

### Requirement 8: Identify Users and Authenticate Access

- [x] MFA enforced for all Stripe dashboard access
- [x] MFA enforced for production infrastructure access
- [x] Service accounts use short-lived tokens (1 hour TTL)
- [x] Password policy: minimum 12 characters, complexity requirements

### Requirements 9-12: Physical, Monitoring, Testing, Policy

- [x] All infrastructure is cloud-hosted (AWS us-east-1); physical security managed by AWS
- [x] Centralized logging to Datadog with 12-month retention
- [x] Quarterly vulnerability scans (last scan: 2025-11-15, **PAY-310**)
- [x] Annual penetration test (last test: 2025-08-20, report in Confluence)
- [x] Information security policy reviewed annually

## Testing Procedures

### Quarterly Tasks

| Task                          | Owner           | Last Completed | Next Due   |
|-------------------------------|-----------------|----------------|------------|
| Vulnerability scan (external) | Security Team   | 2025-11-15     | 2026-02-15 |
| Vulnerability scan (internal) | Security Team   | 2025-11-15     | 2026-02-15 |
| Firewall rule review          | Infra Team      | 2025-10-01     | 2026-01-01 |
| Access control review         | Engineering Mgr | 2025-10-15     | 2026-01-15 |

### Annual Tasks

| Task                    | Owner          | Last Completed | Next Due   |
|-------------------------|----------------|----------------|------------|
| Penetration test        | Security Team  | 2025-08-20     | 2026-08-20 |
| SAQ-D submission        | Marcus Rivera  | 2025-09-15     | 2026-09-15 |
| Security policy review  | CISO           | 2025-07-01     | 2026-07-01 |
| Security training       | All Engineers  | 2025-10-01     | 2026-10-01 |

## Incident Reporting

Any suspected cardholder data breach must be reported within **1 hour** to:

1. Security team via **#security-incidents** Slack channel
2. VP of Engineering
3. Our Qualified Security Assessor (QSA)
4. Stripe support (per contractual obligation in our **Stripe Processing Agreement**)

Follow the **Incident Response Playbook** (wiki-003) for full procedures.

## Related Resources

- **PAY-105**: PCI compliance update epic
- **PAY-278**: Security review process update
- **PAY-301**: Q1 2026 network flow documentation
- **PAY-310**: Q4 2025 vulnerability scan results
- Slack: **#product-payments**, **#security-incidents**`,
  },
  {
    id: "wiki-003",
    title: "Incident Response Playbook",
    category: "Operations",
    lastUpdated: "2026-01-15",
    author: "Priya Sharma",
    content: `# Incident Response Playbook

## Overview

This playbook defines how the Payments team responds to production incidents. All on-call engineers should review this document during their first on-call rotation. Discussed and finalized in **#product-payments** on Jan 10 after the retro on the Q4 2025 charge duplication incident (**PAY-289**).

## Severity Levels

| Severity | Definition | Response Time | Examples |
|----------|-----------|---------------|----------|
| **SEV-1** | Complete payment processing outage or data breach | 15 minutes | Stripe API fully down, cardholder data exposed, all transactions failing |
| **SEV-2** | Partial degradation affecting >10% of transactions | 30 minutes | Elevated error rates, one payment method failing, webhook processing backlog >5 min |
| **SEV-3** | Minor issue with limited customer impact | 2 hours | Single customer payment failure pattern, non-critical monitoring gap |
| **SEV-4** | No immediate customer impact | Next business day | Dashboard cosmetic issue, non-critical log noise |

## On-Call Rotation

- Primary on-call: Rotates weekly (see PagerDuty schedule "Payments Primary")
- Secondary on-call: Backup engineer (PagerDuty "Payments Secondary")
- Escalation manager: Engineering Manager on rotation

### On-Call Responsibilities

1. Acknowledge PagerDuty alerts within **5 minutes**
2. Join the incident Slack channel (auto-created: \`#inc-YYYYMMDD-brief-title\`)
3. Assess severity and begin triage
4. Update the incident channel with status every **15 minutes** for SEV-1/SEV-2

## Escalation Path

\`\`\`
Primary On-Call Engineer
    |
    v (if no ack in 5 min OR SEV-1)
Secondary On-Call Engineer
    |
    v (if no ack in 10 min OR data breach suspected)
Engineering Manager (Payments)
    |
    v (if customer-facing impact > 30 min OR financial impact > $10,000)
VP of Engineering + Head of Product
    |
    v (if data breach confirmed)
CISO + Legal + Executive Team
\`\`\`

For suspected cardholder data breaches, immediately follow the PCI breach protocol in the **PCI Compliance Checklist** (wiki-002).

## Triage Checklist

When paged, follow this checklist:

### Step 1: Identify the Problem

\`\`\`bash
# Check payment service health
curl -s https://api.acmepay.com/health | jq .

# Check recent error rates in Datadog
# Dashboard: "Payments Service Overview"
# URL: https://app.datadoghq.com/dashboard/payments-overview

# Check Stripe status
curl -s https://status.stripe.com/api/v2/status.json | jq .status
\`\`\`

### Step 2: Assess Blast Radius

- How many customers are affected?
- Which payment methods are impacted?
- Is the issue isolated to a specific region or merchant?
- Check \`payments-service\` logs: \`kubectl logs -l app=payments-service --tail=100 -n payments\`

### Step 3: Mitigate

| Scenario | Mitigation |
|----------|-----------|
| High Stripe error rate | Enable circuit breaker: toggle \`STRIPE_CIRCUIT_BREAKER\` feature flag to \`open\` in LaunchDarkly |
| Webhook processing backlog | Scale webhook consumer: \`kubectl scale deployment webhook-consumer --replicas=10 -n payments\` |
| Bad deployment | Roll back: \`kubectl rollout undo deployment/payments-service -n payments\` (see **Release Process**, wiki-008) |
| Database connection exhaustion | Restart connection pool: \`kubectl delete pod -l app=payments-service -n payments --grace-period=30\` |
| Duplicate charges detected | Enable idempotency enforcement: toggle \`STRICT_IDEMPOTENCY\` flag in LaunchDarkly (related: **PAY-289**) |

### Step 4: Communicate

- Update \`#inc-*\` channel every 15 minutes
- For SEV-1/SEV-2: post customer-facing status at https://status.acmepay.com via Statuspage
- Notify support team in **#customer-support** for any user-visible impact

## Postmortem Template

All SEV-1 and SEV-2 incidents require a postmortem within **3 business days**. Use the following template:

\`\`\`markdown
# Postmortem: [Incident Title]

**Date**: YYYY-MM-DD
**Duration**: X hours Y minutes
**Severity**: SEV-N
**Author**: [Name]
**Incident Lead**: [Name]

## Summary
[2-3 sentence summary of what happened]

## Impact
- Transactions affected: N
- Revenue impact: $X
- Customers affected: N
- Duration of customer-facing impact: X minutes

## Timeline (all times UTC)
- HH:MM - [Event]
- HH:MM - [Event]

## Root Cause
[Detailed technical explanation]

## Resolution
[What was done to fix the issue]

## Action Items
| Action | Owner | Jira Ticket | Due Date |
|--------|-------|-------------|----------|

## Lessons Learned
### What went well
### What could be improved

## Related
- Jira epic: PAY-XXX
- Slack channel: #inc-YYYYMMDD-title
- Datadog dashboard: [link]
\`\`\`

## Recent Incident History

| Date | Severity | Title | Postmortem |
|------|----------|-------|------------|
| 2025-12-18 | SEV-2 | Duplicate charges on retry | **PAY-289** |
| 2025-11-03 | SEV-3 | Webhook delivery delays | **PAY-267** |
| 2025-09-22 | SEV-1 | Payment service OOM crash | **PAY-245** |
| 2025-08-14 | SEV-2 | Stripe API latency spike | **PAY-230** |

## Related Resources

- **PAY-289**: Duplicate charge incident postmortem
- **PAY-245**: OOM crash postmortem
- PagerDuty: Payments Primary / Payments Secondary schedules
- Datadog: Payments Service Overview dashboard
- Slack: **#payments-alerts**, **#product-payments**
- **PCI Compliance Checklist** (wiki-002) for data breach procedures`,
  },
  {
    id: "wiki-004",
    title: "Onboarding Guide for New Engineers",
    category: "Engineering",
    lastUpdated: "2026-01-08",
    author: "James Park",
    content: `# Onboarding Guide for New Engineers

## Welcome to the Payments Team!

Welcome to the Acme Payments team. This guide will get you up and running with our codebase, tools, and processes. If anything is unclear, reach out in **#product-payments** on Slack -- we're happy to help.

## First Day Setup

### 1. Access Requests

Submit access requests on day one (approvals typically take 1-2 hours):

| System | How to Request | Approver |
|--------|---------------|----------|
| GitHub (\`acme/payments-service\`) | IT Helpdesk ticket | Engineering Manager |
| Stripe Dashboard (test mode only) | **#infra-access** Slack | Security Team |
| AWS Console (read-only) | IT Helpdesk ticket | Engineering Manager |
| Datadog | Auto-provisioned via SSO | -- |
| PagerDuty | Engineering Manager adds you | Engineering Manager |
| LaunchDarkly | **#infra-access** Slack | Engineering Manager |
| HashiCorp Vault (dev) | IT Helpdesk ticket | Security Team |
| Jira (PAY project) | Auto-provisioned via SSO | -- |

### 2. Repository Setup

Clone the main repositories:

\`\`\`bash
# Main payment service (Go + TypeScript)
git clone git@github.com:acme/payments-service.git

# Shared payment types / SDK
git clone git@github.com:acme/payments-sdk.git

# Infrastructure-as-code (Terraform)
git clone git@github.com:acme/payments-infra.git

# End-to-end test suite
git clone git@github.com:acme/payments-e2e-tests.git
\`\`\`

### 3. Local Development Environment

\`\`\`bash
# Prerequisites
brew install node@20 go@1.22 docker docker-compose postgresql@16 redis

# Install project dependencies
cd payments-service
npm install

# Copy environment template
cp .env.example .env.local

# Start local infrastructure (Postgres, Redis, LocalStack)
docker-compose up -d

# Run database migrations
npm run db:migrate

# Seed test data
npm run db:seed

# Start the development server
npm run dev
# Service will be available at http://localhost:3001
\`\`\`

> **Note**: You will need Stripe test API keys in your \`.env.local\`. Get the shared development key from Vault at \`secret/dev/stripe/secret_key\` or ask a teammate. See **Payment Gateway Integration Guide** (wiki-001) for details on key management.

### 4. Verify Your Setup

Run the test suite to verify everything is configured correctly:

\`\`\`bash
# Unit tests
npm run test:unit

# Integration tests (requires Docker services running)
npm run test:integration

# If all tests pass, you're good!
\`\`\`

See **Testing Strategy for Payment Flows** (wiki-007) for our full testing approach.

## Key Systems & Architecture

### Service Map

\`\`\`
[Web App] --> [API Gateway] --> [Payment Service] --> [Stripe API]
                                      |
                                      +--> [PostgreSQL] (transactions, orders)
                                      |
                                      +--> [Redis] (idempotency keys, rate limiting)
                                      |
                                      +--> [SQS] (async webhook processing)
\`\`\`

### Key Directories in \`payments-service\`

\`\`\`
src/
  api/          # HTTP handlers and route definitions
  services/     # Business logic layer
  repositories/ # Database access layer
  stripe/       # Stripe client wrapper and webhook handlers
  queue/        # SQS consumer for async processing
  middleware/   # Auth, rate limiting, logging
  types/        # Shared TypeScript types
migrations/     # Database migration files
tests/
  unit/         # Unit tests
  integration/  # Integration tests with test containers
\`\`\`

### Important Config Files

- \`.env.example\` -- all environment variables with descriptions
- \`docker-compose.yml\` -- local infrastructure services
- \`terraform/\` -- production infrastructure (in \`payments-infra\` repo)
- \`k8s/\` -- Kubernetes manifests for staging/production

## First Week Tasks

### Days 1-2: Setup & Orientation
- [x] Complete access requests
- [x] Set up local development environment
- [ ] Read this onboarding guide (you're doing it!)
- [ ] Read **Payment Gateway Integration Guide** (wiki-001)
- [ ] Read **PCI Compliance Checklist** (wiki-002) -- required for all engineers handling payment data
- [ ] Read **ADR: Why We Chose Stripe** (wiki-006) for historical context

### Days 3-4: Starter Ticket
- [ ] Pick up your starter ticket from the "Onboarding" column in Jira (typically a small bug fix or test improvement, e.g., **PAY-315**: Add unit tests for refund validation)
- [ ] Set up a pairing session with your onboarding buddy
- [ ] Submit your first PR and get it reviewed

### Day 5: Shadow On-Call
- [ ] Shadow the current on-call engineer for a few hours
- [ ] Read the **Incident Response Playbook** (wiki-003)
- [ ] Review the **Release Process** (wiki-008)
- [ ] Attend the weekly Payments team standup (Thursdays 10:00 AM ET)

## Team Rituals

| Ritual | Cadence | Time | Location |
|--------|---------|------|----------|
| Standup | Daily (async Mon-Wed, sync Thu) | 10:00 AM ET Thu | Zoom / **#payments-standup** |
| Sprint Planning | Biweekly | 2:00 PM ET Monday | Zoom |
| Retro | Biweekly | 3:00 PM ET Friday | Zoom |
| Architecture Review | Monthly | 1:00 PM ET first Wed | Zoom |
| On-call Handoff | Weekly | 10:30 AM ET Monday | **#payments-oncall** |

## Helpful Slack Channels

- **#product-payments** -- Main team channel for discussions and decisions
- **#payments-alerts** -- Automated alerts from Datadog and PagerDuty
- **#payments-oncall** -- On-call handoff and incident coordination
- **#payments-standup** -- Async daily standups
- **#infra-access** -- Request access to tools and systems

## Related Resources

- **PAY-315**: Typical onboarding starter ticket
- **Stripe Processing Agreement**: Available in the team Google Drive under "Contracts"
- Confluence: Payments Team Space for additional documentation
- Slack: **#product-payments** for any questions`,
  },
  {
    id: "wiki-005",
    title: "Payment Service API Documentation",
    category: "Engineering",
    lastUpdated: "2026-01-20",
    author: "Sarah Chen",
    content: `# Payment Service API Documentation

## Overview

The Payment Service exposes a RESTful API for processing payments, refunds, and payment status queries. All endpoints require authentication via a Bearer token issued by our internal auth service. The API design was discussed extensively in **#product-payments** on Nov 15 during the v2 API redesign (tracked under **PAY-250**).

## Base URL

| Environment | Base URL |
|-------------|----------|
| Development | \`http://localhost:3001/api\` |
| Staging | \`https://api-staging.acmepay.com/api\` |
| Production | \`https://api.acmepay.com/api\` |

## Authentication

All requests must include a valid JWT in the \`Authorization\` header:

\`\`\`
Authorization: Bearer <jwt_token>
\`\`\`

Tokens are issued by the auth service and include the \`merchant_id\` claim. Requests are automatically scoped to the authenticated merchant.

## Endpoints

### POST /api/payments/charge

Creates a new payment charge.

**Request:**

\`\`\`json
{
  "amount": 4999,
  "currency": "usd",
  "payment_method_id": "pm_1234567890",
  "customer_id": "cus_abc123",
  "order_id": "order_789",
  "description": "Order #789 - Premium Widget",
  "metadata": {
    "sku": "WIDGET-PRO-001",
    "quantity": 1
  },
  "idempotency_key": "order_789_charge_attempt_1"
}
\`\`\`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`amount\` | integer | Yes | Amount in cents (e.g., 4999 = $49.99) |
| \`currency\` | string | Yes | ISO 4217 currency code (supported: usd, eur, gbp, cad) |
| \`payment_method_id\` | string | Yes | Stripe payment method token |
| \`customer_id\` | string | Yes | Internal customer identifier |
| \`order_id\` | string | Yes | Associated order identifier |
| \`description\` | string | No | Human-readable charge description |
| \`metadata\` | object | No | Arbitrary key-value pairs (max 20 keys) |
| \`idempotency_key\` | string | Yes | Unique key for idempotent requests |

**Response (201 Created):**

\`\`\`json
{
  "id": "pay_abc123def456",
  "status": "succeeded",
  "amount": 4999,
  "currency": "usd",
  "customer_id": "cus_abc123",
  "order_id": "order_789",
  "stripe_payment_intent_id": "pi_3abc123",
  "created_at": "2026-01-15T10:30:00Z",
  "metadata": {
    "sku": "WIDGET-PRO-001",
    "quantity": 1
  }
}
\`\`\`

### POST /api/payments/refund

Issues a full or partial refund for an existing charge.

**Request:**

\`\`\`json
{
  "payment_id": "pay_abc123def456",
  "amount": 2000,
  "reason": "customer_request",
  "idempotency_key": "refund_pay_abc123_1"
}
\`\`\`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`payment_id\` | string | Yes | The payment to refund |
| \`amount\` | integer | No | Partial refund amount in cents (omit for full refund) |
| \`reason\` | string | Yes | One of: \`customer_request\`, \`duplicate\`, \`fraudulent\`, \`order_change\` |
| \`idempotency_key\` | string | Yes | Unique key for idempotent requests |

**Response (201 Created):**

\`\`\`json
{
  "id": "ref_xyz789",
  "payment_id": "pay_abc123def456",
  "amount": 2000,
  "status": "succeeded",
  "reason": "customer_request",
  "stripe_refund_id": "re_1abc123",
  "created_at": "2026-01-15T14:00:00Z"
}
\`\`\`

> **Note**: Refunds can take 5-10 business days to appear on customer statements. Per our **Stripe Processing Agreement**, refund processing fees are non-refundable. See **PAY-198** for the refund fee reconciliation implementation.

### GET /api/payments/:id

Retrieves details of a specific payment.

**Response (200 OK):**

\`\`\`json
{
  "id": "pay_abc123def456",
  "status": "succeeded",
  "amount": 4999,
  "currency": "usd",
  "customer_id": "cus_abc123",
  "order_id": "order_789",
  "stripe_payment_intent_id": "pi_3abc123",
  "refunds": [],
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-15T10:30:05Z"
}
\`\`\`

### GET /api/payments/order/:orderId

Retrieves all payments associated with an order.

**Response (200 OK):**

\`\`\`json
{
  "order_id": "order_789",
  "payments": [
    {
      "id": "pay_abc123def456",
      "status": "succeeded",
      "amount": 4999,
      "currency": "usd",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "total_charged": 4999,
  "total_refunded": 0
}
\`\`\`

### POST /api/payments/capture

Captures a previously authorized payment (for auth-and-capture flow).

**Request:**

\`\`\`json
{
  "payment_id": "pay_abc123def456",
  "amount": 4999,
  "idempotency_key": "capture_pay_abc123_1"
}
\`\`\`

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|-----------|-------------|
| 400 | \`INVALID_REQUEST\` | Missing or invalid request parameters |
| 400 | \`INVALID_AMOUNT\` | Amount is zero, negative, or exceeds maximum ($999,999.99) |
| 400 | \`INVALID_CURRENCY\` | Unsupported currency code |
| 401 | \`UNAUTHORIZED\` | Missing or invalid auth token |
| 402 | \`PAYMENT_FAILED\` | Card declined or payment method failed |
| 404 | \`PAYMENT_NOT_FOUND\` | No payment found with the given ID |
| 409 | \`DUPLICATE_REQUEST\` | Idempotency key already used with different parameters |
| 422 | \`REFUND_EXCEEDS_CHARGE\` | Refund amount exceeds remaining chargeable amount |
| 429 | \`RATE_LIMITED\` | Too many requests (limit: 100 req/min per merchant) |
| 500 | \`INTERNAL_ERROR\` | Unexpected server error |
| 502 | \`GATEWAY_ERROR\` | Stripe API returned an error |
| 503 | \`SERVICE_UNAVAILABLE\` | Payment service is temporarily unavailable |

**Error Response Format:**

\`\`\`json
{
  "error": {
    "code": "PAYMENT_FAILED",
    "message": "The card was declined. Please try a different payment method.",
    "details": {
      "stripe_decline_code": "insufficient_funds"
    },
    "request_id": "req_abc123"
  }
}
\`\`\`

## Rate Limiting

- **100 requests per minute** per merchant (enforced via Redis sliding window)
- Rate limit headers included in all responses:
  - \`X-RateLimit-Limit: 100\`
  - \`X-RateLimit-Remaining: 95\`
  - \`X-RateLimit-Reset: 1705312800\`

Rate limit design discussed in **#product-payments** on Dec 2 and implemented in **PAY-270**.

## Related Resources

- **PAY-250**: v2 API redesign epic
- **PAY-198**: Refund fee reconciliation
- **PAY-270**: Rate limiting implementation
- **Payment Gateway Integration Guide** (wiki-001) for Stripe-specific configuration
- **Testing Strategy for Payment Flows** (wiki-007) for API testing patterns`,
  },
  {
    id: "wiki-006",
    title: "ADR: Why We Chose Stripe",
    category: "Architecture Decisions",
    lastUpdated: "2025-06-15",
    author: "David Kim",
    content: `# ADR-007: Why We Chose Stripe as Our Payment Gateway

## Status

**Accepted** (2025-06-15)

## Context

In Q1 2025, we needed to select a payment gateway for the Acme e-commerce platform. The existing integration with a legacy in-house processor was reaching end-of-life, and we needed a modern, reliable, and developer-friendly solution. This decision was tracked as **PAY-101** (Stripe gateway integration epic) and discussed extensively in **#product-payments** from March through May 2025.

### Requirements

Our evaluation criteria, prioritized by the product and engineering teams:

1. **Reliability**: >= 99.95% uptime SLA
2. **Developer Experience**: Clean APIs, good documentation, strong SDKs
3. **PCI Scope Reduction**: Minimize our PCI DSS compliance burden (see **PCI Compliance Checklist**, wiki-002)
4. **Multi-Currency Support**: Must support USD, EUR, GBP, CAD at minimum
5. **Fraud Detection**: Built-in or integrated fraud prevention
6. **Cost**: Competitive per-transaction fees for our volume (~2M transactions/year)
7. **Extensibility**: Support for subscriptions, marketplace payments, and invoicing

## Alternatives Considered

### Option 1: Stripe

- **Pricing**: 2.9% + $0.30 per transaction (volume discount negotiated to 2.7% + $0.25)
- **Uptime SLA**: 99.95% (contractual, with service credits)
- **PCI Scope**: SAQ-A eligible with Stripe Elements / Payment Intents
- **Developer Experience**: Excellent -- comprehensive docs, TypeScript SDK, test mode, webhook testing CLI
- **Fraud**: Stripe Radar included (ML-based, customizable rules)
- **Multi-Currency**: 135+ currencies supported

### Option 2: PayPal (Braintree)

- **Pricing**: 2.59% + $0.49 per transaction
- **Uptime SLA**: 99.9% (lower than Stripe)
- **PCI Scope**: SAQ-A eligible with hosted fields
- **Developer Experience**: Adequate but dated -- documentation inconsistencies, slower SDK updates
- **Fraud**: Basic fraud tools; advanced features require additional cost
- **Multi-Currency**: 100+ currencies supported

### Option 3: Adyen

- **Pricing**: Interchange++ model (estimated 2.5% + $0.12 average)
- **Uptime SLA**: 99.95%
- **PCI Scope**: Requires more integration effort for SAQ-A eligibility
- **Developer Experience**: Good but steeper learning curve; enterprise-focused onboarding process
- **Fraud**: RevenueProtect included (strong capabilities)
- **Multi-Currency**: 150+ currencies supported

### Option 4: Square

- **Pricing**: 2.9% + $0.30 per transaction (no volume discounts available at our scale)
- **Uptime SLA**: 99.9%
- **PCI Scope**: SAQ-A eligible with their Web Payments SDK
- **Developer Experience**: Good for simple use cases, but limited customization for complex flows
- **Fraud**: Basic risk management included
- **Multi-Currency**: Limited -- primarily USD-focused

## Evaluation Matrix

| Criterion (Weight) | Stripe | PayPal | Adyen | Square |
|--------------------|--------|--------|-------|--------|
| Reliability (25%) | 5 | 3 | 5 | 3 |
| Developer Experience (25%) | 5 | 3 | 4 | 3 |
| PCI Scope Reduction (20%) | 5 | 4 | 3 | 4 |
| Multi-Currency (10%) | 5 | 4 | 5 | 2 |
| Fraud Detection (10%) | 4 | 3 | 5 | 2 |
| Cost (10%) | 3 | 3 | 4 | 3 |
| **Weighted Total** | **4.7** | **3.3** | **4.2** | **2.9** |

*Scale: 1 (Poor) to 5 (Excellent)*

## Decision

**We chose Stripe** as our primary payment gateway.

### Key Factors

1. **Best-in-class developer experience**: Stripe's TypeScript SDK, comprehensive test mode, and Stripe CLI for local webhook testing significantly reduce integration time. Our estimated integration timeline was 4 weeks with Stripe vs. 8 weeks with Adyen.

2. **Maximum PCI scope reduction**: Using Stripe Elements (client-side) + Payment Intents (server-side) means card data never touches our servers, keeping us at SAQ-A level compliance. This was a decisive factor -- see **PCI Compliance Checklist** (wiki-002) for how this simplifies our compliance posture.

3. **Contractual SLA**: We negotiated a **99.95% uptime SLA** with service credits in our **Stripe Processing Agreement** (signed June 2025, available in team Google Drive under "Contracts").

4. **Negotiated pricing**: At our volume, we secured 2.7% + $0.25 per transaction, making the cost competitive with Adyen's interchange++ model when accounting for integration costs.

### Trade-offs Accepted

- **Higher per-transaction cost than Adyen**: We pay approximately 0.2% more per transaction than Adyen's interchange++ model. At $50M annual GMV, this is roughly $100K/year. We accepted this trade-off because the reduced integration effort (saving ~4 engineering weeks) and simpler PCI compliance offset the cost.

- **Stripe Radar vs. Adyen RevenueProtect**: Adyen's fraud detection is marginally better for high-risk transactions. We mitigate this by implementing custom fraud rules in Stripe Radar (tracked in **PAY-156**).

- **Vendor lock-in**: Stripe's proprietary token format means payment methods are not portable. We mitigate this by abstracting Stripe behind our own **Payment Service API** (wiki-005), allowing future gateway swaps without client-side changes.

## Consequences

1. All payment processing flows through Stripe Payment Intents API
2. Client applications use Stripe Elements for card collection (no raw card data in our systems)
3. Webhook-driven architecture for async payment state management (see **Payment Gateway Integration Guide**, wiki-001)
4. Quarterly review of Stripe costs and performance against alternatives (next review: Q1 2026)

## Participants

- **Decision Maker**: David Kim (Engineering Manager)
- **Contributors**: Sarah Chen (Staff Engineer), Priya Sharma (SRE Lead), Lisa Wong (Product Manager)
- **Informed**: VP of Engineering, Finance Team, Security Team

Decision finalized in **#product-payments** on June 10, 2025. Architecture review presented on June 12.

## Related Resources

- **PAY-101**: Stripe gateway integration epic
- **PAY-156**: Custom fraud rules implementation
- **Stripe Processing Agreement**: Team Google Drive > Contracts
- Slack: **#product-payments** (March-June 2025 discussion threads)`,
  },
  {
    id: "wiki-007",
    title: "Testing Strategy for Payment Flows",
    category: "Engineering",
    lastUpdated: "2025-12-20",
    author: "James Park",
    content: `# Testing Strategy for Payment Flows

## Overview

This document describes our testing approach for the payments service. Given that payment processing is business-critical and involves real money, we maintain rigorous test coverage. Our testing strategy was formalized after the duplicate charge incident (**PAY-289**) and discussed in **#product-payments** on Dec 5, 2025.

## Testing Pyramid

\`\`\`
        /\\
       /  \\        E2E Tests (5%)
      /    \\       - Full Stripe integration in staging
     /------\\
    /        \\     Integration Tests (25%)
   /          \\    - Test containers, mocked Stripe
  /------------\\
 /              \\  Unit Tests (70%)
/________________\\ - Pure business logic, no I/O
\`\`\`

## Unit Tests

Unit tests cover pure business logic with no external dependencies.

### What to Unit Test

- Amount calculations (taxes, discounts, currency conversion)
- Idempotency key generation and validation
- Request validation logic
- Error mapping (Stripe errors to our error codes)
- Refund eligibility rules
- Rate limit calculations

### Example

\`\`\`typescript
// tests/unit/services/refund-validator.test.ts
import { validateRefundRequest } from '@/services/refund-validator';

describe('RefundValidator', () => {
  it('should reject refund exceeding original charge amount', () => {
    const charge = { amount: 5000, totalRefunded: 2000 };
    const refundRequest = { amount: 4000 };

    const result = validateRefundRequest(charge, refundRequest);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('REFUND_EXCEEDS_CHARGE');
    expect(result.maxRefundable).toBe(3000);
  });

  it('should allow full refund of remaining amount', () => {
    const charge = { amount: 5000, totalRefunded: 2000 };
    const refundRequest = { amount: 3000 };

    const result = validateRefundRequest(charge, refundRequest);

    expect(result.valid).toBe(true);
  });
});
\`\`\`

### Running Unit Tests

\`\`\`bash
npm run test:unit              # Run all unit tests
npm run test:unit -- --watch   # Watch mode
npm run test:unit -- --coverage # With coverage report
\`\`\`

**Coverage requirements**: Minimum 85% line coverage for all payment service code. Enforced in CI.

## Integration Tests

Integration tests verify our service works correctly with databases and external service mocks.

### Mocking Stripe

We use a custom Stripe mock that simulates Stripe's API behavior:

\`\`\`typescript
// tests/helpers/stripe-mock.ts
import { StripeMock } from '@/tests/helpers/stripe-mock';

export function createStripeMock(): StripeMock {
  return new StripeMock({
    // Simulate various card behaviors
    cards: {
      'pm_success': { status: 'succeeded' },
      'pm_decline': { status: 'failed', decline_code: 'insufficient_funds' },
      'pm_slow': { status: 'succeeded', delay: 5000 },
      'pm_network_error': { error: 'network_error' },
    },
  });
}
\`\`\`

> **Important**: Never use real Stripe test keys in automated tests. Our mock simulates all Stripe behaviors we depend on. This decision was made after accidentally hitting Stripe rate limits during a CI spike (**PAY-203**). See **Payment Gateway Integration Guide** (wiki-001) for information about Stripe API key management.

### Test Containers

Integration tests use Testcontainers for PostgreSQL and Redis:

\`\`\`typescript
// tests/integration/setup.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';

let pgContainer: PostgreSqlContainer;
let redisContainer: RedisContainer;

beforeAll(async () => {
  pgContainer = await new PostgreSqlContainer('postgres:16')
    .withDatabase('payments_test')
    .start();

  redisContainer = await new RedisContainer('redis:7')
    .start();

  // Run migrations
  await runMigrations(pgContainer.getConnectionUri());
}, 60000);

afterAll(async () => {
  await pgContainer.stop();
  await redisContainer.stop();
});
\`\`\`

### Integration Test Example

\`\`\`typescript
// tests/integration/api/charge.test.ts
describe('POST /api/payments/charge', () => {
  it('should create a charge and persist to database', async () => {
    const response = await request(app)
      .post('/api/payments/charge')
      .set('Authorization', \`Bearer \${testToken}\`)
      .send({
        amount: 4999,
        currency: 'usd',
        payment_method_id: 'pm_success',
        customer_id: 'cus_test_123',
        order_id: 'order_test_456',
        idempotency_key: 'test_idem_001',
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('succeeded');
    expect(response.body.amount).toBe(4999);

    // Verify persistence
    const payment = await db.payments.findById(response.body.id);
    expect(payment).toBeDefined();
    expect(payment!.stripePaymentIntentId).toMatch(/^pi_/);
  });

  it('should return 409 for duplicate idempotency key with different params', async () => {
    // First request
    await request(app)
      .post('/api/payments/charge')
      .set('Authorization', \`Bearer \${testToken}\`)
      .send({
        amount: 4999,
        currency: 'usd',
        payment_method_id: 'pm_success',
        customer_id: 'cus_test_123',
        order_id: 'order_test_789',
        idempotency_key: 'test_idem_dup',
      });

    // Second request with same key but different amount
    const response = await request(app)
      .post('/api/payments/charge')
      .set('Authorization', \`Bearer \${testToken}\`)
      .send({
        amount: 9999,
        currency: 'usd',
        payment_method_id: 'pm_success',
        customer_id: 'cus_test_123',
        order_id: 'order_test_789',
        idempotency_key: 'test_idem_dup',
      });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('DUPLICATE_REQUEST');
  });
});
\`\`\`

### Running Integration Tests

\`\`\`bash
npm run test:integration       # Requires Docker running
\`\`\`

## End-to-End Tests

E2E tests run against the staging environment using Stripe's test mode.

### Scope

- Full checkout flow (cart -> payment -> confirmation)
- Refund flow (initiated from admin dashboard)
- Webhook delivery and processing
- Payment retry after decline

E2E tests live in the \`payments-e2e-tests\` repository and run nightly in CI. Results are posted to **#payments-alerts**.

### Test Data Management

| Environment | Stripe Mode | Test Cards | Database |
|-------------|------------|------------|----------|
| Local | Mock (no Stripe calls) | Mock payment methods | Testcontainers |
| CI | Mock (no Stripe calls) | Mock payment methods | Testcontainers |
| Staging E2E | Stripe Test Mode | Stripe test card numbers | Staging DB (reset nightly) |

Stripe test card numbers we use:
- \`4242424242424242\` -- Successful payment
- \`4000000000000002\` -- Card declined
- \`4000000000009995\` -- Insufficient funds
- \`4000000000000077\` -- Successful charge, then dispute

## CI Pipeline

\`\`\`yaml
# .github/workflows/payments-ci.yml
name: Payments CI

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - run: npx coverage-check --lines 85

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      docker:
        image: docker:dind
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:e2e
\`\`\`

See **Release Process** (wiki-008) for how test results gate deployments.

## Related Resources

- **PAY-203**: CI Stripe rate limit incident
- **PAY-289**: Duplicate charge incident (motivated test improvements)
- **Payment Service API Documentation** (wiki-005) for endpoint contracts
- Slack: **#product-payments** (Dec 5 testing discussion)`,
  },
  {
    id: "wiki-008",
    title: "Release Process",
    category: "Operations",
    lastUpdated: "2026-02-01",
    author: "Priya Sharma",
    content: `# Release Process

## Overview

This document describes how we deploy changes to the payments service. Given the critical nature of payment processing, we follow a conservative deployment strategy with canary releases, automated rollbacks, and feature flags. This process was refined after the SEV-1 OOM incident (**PAY-245**) and the SEV-2 duplicate charge incident (**PAY-289**). Process changes were agreed upon in **#product-payments** on Jan 20.

## Deployment Pipeline

\`\`\`
PR Merged to main
    |
    v
CI Pipeline (unit + integration tests)
    |
    v
Build & Push Docker Image
    |
    v
Deploy to Staging
    |
    v
Staging Smoke Tests (automated)
    |
    v
Canary Deploy (5% traffic)
    |
    v (15 min observation)
Canary Validation (error rate, latency, success rate)
    |
    v (automated promotion if healthy)
Rolling Deploy (25% -> 50% -> 100%)
    |
    v
Post-Deploy Verification
\`\`\`

## Pre-Release Checklist

Before merging to \`main\`, verify the following:

- [ ] All CI checks pass (unit tests, integration tests, linting)
- [ ] PR has at least 2 approvals (1 must be from a senior engineer)
- [ ] Payment-related changes have a security review sign-off (see **PCI Compliance Checklist**, wiki-002, requirement 6)
- [ ] Database migrations are backward-compatible (can roll back without data loss)
- [ ] New features are behind feature flags in LaunchDarkly
- [ ] API changes are backward-compatible or versioned
- [ ] Monitoring dashboards and alerts are updated if needed
- [ ] Relevant **PAY-** Jira tickets are linked in the PR description

## Deployment Steps

### 1. Merge to Main

Once the PR is merged, the CI pipeline automatically triggers.

### 2. Staging Deployment

Staging deployment is automatic after CI passes:

\`\`\`bash
# Verify staging deployment (automated, but useful for manual checks)
kubectl get pods -n payments-staging -l app=payments-service
kubectl logs -l app=payments-service -n payments-staging --tail=50
\`\`\`

Staging smoke tests run automatically and post results to **#payments-alerts**.

### 3. Production Canary Deploy

After staging smoke tests pass, a canary deployment is triggered automatically:

\`\`\`bash
# The canary deployment is managed by Argo Rollouts
kubectl argo rollouts get rollout payments-service -n payments --watch
\`\`\`

**Canary configuration:**

\`\`\`yaml
# k8s/rollout.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: payments-service
spec:
  strategy:
    canary:
      steps:
        - setWeight: 5
        - pause: { duration: 15m }
        - analysis:
            templates:
              - templateName: payments-canary-analysis
        - setWeight: 25
        - pause: { duration: 10m }
        - setWeight: 50
        - pause: { duration: 10m }
        - setWeight: 100
      canaryMetadata:
        labels:
          role: canary
      stableMetadata:
        labels:
          role: stable
\`\`\`

### 4. Canary Validation

The canary analysis template automatically checks:

| Metric | Threshold | Source |
|--------|-----------|--------|
| Error rate (5xx) | < 0.5% | Datadog |
| P99 latency | < 500ms | Datadog |
| Payment success rate | > 98.5% | Custom metric |
| Stripe API error rate | < 1% | Datadog |

If any threshold is breached, the canary is **automatically rolled back**.

### 5. Post-Deploy Verification

After full rollout, the on-call engineer should verify:

\`\`\`bash
# Check all pods are healthy
kubectl get pods -n payments -l app=payments-service

# Verify no error spike in Datadog
# Dashboard: "Payments Service Overview"

# Run a synthetic payment test
curl -X POST https://api.acmepay.com/api/payments/health-check \\
  -H "Authorization: Bearer $HEALTH_CHECK_TOKEN"
\`\`\`

## Rollback Procedures

### Automated Rollback

Canary deployments automatically roll back if analysis fails. No manual action needed.

### Manual Rollback

If an issue is detected after full deployment:

\`\`\`bash
# Option 1: Argo Rollouts rollback (preferred)
kubectl argo rollouts undo payments-service -n payments

# Option 2: kubectl rollback
kubectl rollout undo deployment/payments-service -n payments

# Option 3: Deploy a specific known-good version
kubectl set image deployment/payments-service \\
  payments-service=acme/payments-service:v2.14.3 -n payments
\`\`\`

> **Important**: After any manual rollback, immediately notify the team in **#product-payments** and create a Jira ticket to investigate. See **Incident Response Playbook** (wiki-003) if the rollback is due to a customer-impacting issue.

### Database Migration Rollback

All migrations must have a corresponding \`down\` migration:

\`\`\`bash
# Roll back the last migration
npm run db:migrate:undo

# Roll back to a specific version
npm run db:migrate:undo --to 20260115_add_payment_metadata
\`\`\`

> Per team agreement (discussed in **#product-payments** on Jan 20), any migration that cannot be safely rolled back must be deployed independently, at least **24 hours** before the code that depends on it.

## Feature Flags

We use LaunchDarkly for feature flags. All new payment features must be flag-gated.

### Naming Convention

\`\`\`
payments.<feature-name>.<aspect>
\`\`\`

Examples:
- \`payments.multi-currency.enabled\`
- \`payments.retry-logic.max-attempts\`
- \`payments.new-checkout-flow.enabled\`

### Feature Flag Lifecycle

1. **Created**: Engineer creates flag in LaunchDarkly with \`false\` default
2. **Development**: Flag enabled in dev/staging only
3. **Canary**: Flag enabled for 5% of production traffic
4. **Rollout**: Gradual increase to 100%
5. **Cleanup**: Flag removed from code and LaunchDarkly (tracked via Jira ticket, e.g., **PAY-320**)

> **Stale flag policy**: Flags older than 90 days that are at 100% rollout should be cleaned up. We review stale flags monthly during architecture review. Decision made in **#product-payments** on Jan 20.

## Release Schedule

| Day | Activity |
|-----|----------|
| Monday-Thursday | Normal release window (9:00 AM - 3:00 PM ET) |
| Friday | No deployments (except critical hotfixes with Engineering Manager approval) |
| Weekends | Emergency-only deployments (requires VP approval) |

### Release Freeze Periods

- **Black Friday / Cyber Monday**: No deployments from the Wednesday before through the following Monday
- **End of Quarter**: No deployments in the last 2 business days of each quarter
- **Holiday seasons**: Announced in **#product-payments** at least 2 weeks in advance

Per our **Stripe Processing Agreement**, we must notify Stripe of any planned maintenance windows that may affect transaction processing. This is handled by the SRE team.

## Hotfix Process

For critical production issues requiring an immediate fix:

1. Create a branch from the latest release tag: \`hotfix/PAY-XXX-description\`
2. Implement the fix with tests
3. Get expedited review (1 senior engineer approval)
4. Merge and deploy -- canary phase is shortened to **5 minutes** for hotfixes
5. Create a postmortem if SEV-1 or SEV-2 (see **Incident Response Playbook**, wiki-003)

## Related Resources

- **PAY-245**: OOM incident that led to canary deployment adoption
- **PAY-289**: Duplicate charge incident that tightened release checks
- **PAY-320**: Feature flag cleanup tracking
- **Incident Response Playbook** (wiki-003) for handling failed deployments
- **Testing Strategy for Payment Flows** (wiki-007) for CI pipeline details
- Slack: **#product-payments**, **#payments-alerts**
- Argo Rollouts Dashboard: https://argo.internal.acmepay.com/rollouts/payments-service`,
  },
];
