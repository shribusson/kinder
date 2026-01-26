'use client';

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  IconStarFilled,
  IconUsersGroup,
  IconCertificate,
  IconMapPin,
  IconMicrophone,
  IconBrain,
  IconBook,
  IconPalette,
  IconBabyBottle,
  IconTargetArrow
} from "@tabler/icons-react";

export default function MarketingPage({ params }: { params: { lang: "ru" | "kz" | "en" } }) {
  const t = useTranslations();

  const trustBadges = [
    { icon: IconStarFilled, value: "4.9", label: "Средний рейтинг", gradient: "from-yellow-50 to-orange-50", iconClass: "text-yellow-500" },
    { icon: IconUsersGroup, value: "200+", label: "Довольных семей", gradient: "from-green-50 to-blue-50", iconClass: "text-green-600" },
    { icon: IconCertificate, value: "10+", label: "Лет опыта", gradient: "from-blue-50 to-purple-50", iconClass: "text-blue-600" },
    { icon: IconMapPin, value: "2", label: "Филиала в Караганде", gradient: "from-purple-50 to-pink-50", iconClass: "text-purple-600" }
  ];

  const serviceIcons = [
    IconMicrophone,
    IconBrain,
    IconBook,
    IconPalette,
    IconBabyBottle,
    IconTargetArrow
  ];

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-yellow-100 pt-20 pb-32 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <p className="text-green-600 font-bold text-sm uppercase tracking-wider mb-4">✨ Детский центр развития в Караганде</p>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${params.lang}#contact`}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition text-center transform hover:scale-105"
              >
                {t('hero.primaryCta')}
              </Link>
              <Link
                href="tel:+77082050318"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold hover:border-green-500 hover:text-green-600 transition text-center"
              >
                📞 Позвонить
              </Link>
            </div>
            <p className="text-gray-500 mt-6 flex items-center gap-2">
              <span className="text-2xl">⭐</span> {t('rating')}
            </p>
          </div>
          
          {/* Owl SVG Logo */}
          <div className="relative h-96 flex items-center justify-center">
            <Image
              src="/owl-logo.svg"
              alt="School Kids - Сова"
              width={300}
              height={300}
              className="drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-yellow-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {trustBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className={`bg-gradient-to-br ${badge.gradient} rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:scale-105`}
                >
                  <Icon className={`w-10 h-10 mb-2 ${badge.iconClass}`} stroke={2} />
                  <div className="text-2xl font-bold text-gray-900">{badge.value}</div>
                  <div className="text-sm text-gray-500">{badge.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Наши услуги</h2>
            <p className="text-xl text-gray-600">
              Профессиональная помощь в развитии вашего ребенка
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(t.raw('services.items') as Array<{name: string, desc: string}>).map((service, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition border-2 border-transparent hover:border-green-300 transform hover:scale-105">
                <div className="text-4xl mb-4">
                  {(() => {
                    const Icon = serviceIcons[i % serviceIcons.length];
                    return <Icon className="w-10 h-10 text-green-600" stroke={2} />;
                  })()}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href={`/${params.lang}/services`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition transform hover:scale-105"
            >
              Все услуги →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('why.title')}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {(t.raw('why.items') as Array<{title: string, desc: string}>).map((item, i) => (
              <div key={i} className="flex gap-4 items-start bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl hover:shadow-lg transition">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('process.title')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(t.raw('process.steps') as Array<{title: string, desc: string}>).map((step, i) => (
              <div key={i} className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition transform hover:scale-105">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {i + 1}
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{step.title}</h3>
                  <p className="text-gray-600 text-center">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Отзывы родителей</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                Огромная благодарность специалистам! За 3 месяца занятий с логопедом у сына значительно улучшилась речь. Очень внимательные и профессиональные педагоги!
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                  А
                </div>
                <div>
                  <p className="font-bold text-gray-900">Анна М.</p>
                  <p className="text-sm text-gray-500">Мама Артёма, 5 лет</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                Отличный центр! Дочка с удовольствием ходит на подготовку к школе. Видим реальные результаты. Рекомендуем всем знакомым!
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                  Д
                </div>
                <div>
                  <p className="font-bold text-gray-900">Дарья К.</p>
                  <p className="text-sm text-gray-500">Мама Софии, 6 лет</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-6">Записаться на консультацию</h2>
            <p className="text-xl text-white/90 mb-8">
              Оставьте заявку, и мы свяжемся с вами в ближайшее время
            </p>

            <form action="/api/website-lead" method="POST" className="space-y-4 max-w-lg mx-auto">
              <input type="hidden" name="source" value="landing_form" />
              
              <input
                type="text"
                name="name"
                placeholder="Ваше имя"
                required
                className="w-full px-6 py-4 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20"
              />
              
              <input
                type="tel"
                name="phone"
                placeholder="+7 (___) ___-__-__"
                required
                className="w-full px-6 py-4 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20"
              />
              
              <select
                name="service"
                className="w-full px-6 py-4 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur text-white focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20"
              >
                <option value="" className="text-gray-900">Выберите услугу</option>
                <option value="Логопед" className="text-gray-900">Логопед</option>
                <option value="Психолог" className="text-gray-900">Психолог</option>
                <option value="Дефектолог" className="text-gray-900">Дефектолог</option>
                <option value="Подготовка к школе" className="text-gray-900">Подготовка к школе</option>
                <option value="Детский сад" className="text-gray-900">Детский сад</option>
              </select>
              
              <button
                type="submit"
                className="w-full bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Отправить заявку
              </button>
            </form>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center text-white/80">
              <a href="tel:+77082050318" className="flex items-center gap-2 hover:text-white transition">
                <span className="text-2xl">📞</span>
                <span>+7 (708) 205-03-18</span>
              </a>
              <span className="hidden sm:inline">•</span>
              <a href="tel:+77082812899" className="flex items-center gap-2 hover:text-white transition">
                <span className="text-2xl">📞</span>
                <span>+7 (708) 281-28-99</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Наши филиалы в Караганде</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition transform hover:scale-105">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-md">
                  📍
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Филиал 1</h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    ⭐⭐⭐⭐⭐ <span className="text-sm text-gray-500 ml-1">4.8 (35 отзывов)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-gray-600">
                <p className="flex items-start gap-2">
                  <span className="text-xl">🏢</span>
                  <span>г. Караганда, ул. Язева, 9</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-xl">📞</span>
                  <a href="tel:+77082050318" className="text-blue-600 hover:underline font-semibold">+7 (708) 205-03-18</a>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition transform hover:scale-105">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-md">
                  📍
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Филиал 2</h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    ⭐⭐⭐⭐⭐ <span className="text-sm text-gray-500 ml-1">5.0 (27 отзывов)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-gray-600">
                <p className="flex items-start gap-2">
                  <span className="text-xl">🏢</span>
                  <span>г. Караганда, ул. Университетская, 17</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-xl">📞</span>
                  <a href="tel:+77082812899" className="text-blue-600 hover:underline font-semibold">+7 (708) 281-28-99</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
