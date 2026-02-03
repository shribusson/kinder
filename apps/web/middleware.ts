import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect CRM routes
  if (pathname.startsWith('/crm')) {
    if (pathname !== '/crm/login') {
      const token = request.cookies.get('auth_token')?.value;

      if (!token) {
        const url = new URL('/crm/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
