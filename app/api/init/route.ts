import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { initWebhooksTable } from '@/lib/webhook-db';

async function initDatabase() {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Create expenses table
    await query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
    `);

    // Create webhooks table
    await initWebhooksTable();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function POST() {
  try {
    await initDatabase();
    
    return NextResponse.json({
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    return NextResponse.json(
      {
        error: 'Database initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

