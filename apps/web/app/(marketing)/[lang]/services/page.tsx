import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Услуги и программы - School Kids",
  description: "Логопед, психолог, дефектолог, подготовка к школе в School Kids. Индивидуальные и групповые занятия. Современные методики развития детей в Алматы.",
  openGraph: {
    title: "Услуги School Kids - логопед, психолог, подготовка к школе",
    description: "Полный спектр услуг для развития вашего ребенка"
  }
};

const services = [
  {
    id: "logoped",
    title: "Логопед",
    description: "Коррекция звукопроизношения, развитие речи",
    fullDescription: "Профессиональная помощь в коррекции звукопроизношения, развитии речи и преодолении речевых нарушений. Работаем с детьми от 3 лет.",
    features: [
      "Диагностика речевого развития",
      "Постановка и автоматизация звуков",
      "Развитие фонематического слуха",
      "Расширение словарного запаса",
      "Работа над грамматикой речи"
    ],
    price: "от 5 000 ₸",
    duration: "45 минут"
  },
  {
    id: "psycholog",
    title: "Детский психолог",
    description: "Эмоциональное развитие и адаптация",
    fullDescription: "Помощь детям в решении эмоциональных и поведенческих проблем, развитие социальных навыков, работа со страхами и тревожностью.",
    features: [
      "Психологическая диагностика",
      "Коррекция поведения",
      "Работа со страхами и тревогой",
      "Развитие эмоционального интеллекта",
      "Консультации для родителей"
    ],
    price: "от 6 000 ₸",
    duration: "50 минут"
  },
  {
    id: "defektolog",
    title: "Дефектолог",
    description: "Коррекционная педагогика",
    fullDescription: "Комплексная работа с детьми, имеющими особенности развития. Индивидуальный подход и современные коррекционные методики.",
    features: [
      "Комплексная диагностика развития",
      "Развитие познавательных процессов",
      "Коррекция задержки развития",
      "Подготовка к обучению в школе",
      "Работа с родителями"
    ],
    price: "от 6 500 ₸",
    duration: "45-60 минут"
  },
  {
    id: "school-prep",
    title: "Подготовка к школе",
    description: "Комплексная программа для будущих первоклассников",
    fullDescription: "Всесторонняя подготовка к школе: обучение чтению, письму, математике, развитие логического мышления и внимания.",
    features: [
      "Обучение чтению и письму",
      "Основы математики и логики",
      "Развитие внимания и памяти",
      "Подготовка руки к письму",
      "Формирование учебной мотивации"
    ],
    price: "от 4 500 ₸",
    duration: "60 минут"
  },
  {
    id: "group",
    title: "Групповые занятия",
    description: "Развивающие программы в малых группах",
    fullDescription: "Занятия в небольших группах (до 6 детей) для развития социальных навыков, творческих способностей и подготовки к школе.",
    features: [
      "Малые группы (4-6 детей)",
      "Социализация и коммуникация",
      "Творческое развитие",
      "Развивающие игры",
      "Подготовка к школе в группе"
    ],
    price: "от 3 500 ₸",
    duration: "60 минут"
  }
];

export default function ServicesPage({ params }: { params: { lang: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Наши услуги и программы
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Профессиональная помощь в развитии вашего ребёнка. Индивидуальный подход и современные методики.
          </p>
        </div>

        {/* Services Grid */}
        <div className="space-y-8 mb-12">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {service.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {service.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    {service.duration}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                {service.fullDescription}
              </p>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Что включено:</h3>
                <ul className="grid md:grid-cols-2 gap-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={`/${params.lang}#contact`}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Записаться на занятие
              </Link>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Преимущества занятий в School Kids
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍🏫</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Опытные специалисты</h3>
              <p className="text-blue-100 text-sm">
                Дипломированные педагоги с опытом от 5 лет
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Индивидуальный план</h3>
              <p className="text-blue-100 text-sm">
                Персональная программа для каждого ребёнка
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Видимый результат</h3>
              <p className="text-blue-100 text-sm">
                Регулярная обратная связь о прогрессе
              </p>
            </div>
          </div>
        </div>

        {/* Пробное занятие */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Не уверены, с чего начать?
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Приходите на бесплатную консультацию. Наши специалисты проведут диагностику и порекомендуют оптимальную программу занятий.
          </p>
          <Link
            href={`/${params.lang}#contact`}
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Записаться на бесплатную консультацию
          </Link>
        </div>
      </div>
    </div>
  );
}
