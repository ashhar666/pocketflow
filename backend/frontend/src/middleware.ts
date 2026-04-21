import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PUBLIC_ROUTES, PROTECTED_PREFIXES } from './lib/constants';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Standardize pathname (remove trailing slash for comparison)
  const currentPath = pathname.replace(/\/$/, '') || '/';

  // Server-side middleware CAN read HTTP-only cookies
  const accessToken = request.cookies.get('access_token')?.value;

  // 1. Check if the current route is a public route
  const isPublicRoute = PUBLIC_ROUTES.includes(currentPath);

  // 2. Check if the current route starts with a protected prefix
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    currentPath.startsWith(prefix)
  );

  // LOGGING (Visible in server logs/Vercel logs)
  // console.log(`[MIDDLEWARE] Path: ${currentPath} | Public: ${isPublicRoute} | Protected: ${isProtectedRoute} | Auth: ${!!accessToken}`);

  // If it's a public route, always allow access
  if (isPublicRoute) {
    // Exception: If user has token and is on login/register → redirect to dashboard
    if ((currentPath === '/login' || currentPath === '/register') && accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // If it's a protected route and no valid token → redirect to login
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', currentPath);
    return NextResponse.redirect(loginUrl);
  }

  // Default to allowing access (for other internal routes, static assets, etc.)
  return NextResponse.next();
}

// Only run middleware on specific routes (not static files)
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by Next.js)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
