import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get('target');

    if (!target) {
      return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
    }

    // Security check: Only proxy to Telegram
    if (!target.startsWith('https://api.telegram.org')) {
      return NextResponse.json({ error: 'Forbidden target' }, { status: 403 });
    }

    const contentType = req.headers.get('content-type') || '';
    
    // Forward the request to Telegram
    const response = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      // Passing the request body directly handles both JSON and FormData/Files
      body: req.body,
      // @ts-ignore - duplex is required for streaming request bodies in some environments
      duplex: 'half',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('TgProxy Error:', error);
    return NextResponse.json({ 
      error: 'Proxy Error', 
      message: error.message 
    }, { status: 500 });
  }
}
