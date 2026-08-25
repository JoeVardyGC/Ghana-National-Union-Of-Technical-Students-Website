import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('gnuts_admin_session');
    const hasValidSession = !!(sessionCookie && sessionCookie.value && sessionCookie.value.trim() !== '');

    // 1. If visiting /admin/login while already authenticated, redirect to /admin dashboard
    if (pathname === '/admin/login') {
      if (hasValidSession) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // 2. If visiting any /admin or /admin/* route without an active session, redirect to /admin/login
    if (!hasValidSession) {
      const loginUrl = new URL('/admin/login', request.url);
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
