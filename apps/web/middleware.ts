import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Защита CRM маршрутов
  if (pathname.startsWith('/crm') && pathname !== '/crm/login') {
    // Проверяем наличие токена
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      // Редирект на логин с возвратом на исходную страницу
      const url = new URL('/crm/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/crm/:path*'],
};
