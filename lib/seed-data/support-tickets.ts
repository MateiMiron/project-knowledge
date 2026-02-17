export interface SupportTicket {
  id: string;
  subject: string;
  customer: string;
  priority: string;
  status: string;
  category: string;
  createdAt: string;
  messages: Array<{
    from: string;
    role: string;
    timestamp: string;
    content: string;
  }>;
}

export const supportTickets: SupportTicket[] = [
  {
    id: 'SUPPORT-001',
    subject: 'Charged twice for order #ORD-8847',
    customer: 'Rachel Thompson',
    priority: 'urgent',
    status: 'solved',
    category: 'billing',
    createdAt: '2026-02-03T09:14:00Z',
    messages: [
      {
        from: 'Rachel Thompson',
        role: 'customer',
        timestamp: '2026-02-03T09:14:00Z',
        content:
          'Hi, I placed an order yesterday (order #ORD-8847) for $127.50 and I just checked my bank statement and I see TWO charges for the same amount. I definitely only placed one order. Can you please look into this and refund the duplicate charge? This is really frustrating.',
      },
      {
        from: 'Daniel Park',
        role: 'agent',
        timestamp: '2026-02-03T09:42:00Z',
        content:
          "Hi Rachel, thank you for reaching out, and I sincerely apologize for the inconvenience. I can see your order #ORD-8847 in our system. Let me pull up the payment records and investigate the duplicate charge. I'll need a few minutes to cross-reference with our payment processor. Please bear with me.",
      },
      {
        from: 'Daniel Park',
        role: 'agent',
        timestamp: '2026-02-03T10:05:00Z',
        content:
          "Rachel, I've confirmed the issue. Our system did process two charges of $127.50 against your card ending in 4821. This was caused by a known bug related to payment retries after a network timeout (tracked internally as PAY-106). Our engineering team is already working on a permanent fix. I've initiated a full refund of $127.50 for the duplicate charge. You should see it reflected in your account within 3-5 business days depending on your bank.",
      },
      {
        from: 'Rachel Thompson',
        role: 'customer',
        timestamp: '2026-02-03T10:18:00Z',
        content:
          "Thank you, Daniel. I appreciate you looking into it so quickly. I'll keep an eye on my statement for the refund. Glad to hear you're fixing the underlying issue too.",
      },
    ],
  },
  {
    id: 'SUPPORT-002',
    subject: 'Apple Pay not showing up at checkout',
    customer: 'Marcus Chen',
    priority: 'normal',
    status: 'pending',
    category: 'technical',
    createdAt: '2026-02-05T14:30:00Z',
    messages: [
      {
        from: 'Marcus Chen',
        role: 'customer',
        timestamp: '2026-02-05T14:30:00Z',
        content:
          "I'm trying to check out on my iPhone using Safari and I don't see an Apple Pay option anywhere. I use Apple Pay on pretty much every other site I shop on. Is this something you support? It would make checkout a lot faster for me.",
      },
      {
        from: 'Lisa Nguyen',
        role: 'agent',
        timestamp: '2026-02-05T14:52:00Z',
        content:
          "Hi Marcus, thanks for writing in! Great question. Apple Pay is not yet available on our platform, but I have good news -- our engineering team is actively building Apple Pay support right now (internal project PAY-103). It's currently in code review and we're planning an initial rollout to a subset of eligible users in the coming weeks. We'll send an announcement via email once it's live.",
      },
      {
        from: 'Marcus Chen',
        role: 'customer',
        timestamp: '2026-02-05T15:10:00Z',
        content:
          "That's great to hear! I'll keep an eye out for the announcement. In the meantime, I'll just use my saved card. Thanks for the update.",
      },
    ],
  },
  {
    id: 'SUPPORT-003',
    subject: 'Payment processing delays during flash sale - Acme Corp enterprise account',
    customer: 'Jennifer Walsh',
    priority: 'urgent',
    status: 'escalated',
    category: 'technical',
    createdAt: '2026-02-08T18:03:00Z',
    messages: [
      {
        from: 'Jennifer Walsh',
        role: 'customer',
        timestamp: '2026-02-08T18:03:00Z',
        content:
          "This is Jennifer Walsh, VP of Operations at Acme Corp. We launched a flash sale at 6 PM EST and our customers are experiencing severe delays at checkout. Payments are taking upwards of 30 seconds to process and some are timing out entirely. We're losing thousands of dollars in sales per minute. This needs to be escalated immediately -- we have an enterprise SLA with you.",
      },
      {
        from: 'Daniel Park',
        role: 'agent',
        timestamp: '2026-02-08T18:09:00Z',
        content:
          "Jennifer, thank you for alerting us. I recognize the severity of this issue and I'm escalating it to our payments engineering team right now. I can see elevated latency on our payment processing endpoints. Can you confirm approximately how many concurrent checkouts you're seeing? This will help our team diagnose the bottleneck faster.",
      },
      {
        from: 'Jennifer Walsh',
        role: 'customer',
        timestamp: '2026-02-08T18:14:00Z',
        content:
          "We're seeing around 4,000 concurrent users on the site right now, with roughly 1,200 attempting checkout simultaneously. Our normal peak is about 300 concurrent checkouts. Several customers have reached out to us on social media complaining about failed payments. This is damaging our brand.",
      },
      {
        from: 'Daniel Park',
        role: 'agent',
        timestamp: '2026-02-08T18:28:00Z',
        content:
          "Jennifer, I've escalated this to our senior engineering team and they're actively investigating. The issue appears to be related to connection pool saturation under your flash sale traffic volume. We've linked this to an internal investigation (PAY-109) focused on capacity planning for high-traffic sale events. Our engineers are working on increasing throughput on your account's payment processing pipeline right now.",
      },
      {
        from: 'Jennifer Walsh',
        role: 'customer',
        timestamp: '2026-02-08T18:45:00Z',
        content:
          "We're still seeing intermittent timeouts. I need a direct line to your engineering lead and a post-incident report within 24 hours per our enterprise agreement. Please also provide a timeline for when processing will stabilize. We have another flash sale planned for next week and we cannot have a repeat of this.",
      },
    ],
  },
  {
    id: 'SUPPORT-004',
    subject: 'Refund request for order #ORD-9213 - package never delivered',
    customer: 'David Okafor',
    priority: 'high',
    status: 'solved',
    category: 'refund',
    createdAt: '2026-02-10T11:22:00Z',
    messages: [
      {
        from: 'David Okafor',
        role: 'customer',
        timestamp: '2026-02-10T11:22:00Z',
        content:
          "I ordered a wireless keyboard and mouse set (order #ORD-9213, $89.99) on January 28th. The tracking shows it was supposedly delivered on February 3rd, but I never received it. I've checked with my building's front desk and my neighbors -- nothing. I'd like a full refund please.",
      },
      {
        from: 'Lisa Nguyen',
        role: 'agent',
        timestamp: '2026-02-10T11:45:00Z',
        content:
          "Hi David, I'm sorry to hear about this. That's definitely frustrating. I've pulled up your order and I can see the tracking from our delivery partner, FastShip Logistics, shows a delivery confirmation on February 3rd. Let me file an investigation with them and review this against our delivery SLA. I'll also check what options we have for you under our refund policy. Give me just a moment.",
      },
      {
        from: 'Lisa Nguyen',
        role: 'agent',
        timestamp: '2026-02-10T12:10:00Z',
        content:
          "David, I've reviewed your case. Under our delivery partner agreement (CONTRACT-002), FastShip is responsible for confirmed deliveries, and they have a claims process for lost packages. However, I don't want you to have to wait for that investigation to conclude. Per our refund policy, I'm processing a partial refund of $71.99 (80% of the order value) to your original payment method right now. If FastShip's investigation confirms the package was lost on their end, we'll issue the remaining $18.00. The $71.99 should appear in your account within 3-5 business days.",
      },
      {
        from: 'David Okafor',
        role: 'customer',
        timestamp: '2026-02-10T12:28:00Z',
        content:
          "I appreciate you handling this so quickly, Lisa. The partial refund is fair for now. I hope the delivery partner investigation doesn't take too long for the rest. Thank you for your help.",
      },
    ],
  },
  {
    id: 'SUPPORT-005',
    subject: 'Is my payment information safe? Saw a news article about data breaches',
    customer: 'Sarah Kim',
    priority: 'low',
    status: 'solved',
    category: 'account',
    createdAt: '2026-02-12T16:45:00Z',
    messages: [
      {
        from: 'Sarah Kim',
        role: 'customer',
        timestamp: '2026-02-12T16:45:00Z',
        content:
          "Hi, I saw a news article this morning about several e-commerce platforms being hit by data breaches and customer payment data being stolen. I have my credit card saved on your site and I'm now worried. Can you tell me how you protect my payment information? Should I remove my saved card?",
      },
      {
        from: 'Daniel Park',
        role: 'agent',
        timestamp: '2026-02-12T17:08:00Z',
        content:
          "Hi Sarah, that's a completely understandable concern, and I'm glad you reached out. I want to assure you that we take payment data security extremely seriously. Here's how we protect your information:\n\n1. We are fully PCI DSS v4.0 compliant (wiki-002). This is the highest industry standard for payment data security, and we undergo annual audits by a certified Qualified Security Assessor.\n\n2. Your actual credit card number is never stored on our servers. When you save a card, we use Stripe's tokenization system -- only an encrypted reference token is stored on our side. Even if someone breached our database, they would not be able to access your card number or CVV.\n\n3. Our engineering team recently completed a comprehensive security review of our webhook and payment processing infrastructure (PAY-107) to ensure all payment data in transit is verified and tamper-proof.\n\n4. We use Subresource Integrity checks and Content Security Policies on all checkout pages to prevent any unauthorized scripts from accessing payment forms.\n\nYou do not need to remove your saved card, but you're always welcome to manage your payment methods from your account settings if you'd prefer.",
      },
      {
        from: 'Sarah Kim',
        role: 'customer',
        timestamp: '2026-02-12T17:25:00Z',
        content:
          "Wow, thank you for such a thorough explanation, Daniel. That makes me feel a lot better knowing my card number isn't actually stored on your servers. I'll keep my card saved. Thanks for taking the time to explain all of that!",
      },
    ],
  },
];
