import { NextRequest, NextResponse } from 'next/server';
import { getWebhookById, deleteWebhook, updateWebhookStatus } from '@/lib/webhook-db';

interface RouteParams {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const webhook = await getWebhookById(parseInt(params.id));

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error('Error fetching webhook:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const deleted = await deleteWebhook(parseInt(params.id));

    if (!deleted) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json();
    const { active } = body;

    if (typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid field: active (must be boolean)' },
        { status: 400 }
      );
    }

    const webhook = await updateWebhookStatus(parseInt(params.id), active);

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Webhook updated successfully',
      webhook,
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json(
      {
        error: 'Failed to update webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

