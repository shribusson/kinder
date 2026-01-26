'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IconBrandInstagram, IconBrandFacebook } from "@tabler/icons-react";

export default function MarketingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lang = pathname.split('/')[1] || 'ru';

  // Navigation labels
  const navLabels: Record<string, any> = {
    ru: {
      about: "О нас",
      services: "Услуги",
      contacts: "Контакты",
      cta: "Записаться"
    },
    kz: {
      about: "Біз туралы",
      services: "Қызметтер",
      contacts: "Байланыс",
      cta: "Жазылу"
    },
    en: {
      about: "About",
      services: "Services",
      contacts: "Contacts",
      cta: "Book Now"
    }
  };

  const t = navLabels[lang] || navLabels.ru;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href={`/${lang}`} className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-md bg-gradient-to-br from-yellow-300 to-green-400 p-1">
              <Image
                src="/owl-logo.svg"
                alt="School Kids"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-bold text-gray-900">School Kids</p>
              <p className="text-xs text-gray-500">Детский центр развития</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href={`/${lang}/about`} className="text-gray-700 hover:text-blue-600 font-medium transition">
              {t.about}
            </Link>
            <Link href={`/${lang}/services`} className="text-gray-700 hover:text-blue-600 font-medium transition">
              {t.services}
            </Link>
            <Link href={`/${lang}/contacts`} className="text-gray-700 hover:text-blue-600 font-medium transition">
              {t.contacts}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={pathname.replace(/^\/(ru|kz|en)/, '/ru')}
              className={`px-2 py-1 rounded text-xs font-semibold transition ${lang === "ru" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
            >
              РУС
            </Link>
            <Link
              href={pathname.replace(/^\/(ru|kz|en)/, '/kz')}
              className={`px-2 py-1 rounded text-xs font-semibold transition ${lang === "kz" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
            >
              ҚАЗ
            </Link>
            <Link
              href={pathname.replace(/^\/(ru|kz|en)/, '/en')}
              className={`px-2 py-1 rounded text-xs font-semibold transition ${lang === "en" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
            >
              EN
            </Link>
            <Link
              href={`/${lang}/contacts`}
              className="ml-2 hidden sm:inline-flex items-center rounded-lg bg-gradient-to-r from-green-500 to-blue-500 px-4 py-2 text-xs font-bold text-white hover:shadow-lg transition"
            >
              {t.cta}
            </Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
      
      <footer className="bg-yellow-50 text-gray-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-md bg-gradient-to-br from-yellow-300 to-green-400 p-1">
                  <Image
                    src="/owl-logo.svg"
                    alt="School Kids"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">School Kids</p>
                  <p className="text-xs text-gray-600">Караганда</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Детский центр развития с логопедом, психологом и дефектологом
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-4 text-green-700">Наши филиалы</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li>
                  <p className="font-semibold text-gray-900">Филиал 1</p>
                  <p>г. Караганда, ул. Язева, 9</p>
                  <a href="tel:+77082050318" className="text-blue-600 hover:text-blue-700">+7 (708) 205-03-18</a>
                </li>
                <li>
                  <p className="font-semibold text-gray-900">Филиал 2</p>
                  <p>г. Караганда, ул. Университетская, 17</p>
                  <a href="tel:+77082812899" className="text-blue-400 hover:text-blue-300">+7 (708) 281-28-99</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-4 text-green-700">Навигация</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href={`/${lang}/about`} className="text-gray-700 hover:text-gray-900 transition">{t.about}</Link></li>
                <li><Link href={`/${lang}/services`} className="text-gray-700 hover:text-gray-900 transition">{t.services}</Link></li>
                <li><Link href={`/${lang}/contacts`} className="text-gray-700 hover:text-gray-900 transition">{t.contacts}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-4 text-green-700">Контакты</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <a href="mailto:info@schoolkids.kz" className="hover:text-gray-900 transition">info@schoolkids.kz</a>
                </li>
                <li>
                  <a href="https://wa.me/77786545258" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition">WhatsApp</a>
                </li>
                <li className="flex gap-3 mt-4">
                  <a href="https://instagram.com/schoolkids.kz" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white rounded-lg border border-gray-200 flex items-center justify-center hover:shadow-md transition">
                    <IconBrandInstagram className="w-5 h-5 text-pink-500" stroke={2} />
                  </a>
                  <a href="https://facebook.com/schoolkids.kz" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white rounded-lg border border-gray-200 flex items-center justify-center hover:shadow-md transition">
                    <IconBrandFacebook className="w-5 h-5 text-blue-600" stroke={2} />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-yellow-200 pt-8 text-center">
            <p className="text-sm text-gray-700">
              © {new Date().getFullYear()} School Kids. Детский центр развития в Караганде
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
