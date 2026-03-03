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
  it: IconTruck,
  language: IconUsers,
  creative: IconShieldCheck,
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
            Школа дополнительного образования для детей
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Современные программы, опытные преподаватели и прозрачный прогресс обучения
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="#contact"
              className="bg-orange-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-orange-600 transition"
            >
              Оставить заявку
            </Link>
            <a
              href="tel:+7"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-bold hover:border-orange-500 transition"
            >
              📞 Консультация
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
              <h3 className="font-bold text-gray-900">Проверенные программы</h3>
              <p className="text-sm text-gray-600">Обновляемые методики обучения</p>
            </div>
            <div className="text-center">
              <IconTruck className="w-12 h-12 text-orange-500 mx-auto mb-3" stroke={1.5} />
              <h3 className="font-bold text-gray-900">EdTech-платформа</h3>
              <p className="text-sm text-gray-600">Материалы, прогресс и расписание онлайн</p>
            </div>
            <div className="text-center">
              <IconUsers className="w-12 h-12 text-orange-500 mx-auto mb-3" stroke={1.5} />
              <h3 className="font-bold text-gray-900">Сильная команда</h3>
              <p className="text-sm text-gray-600">Преподаватели и методисты с опытом</p>
            </div>
            <div className="text-center">
              <IconClock className="w-12 h-12 text-orange-500 mx-auto mb-3" stroke={1.5} />
              <h3 className="font-bold text-gray-900">Гибкое расписание</h3>
              <p className="text-sm text-gray-600">Очные и онлайн-форматы занятий</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Наши программы</h2>
            <p className="text-xl text-gray-600">
              Направления дополнительного образования для разных возрастов
            </p>
          </div>

          {categories.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {categories.map((category) => {
                  const Icon = ICON_MAP[category.icon || 'it'] || IconTruck;
                  return (
                    <Link
                      key={category.id}
                      href={`/services#${category.slug}`}
                      className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition text-center"
                    >
                      <Icon className="w-12 h-12 text-orange-500 mx-auto mb-4" stroke={1.5} />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600">
                        {category.services.length} курсов
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
                  Все программы →
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Как начать обучение</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: 1, title: "Оставьте заявку", desc: "Заполните форму или позвоните" },
              { num: 2, title: "Консультация", desc: "Подберем программу под возраст и цели" },
              { num: 3, title: "Старт обучения", desc: "Формируем маршрут и расписание" },
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Запрос на консультацию</h2>
            <p className="text-gray-600 mb-8">
              Оставьте контакты, и мы подберем программу обучения для вашего ребенка
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
                <option value="">Выберите программу</option>
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
