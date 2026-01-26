'use client';

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

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
  const t = useTranslations();
  const servicesData = t.raw('servicesPage');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {servicesData.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {servicesData.subtitle}
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
                <h3 className="font-semibold text-gray-900 mb-3">{servicesData.whatIncluded}</h3>
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
                {servicesData.enrollButton}
              </Link>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            {servicesData.benefits.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {servicesData.benefits.items.map((item: any) => (
              <div key={item.title} className="text-center">
                <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👨‍🏫</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-blue-100 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Пробное занятие */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {servicesData.consultation.title}
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            {servicesData.consultation.subtitle}
          </p>
          <Link
            href={`/${params.lang}#contact`}
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {servicesData.consultation.button}
          </Link>
        </div>
      </div>
    </div>
  );
}
