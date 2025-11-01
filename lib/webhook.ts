import crypto from 'crypto';
import type { WebhookPayload } from '@/types/webhook';

/**
 * Trigger webhooks for a specific event
 */
export async function triggerWebhooks(
  event: string,
  payload: WebhookPayload
): Promise<void> {
  try {
    // Get all active webhooks for this event
    const { getWebhooksByEvent } = await import('@/lib/webhook-db');
    const webhooks = await getWebhooksByEvent(event);

    if (webhooks.length === 0) {
      console.log(`No webhooks registered for event: ${event}`);
      return;
    }

    // Send webhook requests in parallel
    const promises = webhooks.map(webhook => 
      sendWebhook(webhook.url, payload, webhook.secret)
    );

    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Error triggering webhooks:', error);
    // Don't throw - webhooks should not block the main operation
  }
}

/**
 * Send a webhook HTTP request
 */
async function sendWebhook(
  url: string,
  payload: WebhookPayload,
  secret: string | null
): Promise<void> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Expense-Tracker-Webhook/1.0',
    };

    // Add HMAC signature if secret is provided
    if (secret) {
      const signature = generateSignature(JSON.stringify(payload), secret);
      headers['X-Webhook-Signature'] = signature;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      // Timeout after 5 seconds
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`Webhook failed: ${url} - Status: ${response.status}`);
    } else {
      console.log(`Webhook sent successfully: ${url}`);
    }
  } catch (error) {
    console.error(`Webhook error for ${url}:`, error);
    // Continue execution even if webhook fails
  }
}

/**
 * Generate HMAC-SHA256 signature for webhook verification
 */
export function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Verify webhook signature
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  
  // Ensure both buffers have the same length for timingSafeEqual
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

