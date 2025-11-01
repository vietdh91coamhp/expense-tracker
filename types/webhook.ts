// Webhook types
export interface Webhook {
  id: number;
  url: string;
  event: WebhookEvent;
  secret: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type WebhookEvent = 'expense.created';

export interface CreateWebhookRequest {
  url: string;
  event: WebhookEvent;
  secret?: string;
}

export interface WebhookListResponse {
  webhooks: Webhook[];
  count: number;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: {
    expense: {
      id: number;
      userId: number;
      amount: number;
      category: string;
      description: string | null;
      date: Date | null;
      createdAt: Date;
      updatedAt: Date;
    };
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
}

