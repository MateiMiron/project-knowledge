export interface Contract {
  id: string;
  title: string;
  vendor: string;
  content: string;
  effectiveDate: string;
  expirationDate: string;
  keyTerms: string[];
}

export const contracts: Contract[] = [
  {
    id: "CONTRACT-001",
    title: "Payment Processing Services Agreement",
    vendor: "Stripe, Inc.",
    effectiveDate: "2024-01-15",
    expirationDate: "2027-01-14",
    keyTerms: [
      "transaction fee 2.9% + $0.30",
      "uptime SLA 99.95%",
      "dispute resolution 10 business days",
      "data retention 7 years",
      "PCI DSS Level 1 compliance",
      "P1 support response 1 hour",
      "P2 support response 4 hours",
      "chargeback fee $15.00",
      "monthly minimum processing $0",
      "termination notice 90 days",
    ],
    content: `PAYMENT PROCESSING SERVICES AGREEMENT

Agreement Number: PSA-2024-00471
Effective Date: January 15, 2024
Expiration Date: January 14, 2027
Parties: Stripe, Inc. ("Processor") and Acme Commerce, Inc. ("Merchant")

1. SCOPE OF SERVICES

Stripe, Inc. shall provide payment processing services to Acme Commerce, Inc. for all online and point-of-sale transactions across the Merchant's e-commerce platform. This agreement covers credit card processing, debit card processing, ACH transfers, and digital wallet transactions (Apple Pay, Google Pay). Implementation of this agreement is tracked in PAY-101 and PAY-102. All integration work shall conform to the architecture described in the Payment Gateway Integration Guide wiki page.

2. TRANSACTION FEES AND PRICING

2.1 Standard Processing Fees: The Processor shall charge a transaction fee of 2.9% of the transaction amount plus $0.30 per transaction for all domestic credit and debit card transactions. International transactions shall incur an additional 1.5% surcharge on top of the standard rate, for a total of 4.4% plus $0.30 per transaction.

2.2 ACH and Bank Transfer Fees: ACH transactions shall be charged at 0.8% of the transaction amount, with a cap of $5.00 per transaction. Wire transfers shall be charged at a flat rate of $8.00 per domestic transfer and $25.00 per international transfer.

2.3 Chargeback Fees: A fee of $15.00 shall be assessed per chargeback initiated against the Merchant, regardless of the outcome of the dispute. If the Merchant's chargeback rate exceeds 1.0% of total transactions in any rolling 90-day period, the Processor reserves the right to increase chargeback fees to $25.00 per occurrence and to impose additional review requirements. Chargeback monitoring procedures are documented in PAY-145.

2.4 Monthly Minimum: There is no monthly minimum processing volume required under this agreement. However, accounts processing fewer than 100 transactions per month may be subject to a monthly account maintenance fee of $25.00 beginning in Year 2 of the agreement.

2.5 Volume Discounts: If the Merchant's monthly processing volume exceeds $500,000, the standard transaction fee shall be reduced to 2.7% plus $0.25 per transaction. For monthly volumes exceeding $2,000,000, the fee shall be further reduced to 2.5% plus $0.20 per transaction. Volume discount eligibility is reviewed quarterly.

3. SERVICE LEVEL AGREEMENT

3.1 Uptime Guarantee: The Processor guarantees an uptime SLA of 99.95% measured on a monthly basis, excluding scheduled maintenance windows. Scheduled maintenance shall not exceed 4 hours per month and shall be conducted between 2:00 AM and 6:00 AM Eastern Time on Sundays with at least 72 hours advance notice.

3.2 Uptime Credits: If the Processor fails to meet the 99.95% uptime SLA in any calendar month, the Merchant shall receive service credits as follows: (a) 99.9% to 99.95% uptime: 10% credit on that month's processing fees; (b) 99.0% to 99.9% uptime: 25% credit; (c) below 99.0% uptime: 50% credit. The Merchant must submit a credit request within 30 days of the end of the affected month. Uptime monitoring is tracked through the internal dashboard described in the Platform Reliability Runbook wiki page.

3.3 Transaction Latency: The Processor shall complete authorization responses within 350 milliseconds for 95% of all transactions and within 700 milliseconds for 99% of all transactions, measured at the Processor's API gateway. Performance degradation beyond these thresholds for more than 15 consecutive minutes shall constitute a service incident. Related performance benchmarking is tracked in PAY-203.

4. DISPUTE HANDLING AND CHARGEBACK MANAGEMENT

4.1 Dispute Resolution Timeline: The Processor shall notify the Merchant of any new dispute or chargeback within 24 hours of receipt. The Merchant shall have 10 business days from the date of notification to submit evidence and respond to the dispute. The Processor shall submit the Merchant's response to the issuing bank within 2 business days of receipt. Dispute workflow automation is tracked in PAY-178.

4.2 Representment Services: The Processor shall provide representment services at no additional cost, including automated evidence compilation for disputes under $100. For disputes exceeding $100, the Processor shall assign a dedicated dispute analyst.

5. DATA RETENTION AND SECURITY

5.1 Data Retention Policy: Transaction records, including authorization logs, settlement data, and associated metadata, shall be retained for a minimum of 7 years from the date of the transaction in accordance with PCI DSS requirements and applicable financial regulations. See the PCI Compliance Checklist wiki page for implementation details.

5.2 PCI Compliance: The Processor shall maintain PCI DSS Level 1 certification throughout the term of this agreement and shall provide evidence of annual certification upon request. The Merchant shall maintain at minimum PCI DSS Level 2 compliance for its systems that interact with the Processor's APIs. Quarterly vulnerability scans and annual penetration testing results shall be shared between parties. PCI compliance requirements and status tracking are documented in PAY-110 and the PCI Compliance Checklist wiki page.

5.3 Encryption: All transaction data shall be encrypted in transit using TLS 1.2 or higher and at rest using AES-256 encryption. Tokenization shall be used for all stored payment credentials.

6. SUPPORT AND INCIDENT RESPONSE

6.1 Support Tiers: The Processor shall provide tiered technical support as follows: Priority 1 (Critical - complete payment processing outage or data breach): response within 1 hour, resolution target 4 hours; Priority 2 (High - partial service degradation or elevated error rates): response within 4 hours, resolution target 12 hours; Priority 3 (Medium - non-critical functionality issues): response within 8 business hours, resolution target 3 business days; Priority 4 (Low - general inquiries): response within 2 business days. The incident escalation process is detailed in the Incident Response Playbook wiki page.

6.2 Dedicated Account Manager: The Processor shall assign a dedicated account manager to the Merchant's account, available during business hours (9:00 AM to 6:00 PM Eastern Time, Monday through Friday).

7. TERMINATION

7.1 Termination for Convenience: Either party may terminate this agreement with 90 days written notice. Early termination within the first 12 months shall incur an early termination fee of $5,000.

7.2 Termination for Cause: Either party may terminate immediately upon material breach that remains uncured for 30 days after written notice. Material breach includes failure to maintain PCI compliance, uptime below 99.0% for three consecutive months, or chargeback rates exceeding 2.0%.

Authorized Signatures:
Stripe, Inc.: ___________________________  Date: January 15, 2024
Acme Commerce, Inc.: ___________________________  Date: January 15, 2024`,
  },
  {
    id: "CONTRACT-002",
    title: "Delivery Partner Service Agreement",
    vendor: "FastShip Logistics, LLC",
    effectiveDate: "2024-03-01",
    expirationDate: "2026-02-28",
    keyTerms: [
      "same-day metro delivery 4 hours",
      "standard delivery 2 business days",
      "auto-refund shipping if >24hr late",
      "surge pricing cap 2x standard rate",
      "insurance coverage $500 per package",
      "lost package claim 5 business days",
      "real-time tracking API",
      "monthly delivery volume minimum 5000",
      "fuel surcharge cap 15%",
      "termination notice 60 days",
    ],
    content: `DELIVERY PARTNER SERVICE AGREEMENT

Agreement Number: DPA-2024-00892
Effective Date: March 1, 2024
Expiration Date: February 28, 2026
Parties: FastShip Logistics, LLC ("Carrier") and Acme Commerce, Inc. ("Shipper")

1. SCOPE OF SERVICES

FastShip Logistics, LLC shall provide last-mile delivery services to Acme Commerce, Inc. for all physical goods sold through the Shipper's e-commerce platform. Services include same-day delivery within designated metropolitan areas, standard ground shipping nationwide, and express overnight delivery. Integration of delivery tracking with the Shipper's order management system is tracked in PAY-134 and PAY-156. All API integration specifications are documented in the Shipping Integration Architecture wiki page.

2. DELIVERY SERVICE LEVELS AND TIMELINES

2.1 Same-Day Metro Delivery: For orders placed before 12:00 PM local time within designated metropolitan service areas (New York, Los Angeles, Chicago, San Francisco, Miami, Seattle, and Dallas), the Carrier shall complete delivery within 4 hours of dispatch confirmation. Same-day delivery is available seven days a week, including federal holidays, for packages weighing up to 30 pounds.

2.2 Standard Delivery: For all domestic orders, the Carrier shall complete delivery within 2 business days from the date of dispatch confirmation. Business days are defined as Monday through Friday, excluding federal holidays. Standard delivery applies to packages weighing up to 70 pounds.

2.3 Express Overnight Delivery: For orders requiring next-business-day delivery, the Carrier shall deliver by 10:30 AM local time on the next business day following dispatch. Express service is available for packages weighing up to 50 pounds.

2.4 Delivery Confirmation: The Carrier shall provide photographic proof of delivery, GPS-stamped delivery confirmation, and recipient signature (for packages valued over $200) for all deliveries. Delivery data shall be transmitted to the Shipper's systems via webhook within 60 seconds of delivery completion.

3. REFUND TERMS FOR SERVICE FAILURES

3.1 Late Delivery Refunds: If a standard delivery exceeds the 2 business day SLA by more than 24 hours, the Carrier shall automatically refund 100% of the shipping fee to the Shipper without requiring a claim submission. The refund shall be applied as a credit on the next monthly invoice. This auto-refund process is integrated with the order management system as described in PAY-167. See the Refund Policy and Procedures wiki page for end-to-end refund processing details.

3.2 Same-Day Delivery Failures: If a same-day metro delivery is not completed within 6 hours of dispatch (exceeding the 4-hour SLA by more than 2 hours), the Carrier shall refund 100% of the same-day delivery premium and the Shipper may, at its discretion, offer the customer a $10 store credit at the Carrier's expense, up to a maximum of 500 such credits per calendar month.

3.3 Chronic Service Failures: If the Carrier fails to meet delivery SLAs for more than 5% of total shipments in any calendar month, the Shipper shall be entitled to a 15% discount on all delivery fees for the following month. If failures exceed 10% in any calendar month, the Shipper may terminate this agreement with 15 days written notice without penalty.

4. PRICING AND SURGE PRICING

4.1 Standard Rates: Same-day metro delivery: $12.50 per package (up to 5 lbs), $18.00 per package (5-15 lbs), $25.00 per package (15-30 lbs). Standard 2-day delivery: $6.50 per package (up to 5 lbs), $9.00 per package (5-15 lbs), $14.00 per package (15-30 lbs), $22.00 per package (30-70 lbs). Express overnight: $18.00 per package (up to 5 lbs), $28.00 per package (5-15 lbs), $40.00 per package (15-50 lbs).

4.2 Surge Pricing: During periods of elevated demand (defined as order volume exceeding 200% of the trailing 30-day daily average), the Carrier may apply surge pricing. Surge pricing is capped at a maximum of 2x the standard rate for all service tiers. Surge pricing may not be applied for more than 72 consecutive hours without the Shipper's written consent. The Carrier shall provide at least 4 hours advance notice before implementing surge pricing when possible. Surge pricing thresholds and monitoring are tracked in PAY-189.

4.3 Fuel Surcharge: The Carrier may apply a fuel surcharge not to exceed 15% of the base delivery rate, adjusted quarterly based on the U.S. Department of Energy's national average diesel price index.

4.4 Monthly Volume Commitment: The Shipper commits to a minimum monthly delivery volume of 5,000 packages. If actual volume falls below this threshold for two consecutive months, the Carrier may adjust rates upward by up to 10% upon 30 days written notice.

5. INSURANCE AND LIABILITY

5.1 Package Insurance: The Carrier shall provide insurance coverage of up to $500 per package for loss, damage, or theft occurring during transit or delivery. Coverage begins at the time of pickup from the Shipper's facility and ends upon confirmed delivery.

5.2 Claims Process: The Shipper must submit a claim for lost or damaged packages within 14 calendar days of the expected delivery date. The Carrier shall resolve claims within 5 business days of receipt of a complete claim submission, including any supporting documentation. Claims valued at $100 or less shall be automatically approved.

5.3 High-Value Packages: For packages with a declared value exceeding $500, additional insurance coverage may be purchased at a rate of $1.50 per $100 of declared value above the $500 base coverage. Maximum insurable value is $5,000 per package.

5.4 Carrier Liability Cap: The Carrier's total liability for any single incident shall not exceed $50,000. The Carrier's aggregate annual liability under this agreement shall not exceed $500,000.

6. TECHNOLOGY AND INTEGRATION

6.1 Real-Time Tracking API: The Carrier shall provide and maintain a RESTful API for real-time package tracking, supporting at minimum: package status updates, estimated delivery time, driver GPS location (within 500 meters), and delivery confirmation data. API uptime shall be at least 99.9%. API documentation and integration details are maintained in the Shipping Integration Architecture wiki page.

6.2 Webhook Notifications: The Carrier shall support webhook-based event notifications for the following events: package picked up, in transit, out for delivery, delivered, delivery attempted, and delivery exception. Webhook delivery latency shall not exceed 60 seconds from event occurrence.

7. TERMINATION

7.1 Either party may terminate this agreement with 60 days written notice. The Shipper may terminate with 15 days notice if chronic service failure conditions (Section 3.3) are met. Outstanding invoices and credits shall be settled within 30 days of termination.

Authorized Signatures:
FastShip Logistics, LLC: ___________________________  Date: March 1, 2024
Acme Commerce, Inc.: ___________________________  Date: March 1, 2024`,
  },
  {
    id: "CONTRACT-003",
    title: "Cloud Infrastructure Services Agreement",
    vendor: "Amazon Web Services, Inc.",
    effectiveDate: "2024-02-01",
    expirationDate: "2027-01-31",
    keyTerms: [
      "uptime SLA 99.99%",
      "Business support 1 hour critical response",
      "Developer support 12 hour response",
      "data sovereignty US-East EU-West",
      "cost cap $15,000/month base",
      "auto-scaling terms",
      "reserved instance commitment 1 year",
      "data encryption AES-256",
      "annual spend commitment $180,000",
      "termination notice 90 days",
    ],
    content: `CLOUD INFRASTRUCTURE SERVICES AGREEMENT

Agreement Number: CISA-2024-03187
Effective Date: February 1, 2024
Expiration Date: January 31, 2027
Parties: Amazon Web Services, Inc. ("Provider") and Acme Commerce, Inc. ("Customer")

1. SCOPE OF SERVICES

Amazon Web Services, Inc. shall provide cloud computing infrastructure services to Acme Commerce, Inc. to support the Customer's e-commerce platform, payment processing systems, and associated business applications. Services include compute instances (EC2), managed databases (RDS), object storage (S3), content delivery (CloudFront), container orchestration (ECS/EKS), and serverless computing (Lambda). Infrastructure provisioning and architecture decisions are documented in the Cloud Infrastructure Architecture wiki page. Migration and scaling initiatives are tracked in PAY-115 and PAY-201.

2. SERVICE LEVEL AGREEMENT

2.1 Uptime Guarantee: The Provider guarantees a monthly uptime SLA of 99.99% for all production-tier services, measured as the percentage of time the services are available and operational during a calendar month. This equates to no more than 4.32 minutes of unplanned downtime per month. Scheduled maintenance shall be performed during pre-approved windows (Sundays 3:00 AM to 5:00 AM Eastern Time) and shall not count against the uptime calculation.

2.2 Uptime Credit Schedule: If the Provider fails to meet the 99.99% monthly uptime SLA, the Customer shall receive the following service credits applied to the next invoice: (a) 99.95% to 99.99%: 10% credit on affected services; (b) 99.0% to 99.95%: 25% credit; (c) 95.0% to 99.0%: 50% credit; (d) below 95.0%: 100% credit on affected services for that month. Credits must be requested within 60 days of the incident. Uptime monitoring and alerting procedures are described in the Platform Reliability Runbook wiki page.

2.3 Recovery Time Objective: For any unplanned service interruption, the Provider shall achieve a recovery time objective (RTO) of 15 minutes for compute services and 30 minutes for managed database services. The recovery point objective (RPO) for managed databases with Multi-AZ deployment shall not exceed 5 minutes.

3. SUPPORT TIERS

3.1 Business Support Tier: The Customer has enrolled in the Business Support plan, which provides the following response times: Critical (production system down): initial response within 1 hour with 24/7 availability; Urgent (production system impaired): initial response within 4 hours; High (non-production system impaired): initial response within 12 hours; Normal (general guidance): initial response within 24 hours. Business Support includes access to the full suite of AWS Trusted Advisor checks and Infrastructure Event Management for planned scaling events.

3.2 Developer Support Tier: For non-production and development environments, Developer Support applies with the following response times: General guidance within 24 business hours; System impaired within 12 hours during business hours (7:00 AM to 7:00 PM Pacific Time, Monday through Friday). Developer Support includes access to Cloud Support Associates during business hours. Support escalation procedures are documented in the Incident Response Playbook wiki page.

3.3 Technical Account Manager: A named Technical Account Manager (TAM) shall be assigned to the Customer's account, providing proactive guidance, architectural reviews (quarterly), and prioritized incident handling. The TAM shall conduct monthly operational reviews and provide written recommendations.

4. DATA SOVEREIGNTY AND REGIONAL REQUIREMENTS

4.1 Primary Data Regions: All production data, including customer transaction records, personally identifiable information, and payment-related data, shall be stored and processed exclusively within the US-East (N. Virginia, us-east-1) region. Disaster recovery replicas shall be maintained in US-East (Ohio, us-east-2).

4.2 European Operations: For transactions originating from or involving European Economic Area (EEA) residents, data shall be stored and processed within the EU-West (Ireland, eu-west-1) region. Replication for European data is permitted to EU-West (Frankfurt, eu-central-1) only. No European customer data shall be transferred to or processed in non-EU regions without explicit data subject consent in compliance with GDPR requirements. European data handling requirements are cross-referenced in the Data Processing Agreement (CONTRACT-004) and are tracked in PAY-220.

4.3 Data Transfer Restrictions: Cross-region data transfers for analytics or reporting purposes shall use encrypted transit via AWS PrivateLink or VPN connections. No production data shall traverse the public internet between regions.

5. COST MANAGEMENT AND FINANCIAL TERMS

5.1 Monthly Base Cost Cap: The base monthly infrastructure cost shall not exceed $15,000 per month for reserved and on-demand compute, storage, and networking services under normal operating conditions. This cap includes all reserved instances, base storage, and standard networking costs but excludes data transfer overage, auto-scaling bursts, and premium support fees.

5.2 Annual Spend Commitment: The Customer commits to an annual minimum spend of $180,000 across all AWS services covered under this agreement. In exchange, the Customer receives a 12% discount on standard on-demand pricing for EC2 and RDS instances.

5.3 Reserved Instance Terms: The Customer has committed to a 1-year reserved instance plan for the following baseline infrastructure: 4x m6i.xlarge EC2 instances (production application tier), 2x r6g.xlarge RDS instances (production database), and 1x c6g.2xlarge EC2 instance (batch processing). Reserved instance pricing represents an approximate 35% savings over equivalent on-demand pricing. Cost optimization and reserved instance planning are tracked in PAY-198.

5.4 Auto-Scaling Terms: The Customer is authorized to use auto-scaling for compute instances with the following parameters: minimum instance count of 4, maximum instance count of 20, scale-out threshold at 70% average CPU utilization sustained for 5 minutes, scale-in threshold at 30% average CPU utilization sustained for 15 minutes. Auto-scaling costs that cause monthly spend to exceed the $15,000 base cap by more than 50% (i.e., exceeding $22,500 total) shall trigger an automatic notification to the Customer's designated financial contact and the Provider's account team. If monthly costs exceed $30,000 in any month, the Provider shall schedule an architectural review within 5 business days.

6. SECURITY AND COMPLIANCE

6.1 Encryption: All data at rest shall be encrypted using AES-256 encryption via AWS Key Management Service. All data in transit shall be encrypted using TLS 1.2 or higher. The Customer shall retain ownership and control of all encryption keys.

6.2 Compliance Certifications: The Provider shall maintain SOC 1, SOC 2, ISO 27001, ISO 27017, ISO 27018, and PCI DSS Level 1 certifications throughout the term of this agreement. See the PCI Compliance Checklist wiki page for relevant compliance mapping.

6.3 Audit Access: The Provider shall make compliance reports and audit artifacts available through the AWS Artifact portal. The Customer shall have the right to conduct or commission independent security assessments of the services twice per year with 30 days advance notice.

7. TERMINATION

7.1 Either party may terminate this agreement with 90 days written notice. Early termination within the reserved instance commitment period shall require the Customer to pay the remaining reserved instance fees. Data export assistance shall be provided for 60 days following termination at no additional cost.

Authorized Signatures:
Amazon Web Services, Inc.: ___________________________  Date: February 1, 2024
Acme Commerce, Inc.: ___________________________  Date: February 1, 2024`,
  },
  {
    id: "CONTRACT-004",
    title: "Data Processing Agreement",
    vendor: "Acme Commerce, Inc. (Internal Compliance Agreement)",
    effectiveDate: "2024-01-01",
    expirationDate: "2026-12-31",
    keyTerms: [
      "transaction data retention 7 years",
      "PII deletion 30 days after account deletion",
      "right to erasure 14 business days",
      "breach notification 72 hours",
      "EU-US Data Privacy Framework",
      "annual audit rights",
      "data minimization principle",
      "GDPR Article 28 compliance",
      "sub-processor approval required",
      "DPO contact required",
    ],
    content: `DATA PROCESSING AGREEMENT

Agreement Number: DPA-2024-00105
Effective Date: January 1, 2024
Expiration Date: December 31, 2026
Parties: Acme Commerce, Inc. ("Controller") and all authorized sub-processors as listed in Annex B ("Processors")
Governing Regulation: General Data Protection Regulation (EU) 2016/679 ("GDPR"), California Consumer Privacy Act ("CCPA"), and applicable US state privacy laws

1. PURPOSE AND SCOPE

This Data Processing Agreement establishes the terms under which personal data is collected, processed, stored, and deleted across all systems operated by or on behalf of Acme Commerce, Inc. in connection with its e-commerce platform and payment processing operations. This agreement applies to all employees, contractors, and third-party processors who handle personal data on behalf of the Controller. This agreement is binding on all vendors referenced in the Payment Processing Services Agreement (CONTRACT-001), the Delivery Partner Service Agreement (CONTRACT-002), and the Cloud Infrastructure Services Agreement (CONTRACT-003). Privacy compliance implementation is tracked in PAY-220 and PAY-221. All data handling procedures are documented in the Data Privacy and Retention Policy wiki page.

2. DATA RETENTION SCHEDULES

2.1 Transaction Data: All transaction records, including payment authorization logs, settlement records, order details, invoice data, and refund records, shall be retained for a minimum of 7 years from the date of the transaction. This retention period is mandated by PCI DSS requirements, IRS record-keeping obligations (26 CFR 1.6001-1), and the Sarbanes-Oxley Act for financial records. Transaction data shall be stored in encrypted form in the primary data region (US-East-1 for US transactions, EU-West-1 for EEA transactions) as specified in the Cloud Infrastructure Services Agreement (CONTRACT-003). After the 7-year retention period, transaction data shall be securely purged using NIST SP 800-88 compliant methods within 90 days.

2.2 Personally Identifiable Information (PII): PII associated with active customer accounts, including name, email address, phone number, shipping address, and billing address, shall be retained for the duration of the account's active status plus 30 calendar days following account deletion or deactivation. Upon expiration of this 30-day post-deletion period, all PII shall be permanently and irreversibly deleted from all primary databases, backup systems, and derived datasets (including analytics databases and machine learning training data). PII deletion procedures are documented in the Data Privacy and Retention Policy wiki page and the deletion automation is tracked in PAY-235.

2.3 Authentication and Session Data: Passwords (stored as salted bcrypt hashes), session tokens, and authentication logs shall be retained for 90 days following account deletion. Multi-factor authentication recovery codes shall be deleted immediately upon account deletion.

2.4 Analytics and Behavioral Data: Anonymized and aggregated analytics data (page views, click patterns, conversion metrics) may be retained indefinitely provided it cannot be re-identified to individual data subjects. Pseudonymized behavioral data shall be deleted or fully anonymized within 180 days of collection.

3. DATA SUBJECT RIGHTS

3.1 Right to Erasure (Right to Be Forgotten): Upon receipt of a verified erasure request from a data subject, the Controller shall complete the erasure of all personal data related to the requesting individual within 14 business days. This includes data held by all sub-processors listed in Annex B. The 14 business day timeline begins upon successful identity verification of the requesting data subject. Where erasure conflicts with legal retention obligations (e.g., the 7-year transaction data retention in Section 2.1), the data shall be restricted from processing and flagged for deletion upon expiration of the mandatory retention period. The erasure request workflow is documented in the Data Privacy and Retention Policy wiki page and automated through the system described in PAY-235.

3.2 Right to Access: Data subjects may request a complete copy of all personal data held about them. The Controller shall respond to verified access requests within 30 calendar days with a machine-readable export (JSON or CSV format) of all personal data, a description of processing purposes, categories of data, and recipients of disclosures.

3.3 Right to Rectification: Data subjects may request correction of inaccurate personal data. The Controller shall implement corrections within 5 business days and propagate changes to all sub-processors within 10 business days.

3.4 Right to Data Portability: Upon request, the Controller shall provide the data subject's personal data in a structured, commonly used, machine-readable format (JSON) within 30 calendar days.

4. BREACH NOTIFICATION

4.1 Notification Timeline: In the event of a personal data breach, the Controller shall notify the relevant supervisory authority (e.g., the Irish Data Protection Commission for EEA data subjects) within 72 hours of becoming aware of the breach, as required by GDPR Article 33. Sub-processors shall notify the Controller of any suspected breach within 24 hours of detection.

4.2 Data Subject Notification: If the breach is likely to result in a high risk to the rights and freedoms of affected data subjects, the Controller shall notify affected individuals without undue delay, and in no event later than 7 calendar days following confirmation of the breach. Notification shall include: (a) the nature of the breach; (b) the categories and approximate number of data subjects affected; (c) the likely consequences; (d) the measures taken or proposed to address the breach. Breach notification procedures and escalation protocols are documented in the Incident Response Playbook wiki page and the Security Incident Response wiki page.

4.3 Breach Register: The Controller shall maintain a comprehensive breach register documenting all personal data breaches, regardless of whether notification to supervisory authorities or data subjects was required. The register shall include the facts of the breach, its effects, and remedial action taken.

5. INTERNATIONAL DATA TRANSFERS

5.1 EU-US Data Transfer Framework: All transfers of personal data from the European Economic Area to the United States shall be conducted under the EU-US Data Privacy Framework (DPF), for which the Controller has obtained certification. The Controller shall maintain its DPF certification throughout the term of this agreement and shall recertify annually. Transfer mechanisms are documented in PAY-220.

5.2 Standard Contractual Clauses: As a supplementary safeguard, Standard Contractual Clauses (SCCs) as approved by the European Commission (Decision 2021/914) are incorporated into this agreement by reference and are attached as Annex A. SCCs shall serve as the fallback transfer mechanism in the event that the DPF adequacy decision is invalidated.

5.3 Transfer Impact Assessment: The Controller has conducted and shall maintain an up-to-date Transfer Impact Assessment evaluating the legal framework of the United States with respect to government access to personal data. The assessment shall be reviewed and updated annually or upon any material change in applicable law.

5.4 Data Localization: Notwithstanding the above transfer mechanisms, the Controller shall maintain the capability to process and store all EEA data subjects' personal data exclusively within the EU-West (Ireland) and EU-Central (Frankfurt) regions, as specified in the Cloud Infrastructure Services Agreement (CONTRACT-003), Section 4.2.

6. SUB-PROCESSOR MANAGEMENT

6.1 Approved Sub-Processors: The Controller shall maintain a current list of approved sub-processors in Annex B. As of the effective date, approved sub-processors include: Stripe, Inc. (payment processing, per CONTRACT-001), FastShip Logistics, LLC (delivery services, per CONTRACT-002), Amazon Web Services, Inc. (cloud infrastructure, per CONTRACT-003), and SendGrid (transactional email communications).

6.2 Sub-Processor Approval: The Controller shall notify all relevant data subjects and the designated Data Protection Officer (DPO) at least 30 calendar days before engaging a new sub-processor. Any objection from the DPO must be resolved before the sub-processor is engaged. Sub-processor onboarding procedures are described in the Vendor Onboarding Checklist wiki page.

7. AUDIT RIGHTS

7.1 Annual Audit: The Controller, or an independent third-party auditor appointed by the Controller, shall have the right to conduct one comprehensive audit per calendar year of each sub-processor's data processing activities, security measures, and compliance with this agreement. Audits shall be conducted with 30 days advance notice and shall not unreasonably interfere with the sub-processor's business operations.

7.2 Audit Scope: Annual audits shall cover: (a) data processing activities and their lawful basis; (b) technical and organizational security measures; (c) data retention and deletion practices; (d) sub-processor management; (e) breach incident response capabilities; (f) cross-border transfer mechanisms. Audit findings and remediation plans shall be documented and tracked in the Compliance Audit Tracker wiki page and related findings are managed in PAY-240.

7.3 Regulatory Audits: Sub-processors shall cooperate fully with any audit or investigation conducted by a supervisory authority. The Controller shall be notified within 48 hours if a sub-processor receives a direct inquiry or audit request from any supervisory authority regarding data processed under this agreement.

8. DATA PROTECTION OFFICER

8.1 The Controller has appointed a Data Protection Officer (DPO) in accordance with GDPR Article 37. The DPO shall be the primary point of contact for all data protection matters, data subject requests, supervisory authority communications, and internal compliance oversight. The DPO's contact information shall be published on the Controller's website and provided to all sub-processors.

9. TERMINATION AND DATA RETURN

9.1 Upon termination of this agreement or any sub-processor agreement, the sub-processor shall, at the Controller's election, return all personal data in a structured, machine-readable format or securely delete all personal data within 30 calendar days. Certification of deletion shall be provided in writing.

Authorized Signatures:
Acme Commerce, Inc. (Controller): ___________________________  Date: January 1, 2024
Data Protection Officer: ___________________________  Date: January 1, 2024`,
  },
];
