import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ping
 * Returns minimal response for accurate latency measurement
 * Uses timestamp for precise round-trip calculation
 */
export async function GET(req: NextRequest) {
  try {
    // Get client timestamp from query param for more accurate measurement
    const clientTimestamp = req.nextUrl.searchParams.get('t');
    const serverTimestamp = Date.now();

    return new NextResponse(
      JSON.stringify({
        ok: true,
        serverTimestamp,
        clientTimestamp: clientTimestamp || null,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Connection': 'keep-alive',
          // Minimize response size for accuracy
        },
      }
    );
  } catch (error) {
    console.error('[ping] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Ping failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ping
 * Accepts ping data for upload latency measurement
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const serverTimestamp = Date.now();

    return NextResponse.json(
      {
        ok: true,
        serverTimestamp,
        clientTimestamp: body.clientTimestamp || null,
        receivedAt: serverTimestamp,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Connection': 'keep-alive',
        },
      }
    );
  } catch (error) {
    console.error('[ping POST] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Ping failed' },
      { status: 500 }
    );
  }
}