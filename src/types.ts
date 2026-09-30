export type UrgencyType = 'CRITICAL_SYSTEM' | 'HIGH_BUG' | 'ACTIVE_CUSTOMER' | 'LOW';

export interface EmailMessage {
  id: string;
  threadId: string;
  sender: string;
  senderEmail: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  isUnread: boolean;
  isSample?: boolean;
}

export interface EmailClassification {
  emailId: string;
  subject: string;
  sender: string;
  senderEmail: string;
  urgency: UrgencyType;
  urgencyLabel: string;
  summary: string;
  reason: string;
  suggestedSubject: string;
  proposedReply: string;
  draftId?: string;
  draftCreated?: boolean;
}

export interface AgentThought {
  id: string;
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'waiting_approval' | 'completed' | 'failed';
  timestamp: string;
  toolCall?: {
    name: string;
    params: Record<string, any>;
  };
  details?: string;
}

export interface WorkspaceUser {
  email: string;
  displayName: string;
  photoURL?: string;
}

export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6;
