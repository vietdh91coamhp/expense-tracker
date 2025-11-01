import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ExpenseListResponse, Expense } from '@/types/api';

interface RouteParams {
  params: { userId: string };
}

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

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = params;
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Verify user exists
    const userCheck = await query<UserRow>('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rowCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let queryText = 'SELECT * FROM expenses WHERE user_id = $1';
    const queryParams: (string | number)[] = [parseInt(userId)];
    let paramCount = 2;

    if (category) {
      queryText += ` AND category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    if (startDate) {
      queryText += ` AND date >= $${paramCount}`;
      queryParams.push(startDate);
      paramCount++;
    }

    if (endDate) {
      queryText += ` AND date <= $${paramCount}`;
      queryParams.push(endDate);
      paramCount++;
    }

    queryText += ' ORDER BY date DESC, created_at DESC';

    const result = await query<ExpenseRow>(queryText, queryParams);

    const response: ExpenseListResponse = {
      userId: parseInt(userId),
      expenses: result.rows.map(mapExpenseRow),
      count: result.rowCount ?? 0,
    };

    return NextResponse.json(response);
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
