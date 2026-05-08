import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Minimal middleware: all route protection is handled client-side by AuthContext.
 * Server-side cookie checks are unreliable because the JWT cookies are set by the
 * Django backend (via the Next.js rewrite proxy) and browser behaviour varies
 * across environments. AuthContext covers every protected route on the client.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
