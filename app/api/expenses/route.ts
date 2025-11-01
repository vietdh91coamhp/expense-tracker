import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { CreateExpenseRequest, Expense } from '@/types/api';
import { triggerWebhooks } from '@/lib/webhook';
import type { WebhookPayload } from '@/types/webhook';

interface ExpenseRow {
  id: number;
  user_id: number;
  amount: number;
  category: string;
  description: string | null;
  date: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface UserRow {
  id: number;
  name: string;
  email: string;
}

function mapExpenseRow(row: ExpenseRow): Expense {
  return {
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    category: row.category,
    description: row.description,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let queryText = 'SELECT * FROM expenses WHERE 1=1';
    const params: (string | number)[] = [];
    let paramCount = 1;

    if (userId) {
      queryText += ` AND user_id = $${paramCount}`;
      params.push(parseInt(userId));
      paramCount++;
    }

    if (category) {
      queryText += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (startDate) {
      queryText += ` AND date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      queryText += ` AND date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    queryText += ' ORDER BY date DESC, created_at DESC';

    const result = await query<ExpenseRow>(queryText, params);

    return NextResponse.json({
      expenses: result.rows.map(mapExpenseRow),
      count: result.rowCount ?? 0,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch expenses',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if content-type is JSON
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body: CreateExpenseRequest = await request.json();
    const { userId, amount, category, description, date } = body;

    if (!userId || !amount || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount, category' },
        { status: 400 }
      );
    }

    // Verify user exists and get user details
    const userCheck = await query<UserRow>('SELECT id, name, email FROM users WHERE id = $1', [userId]);
    if (userCheck.rowCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userCheck.rows[0];

    const result = await query<ExpenseRow>(
      `INSERT INTO expenses (user_id, amount, category, description, date) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, amount, category, description ?? null, date ?? null]
    );

    const expense = mapExpenseRow(result.rows[0]);

    // Trigger webhooks async
    const webhookPayload: WebhookPayload = {
      event: 'expense.created',
      timestamp: new Date().toISOString(),
      data: {
        expense: {
          id: expense.id,
          userId: expense.userId,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: expense.date,
          createdAt: expense.createdAt,
          updatedAt: expense.updatedAt,
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    };

    triggerWebhooks('expense.created', webhookPayload).catch(err => {
      console.error('Webhook trigger error:', err);
    });

    return NextResponse.json(
      {
        message: 'Expense created successfully',
        expense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expense:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Failed to create expense',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

