import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'ru',
  localePrefix: 'always'
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Защита CRM маршрутов (исключаем из локализации)
  if (pathname.startsWith('/crm')) {
    if (pathname !== '/crm/login') {
      // Проверяем наличие токена
      const token = request.cookies.get('auth_token')?.value;

      if (!token) {
        // Редирект на логин с возвратом на исходную страницу
        const url = new URL('/crm/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    }
    // CRM маршруты не обрабатываем next-intl middleware
    return NextResponse.next();
  }

  // Применяем next-intl middleware для маркетинг маршрутов
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
