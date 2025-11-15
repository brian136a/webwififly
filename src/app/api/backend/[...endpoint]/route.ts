import { NextRequest, NextResponse } from 'next/server';

/**
 * Catch-all dynamic route for /api/backend/* 
 * Forwards all requests to localhost:3001 backend
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ endpoint: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const endpoint = resolvedParams.endpoint.join('/');
    const url = new URL(request.url);
    const backendUrl = `http://localhost:3001/${endpoint}${url.search}`;
    
    console.log('[Proxy GET]', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
    });

    const data = await response.arrayBuffer();
    
    console.log('[Proxy GET] Response:', response.status, data.byteLength, 'bytes');

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
        'Content-Length': data.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('[Proxy GET] Error:', error);
    return new NextResponse('Backend error', { status: 502 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ endpoint: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const endpoint = resolvedParams.endpoint.join('/');
    const url = new URL(request.url);
    const backendUrl = `http://localhost:3001/${endpoint}${url.search}`;
    
    console.log('[Proxy POST]', backendUrl);
    
    const body = await request.arrayBuffer();
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      body,
    });

    const data = await response.arrayBuffer();
    
    console.log('[Proxy POST] Response:', response.status);

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
        'Content-Length': data.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('[Proxy POST] Error:', error);
    return new NextResponse('Backend error', { status: 502 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
  });
}
