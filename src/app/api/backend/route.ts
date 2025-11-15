import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * Fast proxy for LibreSpeed backend
 * All requests to /api/backend/* are forwarded directly to the backend server
 * This avoids the /librespeed/backend/ relative path resolution
 * 
 * Backend URL is configured via BACKEND_URL environment variable
 * Defaults to http://localhost:3001 for development
 */

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/backend/', '');
    const backendUrl = `${config.backend.url}/${path}${url.search}`;
    
    console.log('[Proxy GET]', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
    });

    const data = await response.arrayBuffer();
    
    console.log('[Proxy GET] Response:', response.status, data.byteLength);

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

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/backend/', '');
    const backendUrl = `${config.backend.url}/${path}${url.search}`;
    
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

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
  });
}
