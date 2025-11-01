import { query } from '@/lib/db';
import type { Webhook } from '@/types/webhook';

interface WebhookRow {
  id: number;
  url: string;
  event: string;
  secret: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

function mapWebhookRow(row: WebhookRow): Webhook {
  return {
    id: row.id,
    url: row.url,
    event: row.event as any,
    secret: row.secret,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Initialize webhooks table
 */
export async function initWebhooksTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL,
      event VARCHAR(50) NOT NULL,
      secret TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_webhooks_event ON webhooks(event) WHERE active = true;
  `);
}

/**
 * Get all webhooks
 */
export async function getAllWebhooks(): Promise<Webhook[]> {
  const result = await query<WebhookRow>('SELECT * FROM webhooks ORDER BY created_at DESC');
  return result.rows.map(mapWebhookRow);
}

/**
 * Get webhooks by event type
 */
export async function getWebhooksByEvent(event: string): Promise<Webhook[]> {
  const result = await query<WebhookRow>(
    'SELECT * FROM webhooks WHERE event = $1 AND active = true',
    [event]
  );
  return result.rows.map(mapWebhookRow);
}

/**
 * Get webhook by ID
 */
export async function getWebhookById(id: number): Promise<Webhook | null> {
  const result = await query<WebhookRow>('SELECT * FROM webhooks WHERE id = $1', [id]);
  return result.rows.length > 0 ? mapWebhookRow(result.rows[0]) : null;
}

/**
 * Create a new webhook
 */
export async function createWebhook(
  url: string,
  event: string,
  secret: string | null = null
): Promise<Webhook> {
  const result = await query<WebhookRow>(
    `INSERT INTO webhooks (url, event, secret)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [url, event, secret]
  );
  return mapWebhookRow(result.rows[0]);
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(id: number): Promise<boolean> {
  const result = await query('DELETE FROM webhooks WHERE id = $1 RETURNING *', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Update webhook active status
 */
export async function updateWebhookStatus(id: number, active: boolean): Promise<Webhook | null> {
  const result = await query<WebhookRow>(
    `UPDATE webhooks 
     SET active = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING *`,
    [active, id]
  );
  return result.rows.length > 0 ? mapWebhookRow(result.rows[0]) : null;
}

