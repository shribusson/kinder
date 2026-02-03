import Link from "next/link";

export default function MarketingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900">
            Автомастерская
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-gray-700 hover:text-orange-500 font-medium transition">
              О нас
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-orange-500 font-medium transition">
              Услуги
            </Link>
            <Link href="/contacts" className="text-gray-700 hover:text-orange-500 font-medium transition">
              Контакты
            </Link>
          </div>

          <Link
            href="/contacts"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Записаться
          </Link>
        </nav>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-50 text-gray-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Автомастерская</h3>
              <p className="text-sm text-gray-700">
                Профессиональный ремонт и техническое обслуживание автомобилей с гарантией качества.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-4 text-gray-900">Навигация</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-700 hover:text-gray-900 transition">О нас</Link></li>
                <li><Link href="/services" className="text-gray-700 hover:text-gray-900 transition">Услуги</Link></li>
                <li><Link href="/contacts" className="text-gray-700 hover:text-gray-900 transition">Контакты</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-4 text-gray-900">Контакты</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>Телефон: <a href="tel:+7" className="hover:text-gray-900">+7 (___) ___-__-__</a></li>
                <li>Email: <a href="mailto:" className="hover:text-gray-900">info@auto-repair.kz</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-sm text-gray-700">
              © {new Date().getFullYear()} Автомастерская. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
