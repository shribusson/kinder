import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect CRM and Client routes
  if (pathname.startsWith('/crm') || pathname.startsWith('/client')) {
    const isCrmLogin = pathname === '/crm/login';

    if (!isCrmLogin) {
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
