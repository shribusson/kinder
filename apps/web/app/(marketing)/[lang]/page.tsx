import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

const content = {
  ru: {
    localeLabel: "Рус",
    title: "School Kids — детский центр развития в Караганде",
    description:
      "Детский центр School Kids: логопед, психолог, дефектолог, подготовка к школе. ✓ Опытные педагоги ✓ Индивидуальный подход ✓ Современные методики ✓ Уютная атмосфера. Записаться на пробное занятие!",
    heroTag: "School Kids — Детский центр развития",
    heroTitle: "Раскрываем потенциал каждого ребёнка",
    heroSubtitle:
      "Помогаем детям говорить чётко, учиться с удовольствием и развиваться гармонично. Профессиональные логопеды, психологи и педагоги в уютном пространстве.",
    ctaPrimary: "Записаться на пробное занятие",
    ctaSecondary: "Получить бесплатную консультацию",
    featuresTitle: "Почему родители выбирают School Kids",
    features: [
      "Опытные специалисты (дипломированные педагоги с опытом от 5 лет)",
      "Индивидуальный подход (персональная программа для каждого ребенка)",
      "Современные методики (проверенные программы и игровые формы обучения)",
      "Видимый результат (регулярная диагностика и подробная обратная связь)"
    ],
    servicesTitle: "Услуги центра",
    servicesSubtitle: "Основные направления работы и специалисты.",
    services: [
      "Логопед",
      "Психолог",
      "Дефектолог",
      "Подготовка к школе",
      "Коррекционные занятия"
    ],
    trustTitle: "Результаты и забота",
    trustItems: [
      "Диагностика и персональные рекомендации",
      "Поддержка родителей на каждом этапе",
      "Регулярная обратная связь"
    ],
    processTitle: "Как мы работаем",
    process: [
      "Оставляете заявку на сайте",
      "Мы связываемся и уточняем запрос",
      "Подбираем специалиста и удобное время"
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Сколько длится консультация?",
        a: "Стандартная консультация длится 45–60 минут."
      },
      {
        q: "Можно ли записаться на пробное занятие?",
        a: "Да, подберём пробное занятие и удобное время."
      },
      {
        q: "Как быстро вы отвечаете?",
        a: "Обычно в течение 15 минут в рабочее время."
      }
    ],
    footerTitle: "Контакты",
    footerSubtitle: "Оставьте заявку — мы свяжемся в ближайшее время.",
    leadCta: "Оставить заявку",
    supportTitle: "Забота о родителях",
    supportText: "Мы объясняем прогресс ребёнка и даём рекомендации для занятий дома.",
    supportCta: "Получить консультацию"
  },
  kz: {
    localeLabel: "Қаз",
    title: "Балалар орталығы — логопед, психолог, мектепке дайындық",
    description:
      "Балалар орталығы: логопед, психолог, дефектолог. Жеке бағдарламалар және ыңғайлы жазылу.",
    heroTag: "Балалар орталығы",
    heroTitle: "Балалардың сөйлеуін, оқуын және дамуын қолдаймыз",
    heroSubtitle:
      "Логопед, психолог, дефектолог және мектепке дайындық. Жеке тәсіл және қамқор мамандар.",
    ctaPrimary: "Жазылу",
    ctaSecondary: "Кеңес алу",
    featuresTitle: "Орталықтың артықшылықтары",
    features: [
      "Жеке сабақ жоспарлары",
      "Баланың жайлы бейімделуі",
      "Тәжірибелі мамандар мен әдістемелер",
      "Ыңғайлы кесте және еске салу"
    ],
    servicesTitle: "Орталық қызметтері",
    servicesSubtitle: "Негізгі бағыттар мен мамандар.",
    services: [
      "Логопед",
      "Психолог",
      "Дефектолог",
      "Мектепке дайындық",
      "Түзету сабақтары"
    ],
    trustTitle: "Нәтиже және қамқорлық",
    trustItems: [
      "Диагностика және жеке ұсыныстар",
      "Ата‑аналарға тұрақты қолдау",
      "Үнемі кері байланыс"
    ],
    processTitle: "Қалай жұмыс істейміз",
    process: [
      "Сайтта өтінім қалдырасыз",
      "Байланысқа шығып, сұранысты нақтылаймыз",
      "Маманды және уақытты ұсынамыз"
    ],
    faqTitle: "Жиі қойылатын сұрақтар",
    faq: [
      {
        q: "Кеңес қанша уақытқа созылады?",
        a: "Әдетте 45–60 минут."
      },
      {
        q: "Сынақ сабағына жазылуға бола ма?",
        a: "Иә, ыңғайлы уақыт ұсынамыз."
      },
      {
        q: "Қаншалықты тез жауап бересіздер?",
        a: "Жұмыс уақытында 15 минут ішінде."
      }
    ],
    footerTitle: "Байланыс",
    footerSubtitle: "Өтінім қалдырыңыз — жақын уақытта хабарласамыз.",
    leadCta: "Өтінім қалдыру",
    supportTitle: "Ата‑аналарға қолдау",
    supportText: "Баланың прогресін түсіндіріп, үй тапсырмаларына кеңес береміз.",
    supportCta: "Кеңес алу"
  },
  en: {
    localeLabel: "EN",
    title: "Child Center — Speech Therapy, Psychology, School Prep",
    description:
      "Child center with speech therapy, psychology, and special education. Personalized programs and easy booking.",
    heroTag: "Child Center",
    heroTitle: "We help children speak, learn, and grow",
    heroSubtitle:
      "Speech therapy, psychology, special education, and school readiness with a caring, individual approach.",
    ctaPrimary: "Book a session",
    ctaSecondary: "Get a consultation",
    featuresTitle: "Why parents choose us",
    features: [
      "Personalized learning plans",
      "Gentle child adaptation",
      "Experienced specialists and methods",
      "Convenient schedule and reminders"
    ],
    servicesTitle: "Center services",
    servicesSubtitle: "Key programs and specialists.",
    services: [
      "Speech therapist",
      "Psychologist",
      "Special educator",
      "School readiness",
      "Corrective classes"
    ],
    trustTitle: "Trust and outcomes",
    trustItems: [
      "Assessment and personalized recommendations",
      "Support for parents at every step",
      "Regular progress feedback"
    ],
    processTitle: "How it works",
    process: [
      "Leave a request on the website",
      "We contact you and clarify your needs",
      "We assign a specialist and a convenient time"
    ],
    faqTitle: "FAQ",
    faq: [
      {
        q: "How long is a consultation?",
        a: "A standard session lasts 45–60 minutes."
      },
      {
        q: "Can I book a trial session?",
        a: "Yes, we can offer a trial at a convenient time."
      },
      {
        q: "How fast do you respond?",
        a: "Usually within 15 minutes during working hours."
      }
    ],
    footerTitle: "Contact",
    footerSubtitle: "Leave a request and we will reach out shortly.",
    leadCta: "Leave a request",
    supportTitle: "Support for parents",
    supportText: "We explain your child’s progress and share home practice tips.",
    supportCta: "Get a consultation"
  }
} as const;

type Locale = keyof typeof content;

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "ru" }, { lang: "kz" }, { lang: "en" }];
}

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  const locale = content[params.lang] ?? content.ru;
  return {
    title: locale.title,
    description: locale.description,
    keywords: [
      "детский центр",
      "логопед",
      "психолог",
      "подготовка к школе",
      "коррекционные занятия"
    ],
    alternates: {
      languages: {
        ru: "/ru",
        en: "/en"
      }
    },
    openGraph: {
      title: locale.title,
      description: locale.description,
      locale: params.lang
    }
  };
}

export default function MarketingPage({ params }: { params: { lang: Locale } }) {
  const locale = content[params.lang] ?? content.ru;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Image
                src="/brand-logo.jpg"
                alt="School Kids"
                width={48}
                height={48}
                className="rounded-full"
              />
              <span className="ml-3 text-xl font-bold text-gray-900">School Kids</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href={`/${params.lang}/about`} className="text-gray-700 hover:text-blue-600">О нас</Link>
              <Link href={`/${params.lang}/services`} className="text-gray-700 hover:text-blue-600">Услуги</Link>
              <Link href={`/${params.lang}/contacts`} className="text-gray-700 hover:text-blue-600">Контакты</Link>
              <Link
                href={`/${params.lang}/contacts#contact`}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Записаться
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {["ru", "kz", "en"].map((lang) => (
                <Link
                  key={lang}
                  href={`/${lang}`}
                  className={
                    lang === params.lang
                      ? "px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium"
                      : "px-3 py-1 rounded-full border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
                  }
                >
                  {content[lang as Locale].localeLabel}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                {locale.heroTag}
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {locale.heroTitle}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {locale.heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/${params.lang}/contacts#contact`}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
                >
                  {locale.ctaPrimary}
                </Link>
                <Link
                  href={`/${params.lang}/contacts#contact`}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition text-lg"
                >
                  {locale.ctaSecondary}
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full aspect-square">
                <Image
                  src="/brand-logo.jpg"
                  alt="School Kids"
                  fill
                  className="rounded-3xl shadow-2xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            {locale.featuresTitle}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {locale.features.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">
                    {idx === 0 && "👨‍🏫"}
                    {idx === 1 && "🎯"}
                    {idx === 2 && "📚"}
                    {idx === 3 && "📈"}
                  </span>
                </div>
                <p className="text-gray-700">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{locale.servicesTitle}</h2>
            <p className="text-xl text-gray-600">{locale.servicesSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locale.services.map((service) => (
              <div key={service} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{service}</h3>
                <Link
                  href={`/${params.lang}/services`}
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                >
                  Подробнее →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href={`/${params.lang}/services`}
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Все услуги и цены
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            {locale.processTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {locale.process.map((step, index) => (
              <div key={step} className="relative">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {index + 1}
                  </div>
                </div>
                <p className="text-lg text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            {locale.trustTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {locale.trustItems.map((item) => (
              <div key={item} className="bg-white/10 backdrop-blur rounded-2xl p-8 text-white">
                <p className="text-lg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            {locale.faqTitle}
          </h2>
          <div className="space-y-6">
            {locale.faq.map((item) => (
              <div key={item.q} className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="contact" className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {locale.footerTitle}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {locale.footerSubtitle}
          </p>
          <Link
            href={`/${params.lang}/contacts#contact`}
            className="inline-block bg-white text-blue-600 px-10 py-5 rounded-lg font-semibold hover:bg-blue-50 transition text-lg"
          >
            {locale.leadCta}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Image
                  src="/brand-logo.jpg"
                  alt="School Kids"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="ml-3 text-white font-bold">School Kids</span>
              </div>
              <p className="text-sm">
                Детский центр развития в Караганде
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Навигация</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href={`/${params.lang}/about`} className="hover:text-white">О нас</Link></li>
                <li><Link href={`/${params.lang}/services`} className="hover:text-white">Услуги</Link></li>
                <li><Link href={`/${params.lang}/contacts`} className="hover:text-white">Контакты</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Контакты</h3>
              <ul className="space-y-2 text-sm">
                <li>+7 (708) 205-03-18</li>
                <li>+7 (778) 654-52-58 (WhatsApp)</li>
                <li>info@schoolkids.kz</li>
                <li>г. Караганда, ул. Язева, 9</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">График работы</h3>
              <ul className="space-y-2 text-sm">
                <li>Пн-Пт: 9:00 - 19:00</li>
                <li>Суббота: 10:00 - 16:00</li>
                <li>Воскресенье: выходной</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; 2024 School Kids. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
