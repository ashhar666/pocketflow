import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return handleRequest(req, 'GET');
}

export async function POST(req: NextRequest) {
  return handleRequest(req, 'POST');
}

async function handleRequest(req: NextRequest, method: string) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get('target');

    if (!target) {
      return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
    }

    // Security check: Only proxy to Telegram
    const allowedBase = 'https://api.telegram.org';
    if (!target.startsWith(allowedBase)) {
      return NextResponse.json({ error: 'Forbidden target', detail: `Only ${allowedBase} allowed` }, { status: 403 });
    }

    const headers: Record<string, string> = {};
    const contentType = req.headers.get('content-type');
    if (contentType) headers['Content-Type'] = contentType;

    const fetchOptions: RequestInit = {
      method: method,
      headers: headers,
    };

    if (method === 'POST') {
      const body = await req.arrayBuffer();
      if (body.byteLength > 0) {
        fetchOptions.body = body;
      }
    }

    const response = await fetch(target, fetchOptions);
    const responseData = await response.json().catch(() => null);

    return NextResponse.json(responseData || { ok: response.ok, status: response.status }, { 
      status: response.status 
    });

  } catch (error: any) {
    console.error('TgProxy Error:', error);
    return NextResponse.json({ 
      error: 'Proxy Error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
