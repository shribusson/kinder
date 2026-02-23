import Link from "next/link";
import { fetchJson } from "@/app/lib/api";
import { IconShieldCheck, IconTruck, IconUsers, IconClock } from "@tabler/icons-react";

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  priceNote?: string;
  unit?: string;
  sortOrder: number;
}

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  sortOrder: number;
  services: Service[];
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  brake: IconTruck,
  coolant: IconTruck,
  heater: IconTruck,
};

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { lead?: string };
}) {
  const categories = await fetchJson<ServiceCategory[]>("/services/categories", {}, []);
  const leadStatus = searchParams?.lead;

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Профессиональный ремонт автомобилей
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Качественная диагностика, оригинальные запчасти, гарантия на все виды работ
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="#contact"
              className="bg-orange-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-orange-600 transition"
            >
              Записаться на приём
            </Link>
            <a
              href="tel:+7"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-bold hover:border-orange-500 transition"
            >
              📞 Позвонить
            </a>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <IconShieldCheck className="w-12 h-12 text-orange-500 mx-auto mb-3" stroke={1.5} />
              <h3 className="font-bold text-gray-900">Гарантия качества</h3>
              <p className="text-sm text-gray-600">Гарантия на все виды работ</p>
            </div>
            <div className="text-center">
              <IconTruck className="w-12 h-12 text-orange-500 mx-auto mb-3" stroke={1.5} />
              <h3 className="font-bold text-gray-900">Собственный склад</h3>
              <p className="text-sm text-gray-600">Оригинальные запчасти</p>
            </div>
            <div className="text-center">
              <IconUsers className="w-12 h-12 text-orange-500 mx-auto mb-3" stroke={1.5} />
              <h3 className="font-bold text-gray-900">Опытные мастера</h3>
              <p className="text-sm text-gray-600">Специалисты высокого уровня</p>
            </div>
            <div className="text-center">
              <IconClock className="w-12 h-12 text-orange-500 mx-auto mb-3" stroke={1.5} />
              <h3 className="font-bold text-gray-900">Удобное расписание</h3>
              <p className="text-sm text-gray-600">Гибкий график работы</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Наши услуги</h2>
            <p className="text-xl text-gray-600">
              Полный спектр услуг по ремонту и обслуживанию автомобилей
            </p>
          </div>

          {categories.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {categories.map((category) => {
                  const Icon = ICON_MAP[category.icon || 'brake'] || IconTruck;
                  return (
                    <Link
                      key={category.id}
                      href={`/services#${category.slug}`}
                      className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition text-center"
                    >
                      <Icon className="w-12 h-12 text-orange-500 mx-auto mb-4" stroke={1.5} />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600">
                        {category.services.length} услуг
                      </p>
                    </Link>
                  );
                })}
              </div>

              <div className="text-center">
                <Link
                  href="/services"
                  className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
                >
                  Все услуги →
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600">
              <p>Услуги загружаются...</p>
            </div>
          )}
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Как начать</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: 1, title: "Оставьте заявку", desc: "Заполните форму или позвоните" },
              { num: 2, title: "Мы свяжемся с вами", desc: "Обсудим детали вашего заказа" },
              { num: 3, title: "Начинаем ремонт", desc: "Выполняем работу с гарантией" },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Form */}
      <section id="contact" className="py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-orange-50 rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Записаться на приём</h2>
            <p className="text-gray-600 mb-8">
              Оставьте свои контакты, и мы свяжемся с вами в ближайшее время
            </p>

            {leadStatus === "success" && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                Заявка отправлена. Мы свяжемся с вами в ближайшее время.
              </div>
            )}
            {leadStatus === "error" && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                Не удалось отправить заявку. Повторите попытку позже.
              </div>
            )}

            <form action="/api/website-lead" method="POST" className="space-y-4 max-w-lg mx-auto">
              <input type="hidden" name="source" value="landing_form" />
              <input
                type="text"
                name="name"
                placeholder="Ваше имя"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="tel"
                name="phone"
                placeholder="+7 (___) ___-__-__"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <select
                name="service"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Выберите услугу</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
              >
                Отправить заявку
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
