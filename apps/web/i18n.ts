import { getRequestConfig } from 'next-intl/server';
 
export const locales = ['ru', 'kz', 'en'] as const;
export type Locale = typeof locales[number];
 
export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale as any)) {
    return {
      locale: 'ru' as const,
      messages: (await import(`./messages/ru.json`)).default
    };
  }

  return {
    locale: locale as Locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
