'use client';

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export default function MarketingPage({ params }: { params: { lang: "ru" | "kz" | "en" } }) {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20 pb-32">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-gradient-to-br from-blue-200 to-green-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-yellow-200 to-blue-200 rounded-full opacity-20 blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-4">Детский центр развития</p>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {t('hero.title')}
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/${params.lang}#contact`}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition text-center"
                >
                  {t('hero.primaryCta')}
                </Link>
                <Link
                  href="tel:+77082050318"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold hover:border-blue-600 hover:text-blue-600 transition text-center"
                >
                  {t('contact.title')}
                </Link>
              </div>
              <p className="text-gray-500 mt-6 flex items-center gap-2">
                <span className="text-2xl">⭐</span> {t('rating')}
              </p>
            </div>
            <div className="relative hidden md:block">
              <div className="relative w-full h-96 bg-gradient-to-br from-yellow-300 to-green-400 rounded-2xl shadow-2xl overflow-hidden">
                <Image
                  src="/brand-logo.png"
                  alt="School Kids"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="relative w-full h-80 bg-gradient-to-br from-yellow-200 to-green-300 rounded-2xl shadow-lg overflow-hidden">
                <Image
                  src="/brand-logo.png"
                  alt="School Kids"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">{t('about.sectionTitle')}</h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t('about.text')}
              </p>
              <div className="space-y-4">
                {t.raw('why.items').map((item: any) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">{t('services.sectionTitle')}</h3>
            <p className="text-xl text-gray-600">Профессиональная помощь в развитии вашего ребёнка</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {t.raw('services.items').map((service: any) => (
              <div key={service.name} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-green-400 rounded-lg mb-4 flex items-center justify-center text-2xl">
                  🎓
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h4>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-gray-900 text-center mb-16">{t('process.title')}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {t.raw('process.steps').map((step: any, idx: number) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mb-6 mx-auto">
                  {step.num}
                </div>
                <h4 className="text-xl font-bold text-gray-900 text-center mb-2">{step.title}</h4>
                <p className="text-gray-600 text-center">{step.text}</p>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-1 bg-gradient-to-r from-blue-500 to-green-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-green-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-3xl text-white font-bold mb-6 italic">&quot;{t('testimonial')}&quot;</p>
          <p className="text-blue-100 font-semibold">&mdash; {t('contact.title')}</p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-gray-900 text-center mb-16">{t('contact.title')}</h3>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 text-xl">
                  📍
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{t('contact.branchesTitle')}</p>
                  <div className="mt-3 space-y-3">
                    {t.raw('contact.branches').map((branch: any) => (
                      <div key={branch.label} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-xs text-gray-500">{branch.label}</p>
                        <p className="text-base font-semibold text-gray-900">{branch.address}</p>
                        <a href={`tel:${branch.phoneHref}`} className="text-sm font-semibold text-blue-600 hover:underline">
                          {branch.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 text-xl">
                  💬
                </div>
                <div>
                  <p className="text-gray-500 text-sm">WhatsApp</p>
                  <a href={`https://wa.me/77786545258`} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-blue-600 hover:underline">
                    {t('contact.phone')}
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 text-purple-600 text-xl">
                  ✉️
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <a href={`mailto:info@schoolkids.kz`} className="text-lg font-bold text-blue-600 hover:underline">
                    info@schoolkids.kz
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 text-orange-600 text-xl">
                  🕐
                </div>
                <div>
                  <p className="text-gray-500 text-sm">График работы</p>
                  <p className="text-lg font-bold text-gray-900">{t('contact.hours')}</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-2xl" action="/api/website-lead" method="POST">
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder={t('contact.form.namePlaceholder')}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder={t('contact.form.phonePlaceholder')}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600"
                />
                <select name="service" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600">
                  <option value="">{t('contact.form.serviceSelect')}</option>
                  <option value="logoped">{t('contact.form.logoped')}</option>
                  <option value="psycholog">{t('contact.form.psycholog')}</option>
                  <option value="defektolog">{t('contact.form.defektolog')}</option>
                  <option value="school-prep">{t('contact.form.schoolPrep')}</option>
                </select>
                <textarea
                  name="message"
                  rows={4}
                  placeholder={t('contact.form.messagePlaceholder')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-lg font-bold hover:shadow-lg transition"
                >
                  {t('hero.primaryCta')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-semibold text-white mb-2">{t('footer.text')}</p>
          <p className="text-sm">&copy; 2026 School Kids. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
