'use client';

import Link from 'next/link';
import { useState } from 'react';
import { IconMenu2, IconX } from '@tabler/icons-react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Главная', href: '/' },
    { label: 'Услуги', href: '/services' },
    { label: 'О нас', href: '/about' },
    { label: 'Контакты', href: '/contacts' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo / Brand */}
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-orange-500"></div>
              <span className="hidden text-lg font-bold text-gray-900 sm:inline">
                Автомастерская
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* CTA Button (Desktop) */}
            <div className="hidden md:block">
              <Link
                href="/contacts"
                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Записаться
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <IconX className="w-6 h-6" />
              ) : (
                <IconMenu2 className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="mt-4 border-t border-gray-200 pt-4 md:hidden space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-200">
                <Link
                  href="/contacts"
                  className="block w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Записаться
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-8">
            {/* Column 1: About */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Автомастерская</h3>
              <p className="text-sm text-gray-600">
                Профессиональный ремонт и обслуживание автомобилей. Гарантия на все виды работ,
                оригинальные запчасти и опытные специалисты.
              </p>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Навигация</h3>
              <ul className="space-y-2 text-sm">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-orange-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Контакты</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="tel:+7"
                    className="text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    +7 (___) ___-__-__
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@auto-repair.kz"
                    className="text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    info@auto-repair.kz
                  </a>
                </li>
                <li className="text-gray-600">г. Караганда</li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-200 pt-8">
            <p className="text-center text-sm text-gray-500">
              © 2026 Автомастерская. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
