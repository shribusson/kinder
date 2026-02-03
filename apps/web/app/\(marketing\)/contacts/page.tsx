import { fetchJson } from "@/app/lib/api";

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
}

export default async function ContactsPage() {
  const categories = await fetchJson<ServiceCategory[]>("/services/categories", {}, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Контакты</h1>
          <p className="text-xl text-gray-600">
            Свяжитесь с нами удобным способом
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Свяжитесь с нами</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Телефон</h3>
                <a href="tel:+7" className="text-blue-600 hover:text-blue-700 block mb-1">
                  +7 (___) ___-__-__
                </a>
                <p className="text-sm text-gray-600">Пн-Пт: 9:00 - 19:00, Сб: 10:00 - 16:00</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                <a href="mailto:info@auto-repair.kz" className="text-blue-600 hover:text-blue-700">
                  info@auto-repair.kz
                </a>
                <p className="text-sm text-gray-600">Ответим в течение суток</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Адрес</h3>
                <p className="text-gray-700">г. Караганда</p>
                <p className="text-sm text-gray-600 mt-1">Уточняйте при звонке</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Оставьте заявку</h2>

            <form action="/api/website-lead" method="POST" className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ваше имя
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Как вас зовут?"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  Интересующая услуга
                </label>
                <select
                  id="service"
                  name="service"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Выберите услугу</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарий (опционально)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Расскажите о вашей проблеме..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
              >
                Отправить заявку
              </button>

              <p className="text-xs text-gray-500 text-center">
                Я согласен с обработкой персональных данных
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
