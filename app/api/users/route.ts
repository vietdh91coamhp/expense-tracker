import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { CreateUserRequest, UserListResponse, User } from '@/types/api';

interface UserRow {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    let queryText = 'SELECT * FROM users WHERE 1=1';
    const params: string[] = [];

    if (email) {
      queryText += ' AND email = $1';
      params.push(email);
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query<UserRow>(queryText, params);

    const response: UserListResponse = {
      users: result.rows.map(mapUserRow),
      count: result.rowCount ?? 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if content type is JSON
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body: CreateUserRequest = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const result = await query<UserRow>(
      `INSERT INTO users (name, email) 
       VALUES ($1, $2) 
       RETURNING *`,
      [name, email]
    );

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: mapUserRow(result.rows[0]),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

