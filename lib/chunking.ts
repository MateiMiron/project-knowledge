export interface Chunk {
  text: string;
  index: number;
}

const MAX_CHUNK_SIZE = 800;
const OVERLAP = 200;

export function chunkText(text: string): Chunk[] {
  const cleaned = text.replace(/\n{3,}/g, "\n\n").trim();

  if (cleaned.length <= MAX_CHUNK_SIZE) {
    return [{ text: cleaned, index: 0 }];
  }

  const chunks: Chunk[] = [];
  const paragraphs = cleaned.split(/\n\n+/);
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    if (
      currentChunk.length + paragraph.length + 2 > MAX_CHUNK_SIZE &&
      currentChunk.length > 0
    ) {
      chunks.push({ text: currentChunk.trim(), index: chunkIndex++ });

      // Keep overlap from end of current chunk
      const words = currentChunk.split(/\s+/);
      const overlapWords: string[] = [];
      let overlapLen = 0;
      for (let i = words.length - 1; i >= 0 && overlapLen < OVERLAP; i--) {
        overlapWords.unshift(words[i]);
        overlapLen += words[i].length + 1;
      }
      currentChunk = overlapWords.join(" ") + "\n\n" + paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({ text: currentChunk.trim(), index: chunkIndex });
  }

  return chunks;
}

export function formatJiraForEmbedding(ticket: {
  id: string;
  type: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  description: string;
  comments: Array<{ author: string; text: string; date: string }>;
}): string {
  const parts = [
    `[Jira ${ticket.type.toUpperCase()}] ${ticket.id}: ${ticket.title}`,
    `Status: ${ticket.status} | Priority: ${ticket.priority} | Assignee: ${ticket.assignee}`,
    "",
    ticket.description,
  ];

  if (ticket.comments.length > 0) {
    parts.push("", "--- Comments ---");
    for (const comment of ticket.comments) {
      parts.push(`${comment.author} (${comment.date}): ${comment.text}`);
    }
  }

  return parts.join("\n");
}

export function formatWikiForEmbedding(page: {
  title: string;
  content: string;
  category: string;
  author: string;
}): string {
  return `[Wiki - ${page.category}] ${page.title}\nAuthor: ${page.author}\n\n${page.content}`;
}

export function formatContractForEmbedding(contract: {
  title: string;
  vendor: string;
  content: string;
  effectiveDate: string;
}): string {
  return `[Contract] ${contract.title}\nVendor: ${contract.vendor} | Effective: ${contract.effectiveDate}\n\n${contract.content}`;
}

export function formatSlackForEmbedding(thread: {
  channel: string;
  topic: string;
  messages: Array<{ user: string; text: string; timestamp: string }>;
}): string {
  const msgs = thread.messages
    .map((m) => `${m.user}: ${m.text}`)
    .join("\n");
  return `[Slack - ${thread.channel}] ${thread.topic}\n\n${msgs}`;
}

export function formatEmailForEmbedding(email: {
  id: string;
  subject: string;
  from: string;
  to: string[];
  date: string;
  body: string;
}): string {
  return `[Email] ${email.id}: ${email.subject}\nFrom: ${email.from} | To: ${email.to.join(", ")} | Date: ${email.date}\n\n${email.body}`;
}

export function formatMeetingForEmbedding(meeting: {
  id: string;
  title: string;
  date: string;
  attendees: string[];
  type: string;
  notes: string;
}): string {
  return `[Meeting Notes - ${meeting.type}] ${meeting.id}: ${meeting.title}\nDate: ${meeting.date} | Attendees: ${meeting.attendees.join(", ")}\n\n${meeting.notes}`;
}

export function formatPostmortemForEmbedding(postmortem: {
  id: string;
  title: string;
  severity: string;
  incidentDate: string;
  duration: string;
  content: string;
}): string {
  return `[Postmortem - ${postmortem.severity}] ${postmortem.id}: ${postmortem.title}\nDate: ${postmortem.incidentDate} | Duration: ${postmortem.duration}\n\n${postmortem.content}`;
}

export function formatSupportTicketForEmbedding(ticket: {
  id: string;
  subject: string;
  customer: string;
  priority: string;
  status: string;
  category: string;
  messages: Array<{ from: string; role: string; content: string }>;
}): string {
  const msgs = ticket.messages
    .map((m) => `${m.from} (${m.role}): ${m.content}`)
    .join("\n\n");
  return `[Support Ticket - ${ticket.category}] ${ticket.id}: ${ticket.subject}\nCustomer: ${ticket.customer} | Priority: ${ticket.priority} | Status: ${ticket.status}\n\n${msgs}`;
}

export function formatApiTestForEmbedding(test: {
  id: string;
  suite: string;
  endpoint: string;
  method: string;
  status: string;
  coverage: string;
  tests: Array<{ name: string; status: string; duration: string; description: string }>;
  notes: string;
}): string {
  const testLines = test.tests
    .map((t) => `[${t.status.toUpperCase()}] ${t.name} (${t.duration})\n${t.description}`)
    .join("\n\n");
  return `[API Test Suite - ${test.status.toUpperCase()}] ${test.id}: ${test.suite}\nEndpoint: ${test.method} ${test.endpoint} | Coverage: ${test.coverage}\n\n${testLines}\n\nNotes: ${test.notes}`;
}

export function formatE2eScenarioForEmbedding(scenario: {
  id: string;
  title: string;
  flow: string;
  priority: string;
  status: string;
  duration: string;
  steps: Array<{ step: number; action: string; expected: string; status: string }>;
  notes: string;
}): string {
  const stepLines = scenario.steps
    .map((s) => `Step ${s.step} [${s.status.toUpperCase()}]: ${s.action}\nExpected: ${s.expected}`)
    .join("\n\n");
  return `[E2E Scenario - ${scenario.priority.toUpperCase()}] ${scenario.id}: ${scenario.title}\nFlow: ${scenario.flow} | Status: ${scenario.status} | Duration: ${scenario.duration}\n\n${stepLines}\n\nNotes: ${scenario.notes}`;
}
