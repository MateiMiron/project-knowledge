export interface E2eScenario {
  id: string;
  title: string;
  flow: string;
  priority: "critical" | "high" | "medium";
  status: "automated" | "manual" | "partial";
  lastRun: string;
  duration: string;
  steps: Array<{
    step: number;
    action: string;
    expected: string;
    status: "pass" | "fail" | "manual";
  }>;
  notes: string;
}

export const e2eScenarios: E2eScenario[] = [
  {
    id: "E2E-001",
    title: "Complete Checkout with Credit Card",
    flow: "Cart → Checkout → Payment → Confirmation",
    priority: "critical",
    status: "automated",
    lastRun: "2025-01-14",
    duration: "12.4s",
    steps: [
      {
        step: 1,
        action: "Add 3 items to cart from product listing page",
        expected:
          "Cart badge shows '3', cart total updates in real-time, mini-cart dropdown displays correct items with thumbnails",
        status: "pass",
      },
      {
        step: 2,
        action: "Navigate to checkout and enter shipping address (US domestic)",
        expected:
          "Address autocomplete suggests valid addresses, shipping options load within 2s (Standard $5.99, Express $12.99, Next-Day $24.99)",
        status: "pass",
      },
      {
        step: 3,
        action: "Select Express shipping and proceed to payment",
        expected:
          "Order summary reflects Express shipping cost, tax calculated correctly for state, total = subtotal + shipping + tax",
        status: "pass",
      },
      {
        step: 4,
        action:
          "Enter Visa test card (4242424242424242) with future expiry and valid CVC",
        expected:
          "Stripe Elements iframe loads, card number formats with spaces, real-time validation shows green checkmark, Pay button becomes active",
        status: "pass",
      },
      {
        step: 5,
        action: "Click 'Pay Now' button",
        expected:
          "Loading spinner appears, PaymentIntent created via POST /api/v2/payments/intents (API-TEST-001), 3D Secure skipped for test card, redirect to confirmation page within 5s",
        status: "pass",
      },
      {
        step: 6,
        action: "Verify confirmation page and post-purchase state",
        expected:
          "Order confirmation with order ID displayed, email confirmation queued (verified in test mailbox), inventory decremented, order appears in 'My Orders' with status 'Processing'",
        status: "pass",
      },
    ],
    notes:
      "This is the golden path test - must pass on every deployment. Runs in Playwright against staging environment. Uses Stripe test mode. Card validation relies on Stripe Elements which is configured per wiki-005 Payment API Docs. P99 end-to-end time target is 8s per CONTRACT-001 SLA.",
  },
  {
    id: "E2E-002",
    title: "Apple Pay Checkout Flow (Web)",
    flow: "Product → Apple Pay Sheet → Confirmation",
    priority: "critical",
    status: "partial",
    lastRun: "2025-01-12",
    duration: "8.7s",
    steps: [
      {
        step: 1,
        action:
          "Load product page on Safari with Apple Pay capable device/simulator",
        expected:
          "Apple Pay button renders (canMakePayments check passes), button style matches Apple HIG guidelines, feature flag apple-pay-web-enabled is ON",
        status: "pass",
      },
      {
        step: 2,
        action: "Click Apple Pay button on product detail page",
        expected:
          "Apple Pay payment sheet opens with correct merchant name ('Acme Commerce'), order total, and shipping options pre-populated",
        status: "pass",
      },
      {
        step: 3,
        action: "Authenticate with Touch ID / Face ID in payment sheet",
        expected:
          "PKPaymentToken generated, sent to POST /api/v2/payments/apple-pay/tokens (API-TEST-003), token exchanged for Stripe PaymentMethod",
        status: "fail",
      },
      {
        step: 4,
        action: "Verify payment completion and order creation",
        expected:
          "Payment sheet dismisses with success checkmark, redirect to order confirmation, order created with payment_method_type='apple_pay'",
        status: "manual",
      },
    ],
    notes:
      "Step 3 FAILS intermittently due to sandbox routing bug in API-TEST-003 (tracked in PAY-103). When APPLE_PAY_ENV variable is unset, tokens route to production Stripe endpoint. Phased rollout planned: Phase 1 Web (April 1), Phase 2 iOS (April 30) per EMAIL-003. Full automation blocked until PAY-103 is resolved. Manual testing required for steps 3-4.",
  },
  {
    id: "E2E-003",
    title: "Refund Request and Processing",
    flow: "My Orders → Request Refund → Admin Approval → Refund Processed",
    priority: "high",
    status: "automated",
    lastRun: "2025-01-14",
    duration: "18.2s",
    steps: [
      {
        step: 1,
        action: "Navigate to 'My Orders' and select a delivered order (age < 30 days)",
        expected:
          "Order detail page shows 'Request Refund' button, order status is 'Delivered', refund eligibility check passes (within 30-day return window)",
        status: "pass",
      },
      {
        step: 2,
        action: "Click 'Request Refund', select reason 'Item damaged', add photo evidence",
        expected:
          "Refund form accepts reason selection and file upload (max 5MB, jpg/png), confirmation modal shows refund amount and estimated processing time (5-10 business days)",
        status: "pass",
      },
      {
        step: 3,
        action: "Submit refund request",
        expected:
          "Refund request created with status='pending_review', customer receives email confirmation, order status changes to 'Refund Requested', support ticket auto-created (similar to SUPPORT-004)",
        status: "pass",
      },
      {
        step: 4,
        action: "Admin logs in and approves the refund in dashboard",
        expected:
          "Admin sees refund request with evidence, clicks 'Approve Full Refund', POST /api/v2/payments/{id}/refunds called (API-TEST-002), refund status='processing'",
        status: "pass",
      },
      {
        step: 5,
        action: "Verify refund completion via webhook",
        expected:
          "Stripe webhook 'refund.succeeded' received (API-TEST-004 webhook verification), refund status='completed', customer email sent with refund confirmation, inventory restored for physical items",
        status: "pass",
      },
    ],
    notes:
      "End-to-end refund flow spans 3 services: storefront, payment API, and admin dashboard. The auto-ticket creation was added after support team feedback (SUPPORT-004). Race condition for concurrent refunds handled by API-TEST-002 test 4, designed after slack-thread-001 discussion. 180-day refund window enforced per CONTRACT-001 section 4.2.",
  },
  {
    id: "E2E-004",
    title: "Failed Payment Recovery with Retry",
    flow: "Checkout → Payment Fails → Retry → Success",
    priority: "high",
    status: "automated",
    lastRun: "2025-01-14",
    duration: "22.6s",
    steps: [
      {
        step: 1,
        action: "Complete checkout with Stripe decline test card (4000000000000002)",
        expected:
          "Payment attempt fails with 'card_declined' error, user-friendly message displayed: 'Your card was declined. Please try a different payment method.'",
        status: "pass",
      },
      {
        step: 2,
        action: "Verify cart and order state preserved after failure",
        expected:
          "Cart items unchanged, shipping selection preserved, entered billing address retained, no orphaned PaymentIntent created. Order remains in 'payment_pending' status.",
        status: "pass",
      },
      {
        step: 3,
        action: "Enter a different card (4242424242424242) and retry payment",
        expected:
          "New PaymentIntent created (old one cancelled), payment succeeds on retry, order transitions from 'payment_pending' to 'confirmed'",
        status: "pass",
      },
      {
        step: 4,
        action: "Verify no double charges occurred",
        expected:
          "Exactly one successful charge in Stripe dashboard, failed attempt shows as 'failed' not 'succeeded'. Idempotency verified per API-TEST-001 test 4. No duplicate webhook events per API-TEST-004 test 4.",
        status: "pass",
      },
      {
        step: 5,
        action: "Check analytics and monitoring events",
        expected:
          "Payment failure event logged with decline reason, retry success event logged, conversion funnel shows recovery. Metrics feed into Q1 performance report (EMAIL-004).",
        status: "pass",
      },
    ],
    notes:
      "This flow was the primary focus after the double-charge incident (POSTMORTEM-002). The retry system architecture was reviewed in MEETING-002. Key safeguards: old PaymentIntent cancellation, idempotency keys, and webhook deduplication. PAY-102 tracks the retry mechanism improvements. Error messages follow UX guidelines in wiki-004 Onboarding Guide.",
  },
  {
    id: "E2E-005",
    title: "PCI-Compliant Checkout Security Validation",
    flow: "Security headers → CSP → Tokenization → No PAN exposure",
    priority: "critical",
    status: "automated",
    lastRun: "2025-01-14",
    duration: "6.3s",
    steps: [
      {
        step: 1,
        action: "Load checkout page and verify security headers",
        expected:
          "Content-Security-Policy header restricts scripts to self + js.stripe.com, X-Frame-Options=DENY, Strict-Transport-Security max-age=31536000, X-Content-Type-Options=nosniff",
        status: "pass",
      },
      {
        step: 2,
        action:
          "Inspect Stripe Elements iframe isolation",
        expected:
          "Card input rendered inside Stripe-hosted iframe (origin: js.stripe.com), no card data accessible to parent page JavaScript, PAN never touches our DOM",
        status: "pass",
      },
      {
        step: 3,
        action:
          "Submit payment and inspect network requests for PAN leakage",
        expected:
          "No network request from our domain contains full card number, CVV, or expiry. Only Stripe token/PaymentMethod ID transmitted to our API. Validates PCI DSS Requirement 3.4.",
        status: "pass",
      },
      {
        step: 4,
        action: "Check server logs for sensitive data exposure",
        expected:
          "No PAN, CVV, or track data in application logs. Card last4 only in structured log fields. Addresses EMAIL-002 finding about PAN leaking in debug logs (now fixed per PAY-107).",
        status: "pass",
      },
      {
        step: 5,
        action: "Verify client-side script inventory for PCI DSS v4.0",
        expected:
          "All third-party scripts accounted for in CSP and documented in script inventory. Required by PCI DSS v4.0 Requirement 6.4.3. See EMAIL-002 critical finding #1 and wiki-002 PCI Compliance Checklist.",
        status: "pass",
      },
    ],
    notes:
      "This security-focused E2E suite was created after the PCI pre-audit (EMAIL-002). Tests validate PCI DSS Requirements 3.4, 4.1, 6.4.3, and 6.5. The PAN-in-logs issue was a SEV-2 incident (POSTMORTEM-003). Suite runs on every deployment to staging/production as a gate. CoalFire audit scheduled for Feb 14 per EMAIL-002. Full PCI checklist in wiki-002.",
  },
  {
    id: "E2E-006",
    title: "High-Traffic Flash Sale Checkout",
    flow: "Flash Sale Landing → Concurrent Checkout → Inventory Guard → Confirmation",
    priority: "high",
    status: "manual",
    lastRun: "2025-01-10",
    duration: "45.0s",
    steps: [
      {
        step: 1,
        action: "Simulate 500 concurrent users adding same flash sale item to cart",
        expected:
          "All 500 users see item available, cart additions succeed, real-time inventory counter shows correct remaining stock (no overselling)",
        status: "manual",
      },
      {
        step: 2,
        action: "200 users proceed to checkout simultaneously",
        expected:
          "Checkout page loads within 3s for all users (p95), no 502/503 errors, payment form renders correctly under load",
        status: "manual",
      },
      {
        step: 3,
        action: "100 users submit payment within 30-second window",
        expected:
          "All payments processed without timeouts, no double charges, inventory accurately reserved per transaction. If item sells out, remaining users see 'Sold Out' gracefully.",
        status: "manual",
      },
      {
        step: 4,
        action: "Verify system stability post-burst",
        expected:
          "No cascading failures, circuit breakers did not trip (or tripped and recovered within 30s), error rate remains below 0.5%, database connection pool recovered",
        status: "manual",
      },
    ],
    notes:
      "This scenario directly addresses the Black Friday outage (POSTMORTEM-001) where the payment gateway hit connection pool limits at 12,000 concurrent checkouts. Currently manual due to infrastructure cost - requires dedicated load test environment. PAY-109 tracks the load testing initiative. Target: 12,000 concurrent checkouts per MEETING-004 stakeholder review. Will use k6 for automation per MEETING-001 sprint planning. SUPPORT-003 customer escalation about flash sale failures drove priority increase.",
  },
];
