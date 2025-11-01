import { NextRequest, NextResponse } from 'next/server';
import { getAllWebhooks, createWebhook } from '@/lib/webhook-db';
import type { CreateWebhookRequest, WebhookListResponse } from '@/types/webhook';

export async function GET() {
  try {
    const webhooks = await getAllWebhooks();

    const response: WebhookListResponse = {
      webhooks,
      count: webhooks.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch webhooks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body: CreateWebhookRequest = await request.json();
    const { url, event, secret } = body;

    // Validate required fields
    if (!url || !event) {
      return NextResponse.json(
        { error: 'Missing required fields: url, event' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate event type
    const validEvents = ['expense.created'];
    if (!validEvents.includes(event)) {
      return NextResponse.json(
        { error: `Invalid event type. Must be one of: ${validEvents.join(', ')}` },
        { status: 400 }
      );
    }

    const webhook = await createWebhook(url, event, secret || null);

    return NextResponse.json(
      {
        message: 'Webhook registered successfully',
        webhook,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating webhook:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

