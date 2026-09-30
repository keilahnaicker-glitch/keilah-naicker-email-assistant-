import { EmailMessage } from '../types';

export const MOCK_EMAILS: EmailMessage[] = [
  {
    id: 'msg-urgent-001',
    threadId: 'thread-001',
    sender: 'AWS CloudWatch Alerts <alerts@monitoring.internal>',
    senderEmail: 'alerts@monitoring.internal',
    subject: 'CRITICAL: Production DB Latency Spike > 4500ms - Region US-East-1',
    date: '2026-08-06T06:45:00Z',
    snippet: 'AWS CloudWatch Alert: Production Aurora PostgreSQL database instance db-prod-primary high CPU (98%) and response time spike...',
    body: `System Alert Notification
Priority: CRITICAL
Service: Aurora PostgreSQL DB (db-prod-primary)
Event: High CPU Utilization (98%) & Connection Pool Exhaustion.
Impact: API gateway response latency exceeded SLA (>4500ms).
Action Required: Urgent investigation required by Infrastructure On-Call. High system outage risk.`,
    isUnread: true,
    isSample: true,
  },
  {
    id: 'msg-urgent-002',
    threadId: 'thread-002',
    sender: 'Sarah Chen <s.chen@acmecorp.com>',
    senderEmail: 's.chen@acmecorp.com',
    subject: 'URGENT BUG: Payment Gateway Callback Failing for Enterprise Checkout',
    date: '2026-08-06T06:30:00Z',
    snippet: 'Hi Engineering team, our enterprise clients are encountering HTTP 502 Bad Gateway error when completing checkout via Stripe webhooks...',
    body: `Hi Engineering Team,

We are receiving multiple escalated support tickets from tier-1 enterprise clients.
During checkout, the Stripe webhook handler is throwing HTTP 502 errors, preventing transaction confirmation and order generation.

Steps to reproduce:
1. Select Enterprise Annual Plan
2. Submit valid payment
3. Redirect fails at /api/webhooks/stripe with 502 timeout.

This is actively blocking deal renewals today. Could someone review immediately?

Best regards,
Sarah Chen
Director of Customer Operations, Acme Corp`,
    isUnread: true,
    isSample: true,
  },
  {
    id: 'msg-urgent-003',
    threadId: 'thread-003',
    sender: 'Marcus Vance <mvance@nexuslogistics.com>',
    senderEmail: 'mvance@nexuslogistics.com',
    subject: 'Escalation: Requesting Immediate Account Provisioning & API Key Reset',
    date: '2026-08-06T06:12:00Z',
    snippet: 'Hello, our integration team was locked out following the security update this morning. We need our API credentials restored urgently...',
    body: `Hello Keilah,

Following the platform security patch deployed early this morning, our entire dispatch automation system lost connectivity due to an invalid token response.

Our warehouse trucks are currently halted because route manifests cannot be generated. We urgently need assistance restoring API access or issuing an emergency key for account #NX-88402.

Please advise on ETA as soon as possible.

Thanks,
Marcus Vance
Nexus Logistics Ltd`,
    isUnread: true,
    isSample: true,
  },
  {
    id: 'msg-normal-004',
    threadId: 'thread-004',
    sender: 'Tech Weekly Digest <newsletter@techradar.com>',
    senderEmail: 'newsletter@techradar.com',
    subject: 'Top AI Development Frameworks in 2026 - Weekly Briefing',
    date: '2026-08-06T05:00:00Z',
    snippet: 'Explore the top agentic workflows, LLM orchestration platforms, and developer tooling trends this week...',
    body: `Welcome to the weekly TechRadar Digest!
Here are this week's top stories in AI engineering:
- How Google Antigravity 2.0 simplifies agentic desktop automation.
- Comparing modern LLM client SDKs.
- Best practices for serverless containers in Cloud Run.`,
    isUnread: true,
    isSample: true,
  },
  {
    id: 'msg-normal-005',
    threadId: 'thread-005',
    sender: 'Google Cloud Billing <no-reply@cloud.google.com>',
    senderEmail: 'no-reply@cloud.google.com',
    subject: 'Your Monthly GCP Billing Statement for July is Available',
    date: '2026-08-06T04:15:00Z',
    snippet: 'Your invoice for account 01B2C3-456789-DEF012 is ready for viewing in the Google Cloud Console...',
    body: `Dear Keilah,
Your Google Cloud invoice for the period July 1 - July 31 is now available online.
Total charges: $0.00 (within free tier usage).
You can review detailed itemized charges in the GCP Console.`,
    isUnread: true,
    isSample: true,
  }
];
