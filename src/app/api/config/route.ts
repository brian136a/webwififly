import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    anomalySpeedThreshold: 0.5, // 50% deviation threshold
    version: '1.0.0',
  });
}
