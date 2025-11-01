import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // Drop tables in correct order (expenses first due to foreign key)
    await query('DROP TABLE IF EXISTS webhooks CASCADE');
    await query('DROP TABLE IF EXISTS expenses CASCADE');
    await query('DROP TABLE IF EXISTS users CASCADE');
    
    return NextResponse.json({
      message: 'Database tables dropped successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database reset failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to drop database tables',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

