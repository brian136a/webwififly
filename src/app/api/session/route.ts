import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sessionSchema } from '@/lib/validation';
import { runAsync, getAsync } from '@/db/client';

export async function POST(req: NextRequest) {
  try {
    const sessionId = uuidv4();
    const createdAt = Date.now();

    // Insert new session
    await runAsync('INSERT INTO sessions (id, created_at) VALUES (?, ?)', [
      sessionId,
      createdAt,
    ]);

    // Validate response structure
    const responseData = {
      sessionId,
      createdAt,
    };
    sessionSchema.parse(responseData);

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('POST /api/session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = await getAsync(
      'SELECT * FROM sessions WHERE id = ?',
      [sessionId]
    );

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('GET /api/session error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
