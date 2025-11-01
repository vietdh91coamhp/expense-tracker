import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { MonthlySpendingResponse, MonthlyBreakdown, MonthlyCategory } from '@/types/api';

interface RouteParams {
  params: { userId: string };
}

interface MonthlyRow {
  month: string;
  year: string;
  month_number: string;
  category: string;
  count: string;
  total: string;
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
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Verify user exists
    const userCheck = await query<UserRow>('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rowCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build query for monthly spending
    let queryText = `
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        TO_CHAR(date, 'YYYY') as year,
        TO_CHAR(date, 'MM') as month_number,
        category,
        COUNT(*) as count,
        SUM(amount) as total
      FROM expenses 
      WHERE user_id = $1 AND date IS NOT NULL
    `;
    const queryParams: (string | number)[] = [parseInt(userId)];
    let paramCount = 2;

    if (year) {
      queryText += ` AND TO_CHAR(date, 'YYYY') = $${paramCount}`;
      queryParams.push(year);
      paramCount++;
    }

    if (month) {
      queryText += ` AND TO_CHAR(date, 'MM') = $${paramCount}`;
      queryParams.push(month.padStart(2, '0'));
      paramCount++;
    }

    queryText += ' GROUP BY month, year, month_number, category ORDER BY month DESC, total DESC';

    const result = await query<MonthlyRow>(queryText, queryParams);

    // Group by month
    const monthlyData = new Map<string, MonthlyBreakdown>();
    
    result.rows.forEach(row => {
      const monthKey = row.month;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          year: row.year,
          monthNumber: row.month_number,
          total: 0,
          count: 0,
          categories: [],
        });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      const total = parseFloat(row.total);
      const count = parseInt(row.count);
      
      monthData.total += total;
      monthData.count += count;
      
      const categoryData: MonthlyCategory = {
        category: row.category,
        total,
        count,
      };
      
      monthData.categories.push(categoryData);
    });


    const monthlySummary = Array.from(monthlyData.values()).sort((a, b) => 
      b.month.localeCompare(a.month)
    );

    // Calculate grand total across all months
    const grandTotal = monthlySummary.reduce((sum, month) => sum + month.total, 0);
    const totalTransactions = monthlySummary.reduce((sum, month) => sum + month.count, 0);

    const response: MonthlySpendingResponse = {
      userId: parseInt(userId),
      totalExpenses: grandTotal,
      totalTransactions,
      monthlyBreakdown: monthlySummary,
      filters: {
        year: year || 'all',
        month: month || 'all',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calculating monthly spending:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate monthly spending',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
