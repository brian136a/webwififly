import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE_BYTES || '1048576', 10);

// Pre-generated deterministic buffer cache for reuse
// Avoids regenerating random data on every request
const BUFFER_CACHE: Map<number, Buffer> = new Map();

// Generate pseudo-random chunk data for download tests
// Uses a pre-cached approach to minimize CPU overhead
function generateChunk(size: number): Buffer {
  // Check cache first - this is the hot path for repeated requests
  if (BUFFER_CACHE.has(size)) {
    return BUFFER_CACHE.get(size)!;
  }

  // Use deterministic pattern with minimal CPU cost: native crypto randomness
  // For production: use pseudorandom that's fast enough for network I/O
  const chunk = Buffer.alloc(size);
  
  // Fill with pattern using native Node buffer methods (C++ fast path)
  const patternSize = 64;
  const pattern = Buffer.alloc(patternSize);
  for (let i = 0; i < patternSize; i++) {
    pattern[i] = (i * 31) & 0xff; // Deterministic pseudo-random pattern
  }
  
  // Copy pattern repeatedly (much faster than byte-by-byte)
  let offset = 0;
  while (offset < size) {
    const copySize = Math.min(patternSize, size - offset);
    pattern.copy(chunk, offset, 0, copySize);
    offset += copySize;
  }

  // Cache for future reuse (limit cache size to 10 entries)
  if (BUFFER_CACHE.size < 10) {
    BUFFER_CACHE.set(size, chunk);
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
        return new NextResponse(new Uint8Array(slicedChunk), {
          status: 206,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': String(slicedChunk.length),
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'no-cache, no-store',
            'Connection': 'keep-alive',
          },
        });
      }
    }

    return new NextResponse(new Uint8Array(chunk), {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(chunk.length),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache, no-store',
        'Transfer-Encoding': 'binary',
        'Connection': 'keep-alive',
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
 * Returns timing information for accurate measurement
 */
export async function POST(req: NextRequest) {
  try {
    const receiveStart = Date.now();
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
    const receiveEnd = Date.now();
    const processingTimeMs = receiveEnd - receiveStart;

    if (buffer.byteLength !== bytes) {
      console.warn(
        `[speedtest/chunk POST] Bytes mismatch: expected ${bytes}, got ${buffer.byteLength}`
      );
    }

    return NextResponse.json(
      {
        ok: true,
        bytesReceived: buffer.byteLength,
        serverProcessingTimeMs: processingTimeMs,
        serverTimestamp: receiveEnd,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Connection': 'keep-alive',
        },
      }
    );
  } catch (error) {
    console.error('[speedtest/chunk POST] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to receive chunk' },
      { status: 500 }
    );
  }
}
