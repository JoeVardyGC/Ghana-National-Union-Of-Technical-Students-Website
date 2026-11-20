import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

/**
 * Guards the /admin pages and redirects /executives to the About page's leadership section. API routes check the session themselves via getAdminSession().
 * (Next.js 16 renamed the `middleware` file convention to `proxy`.)
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /executives has no page of its own: permanently send it to the About page's
  // leadership section (a real 308, so search engines move the link there too)
  if (pathname === '/executives' || pathname === '/executives/') {
    return NextResponse.redirect(new URL('/about#leadership', request.url), 308);
  }

  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    const hasValidSession = !!(await verifySessionToken(sessionCookie?.value));

    // Already signed in: skip the login page
    if (pathname === '/admin/login') {
      if (hasValidSession) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Not signed in (or forged/expired cookie): send to login
    if (!hasValidSession) {
      const loginUrl = new URL('/admin/login', request.url);
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      const response = NextResponse.redirect(loginUrl);
      if (sessionCookie) response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/executives'],
};
