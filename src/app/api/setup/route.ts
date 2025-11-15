import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { setupSchema } from '@/lib/validation';
import { runAsync } from '@/db/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, isp, planDownloadMbps, monthlyCostNzd } = body;

    // Validate input
    const validatedData = setupSchema.parse({
      sessionId,
      isp,
      planDownloadMbps,
      monthlyCostNzd,
    });

    const id = uuidv4();
    const createdAt = Date.now();

    // Insert setup record
    await runAsync(
      `INSERT INTO setups (id, session_id, isp, plan_download_mbps, monthly_cost_nzd, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, validatedData.sessionId, validatedData.isp, validatedData.planDownloadMbps, validatedData.monthlyCostNzd, createdAt]
    );

    return NextResponse.json(
      {
        id,
        ...validatedData,
        createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create setup record' },
      { status: 400 }
    );
  }
}
