import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE_BYTES || '1048576', 10);

// Generate pseudo-random chunk data for download tests
function generateChunk(size: number): Buffer {
  // Use a deterministic but non-compressible pattern
  const chunk = Buffer.alloc(size);
  for (let i = 0; i < size; i++) {
    chunk[i] = Math.floor(Math.random() * 256);
  }
  return chunk;
}

/**
 * GET /api/speedtest/chunk
 * Returns a chunk of random data for download speed testing
 * Supports Range requests for resumable downloads
 */
export async function GET(req: NextRequest) {
  try {
    const size = parseInt(req.nextUrl.searchParams.get('size') || String(CHUNK_SIZE), 10);
    const rangeHeader = req.headers.get('range');

    // Validate size
    if (size <= 0 || size > 100 * 1024 * 1024) {
      // Max 100 MB per request
      return NextResponse.json(
        { ok: false, error: 'Invalid chunk size' },
        { status: 400 }
      );
    }

    const chunk = generateChunk(size);

    // Handle range requests
    if (rangeHeader) {
      const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : size - 1;

        if (start >= size || start > end) {
          return new NextResponse(null, { status: 416 });
        }

        const slicedChunk = chunk.slice(start, end + 1);
        return new NextResponse(slicedChunk, {
          status: 206,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': String(slicedChunk.length),
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'no-cache',
          },
        });
      }
    }

    return new NextResponse(chunk, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(chunk.length),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[speedtest/chunk GET] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to generate chunk' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/speedtest/chunk
 * Accepts uploaded chunk data for upload speed testing
 */
export async function POST(req: NextRequest) {
  try {
    const contentLength = req.headers.get('content-length');

    if (!contentLength) {
      return NextResponse.json(
        { ok: false, error: 'Content-Length header required' },
        { status: 400 }
      );
    }

    const bytes = parseInt(contentLength, 10);

    // Consume the request body (don't actually store it for speed tests)
    const buffer = await req.arrayBuffer();

    if (buffer.byteLength !== bytes) {
      console.warn(
        `[speedtest/chunk POST] Bytes mismatch: expected ${bytes}, got ${buffer.byteLength}`
      );
    }

    return NextResponse.json(
      {
        ok: true,
        bytesReceived: buffer.byteLength,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[speedtest/chunk POST] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to receive chunk' },
      { status: 500 }
    );
  }
}
