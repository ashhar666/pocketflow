import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

// Routes that require authentication
// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/dashboard', 
  '/settings', 
  '/expenses', 
  '/income', 
  '/budgets', 
  '/categories', 
  '/savings', 
  '/reports', 
  '/telegram'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Server-side middleware CAN read HTTP-only cookies
  const accessToken = request.cookies.get('access_token')?.value;

  // Check if the current route is a protected route
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // If it's a public route, always allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If it's a protected route and no valid token → redirect to login
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user has token and is on login/register → redirect to dashboard
  if ((pathname === '/login' || pathname === '/register') && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

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
