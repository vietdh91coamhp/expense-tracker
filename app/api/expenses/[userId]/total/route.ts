import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ExpenseTotalResponse, CategoryTotal } from '@/types/api';

interface RouteParams {
  params: { userId: string };
}

interface CategoryRow {
  category: string;
  count: string;
  total: string;
  average: string;
  min_amount: string;
  max_amount: string;
}

interface UserRow {
  id: number;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = params;
    const searchParams = request.nextUrl.searchParams;
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

    let queryText = `
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total,
        AVG(amount) as average,
        MIN(amount) as min_amount,
        MAX(amount) as max_amount
      FROM expenses 
      WHERE user_id = $1
    `;
    const queryParams: (string | number)[] = [parseInt(userId)];
    let paramCount = 2;

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

    queryText += ' GROUP BY category ORDER BY total DESC';

    const result = await query<CategoryRow>(queryText, queryParams);

    // Calculate grand total
    const grandTotal = result.rows.reduce((sum, row) => sum + parseFloat(row.total), 0);
    const totalCount = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);

    const byCategory: CategoryTotal[] = result.rows.map(row => ({
      category: row.category,
      count: parseInt(row.count),
      total: parseFloat(row.total),
      average: parseFloat(row.average),
      minAmount: parseFloat(row.min_amount),
      maxAmount: parseFloat(row.max_amount),
      percentage: grandTotal > 0 ? ((parseFloat(row.total) / grandTotal) * 100).toFixed(2) : '0.00',
    }));

    const response: ExpenseTotalResponse = {
      userId: parseInt(userId),
      totalExpenses: grandTotal,
      totalTransactions: totalCount,
      byCategory,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calculating total expenses:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate total expenses',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
