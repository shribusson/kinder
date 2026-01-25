import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

const content = {
  ru: {
    localeLabel: "Рус",
    title: "School Kids — детский центр развития в Караганде",
    description:
      "Детский центр School Kids: логопед, психолог, дефектолог, подготовка к школе. ✓ Опытные педагоги ✓ Индивидуальный подход ✓ Современные методики ✓ Уютная атмосфера. Записаться на пробное занятие!",
    heroTitle: "Развитие детей через игру и профессионализм",
    heroSubtitle:
      "Логопед, психолог, дефектолог и подготовка к школе. Опытные педагоги, индивидуальный подход, видимый результат.",
    ctaPrimary: "Записаться",
    ctaSecondary: "Консультация",
    aboutTitle: "О центре",
    aboutText: "School Kids — это место, где каждый ребёнок раскрывает свой потенциал. Мы работаем с малышами от 2 лет и помогаем им развиваться гармонично через индивидуальные и групповые занятия.",
    servicesTitle: "Наши услуги",
    services: [
      { name: "Логопед", desc: "Коррекция речи и развитие артикуляции" },
      { name: "Психолог", desc: "Развитие эмоционального интеллекта" },
      { name: "Дефектолог", desc: "Помощь детям с особенностями развития" },
      { name: "Подготовка к школе", desc: "Подготовка к обучению в школе" },
      { name: "Групповые занятия", desc: "Развитие социальных навыков" },
      { name: "Онлайн-консультации", desc: "Удаленное консультирование" }
    ],
    whyTitle: "Почему выбирают School Kids",
    whyItems: [
      { title: "Опытные специалисты", text: "Педагоги с опытом от 5 лет" },
      { title: "Индивидуальный подход", text: "Программа для каждого ребенка" },
      { title: "Результаты видны", text: "Диагностика каждые 4-6 недель" },
      { title: "Удобное время", text: "Гибкий график с 9:00 до 19:00" }
    ],
    processTitle: "Как начать",
    process: [
      { num: "1", title: "Оставьте заявку", text: "Или позвоните нам" },
      { num: "2", title: "Первичная консультация", text: "Обсуждаем потребности" },
      { num: "3", title: "Начинаем занятия", text: "Индивидуальное или групповое" }
    ],
    testimonial: "Спасибо за помощь нашему сыну! За несколько месяцев он начал говорить намного лучше.",
    contactTitle: "Контактная информация",
    address: "г. Караганда, ул. Язева, 9",
    phone: "+7 708 205 03 18",
    whatsapp: "+7 778 654 52 58",
    email: "info@schoolkids.kz",
    hours: "Пн-Пт: 9:00-19:00 | Сб: 10:00-16:00",
    footerText: "Развитие ребёнка — инвестиция в его будущее"
  },
  kz: {
    localeLabel: "Қаз",
    title: "Балалар орталығы — логопед, психолог",
    description: "Балалар орталығы: логопед, психолог, дефектолог. Жеке бағдарламалар және ыңғайлы жазылу.",
    heroTitle: "Балалардың дамуы — олардың болашағына инвестиция",
    heroSubtitle: "Логопед, психолог, дефектолог және мектепке дайындық. Жеке тәсіл және қамқор мамандар.",
    ctaPrimary: "Жазылу",
    ctaSecondary: "Кеңес",
    aboutTitle: "Орталық туралы",
    aboutText: "School Kids — балалардың өндіктерін ашатын орын. Мамандар өндіктеу болып табылады.",
    servicesTitle: "Қызметтеріміз",
    services: [
      { name: "Логопед", desc: "Сөйлеу коррекциясы" },
      { name: "Психолог", desc: "Эмоционалды белсенділік" },
      { name: "Дефектолог", desc: "Ерекше балаларға көмек" },
      { name: "Мектепке дайындық", desc: "Оқуға дайындық" },
      { name: "Топ сабақтары", desc: "Әлеуметтік дағдылар" },
      { name: "Онлайн кеңес", desc: "Қашықтағы консультирование" }
    ],
    whyTitle: "Неге School Kids таңдайды",
    whyItems: [
      { title: "Тәжірибелі мамандар", text: "5 жылдан астам тәжірибе" },
      { title: "Жеке бағдарлама", text: "Әр балаға арнайтылған" },
      { title: "Нәтижелер көрінеді", text: "Диагностика әр 4-6 аптада" },
      { title: "Ыңғайлы уақыт", text: "9:00-тен 19:00-ге дейін" }
    ],
    processTitle: "Қалай басқу керек",
    process: [
      { num: "1", title: "Өтінім қалдырыңыз", text: "Немесе бізге қоңырау шалыңыз" },
      { num: "2", title: "Бірінші консультация", text: "Қажеттіліктерді талқылаймыз" },
      { num: "3", title: "Сабақты бастаймыз", text: "Жеке немесе топты" }
    ],
    testimonial: "Ұлымызға көмек бергені үшін рахмет! Бірнеше айда ол әлде де жақсы сөйлей бастады.",
    contactTitle: "Байланыс ақпараты",
    address: "г. Караганда, ул. Язева, 9",
    phone: "+7 708 205 03 18",
    whatsapp: "+7 778 654 52 58",
    email: "info@schoolkids.kz",
    hours: "Дс-Джм: 9:00-19:00 | Сб: 10:00-16:00",
    footerText: "Балалардың дамуы — олардың болашағына инвестиция"
  },
  en: {
    localeLabel: "EN",
    title: "School Kids — Child Development Center",
    description: "Speech therapy, psychology, special education. Professional approach, individual programs.",
    heroTitle: "Your Child's Development is Our Mission",
    heroSubtitle: "Speech therapy, psychology, special education, and school preparation. Experienced teachers, individual approach, visible results.",
    ctaPrimary: "Enroll",
    ctaSecondary: "Consultation",
    aboutTitle: "About us",
    aboutText: "School Kids is a place where every child reveals their potential. We work with children from age 2 and help them develop harmoniously through individual and group classes.",
    servicesTitle: "Our Services",
    services: [
      { name: "Speech Therapy", desc: "Speech correction and articulation development" },
      { name: "Psychology", desc: "Emotional intelligence development" },
      { name: "Special Education", desc: "Support for children with special needs" },
      { name: "School Preparation", desc: "Preparing for school education" },
      { name: "Group Classes", desc: "Social skills development" },
      { name: "Online Consultations", desc: "Remote consultations" }
    ],
    whyTitle: "Why Choose School Kids",
    whyItems: [
      { title: "Experienced Specialists", text: "Teachers with 5+ years experience" },
      { title: "Individual Approach", text: "Program tailored for each child" },
      { title: "Visible Results", text: "Assessment every 4-6 weeks" },
      { title: "Convenient Schedule", text: "Flexible hours from 9 AM to 7 PM" }
    ],
    processTitle: "How to Start",
    process: [
      { num: "1", title: "Leave a Request", text: "Or call us directly" },
      { num: "2", title: "Initial Consultation", text: "Discuss your child's needs" },
      { num: "3", title: "Begin Classes", text: "Individual or group" }
    ],
    testimonial: "Thank you for helping our son! In just a few months, his speech improved significantly.",
    contactTitle: "Contact Information",
    address: "Karaganda, Yazeva St., 9",
    phone: "+7 708 205 03 18",
    whatsapp: "+7 778 654 52 58",
    email: "info@schoolkids.kz",
    hours: "Mon-Fri: 9:00-19:00 | Sat: 10:00-16:00",
    footerText: "Your child's development is an investment in their future"
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
    openGraph: {
      title: locale.title,
      description: locale.description
    }
  };
}

export default function MarketingPage({ params }: { params: { lang: Locale } }) {
  const locale = content[params.lang] ?? content.ru;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${params.lang}`} className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="relative w-14 h-14 bg-gradient-to-br from-yellow-300 to-green-400 rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/brand-logo.jpg"
                alt="School Kids"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-gray-900">School Kids</h1>
              <p className="text-xs text-gray-500 font-medium">Развитие детей</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href={`/${params.lang}/#about`} className="text-gray-700 hover:text-blue-600 font-medium transition">
              {locale.aboutTitle}
            </Link>
            <Link href={`/${params.lang}/#services`} className="text-gray-700 hover:text-blue-600 font-medium transition">
              {locale.servicesTitle}
            </Link>
            <Link href={`/${params.lang}/#contact`} className="text-gray-700 hover:text-blue-600 font-medium transition">
              {locale.contactTitle}
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-2 border-r pr-4">
              <Link href="/ru" className={`px-2 py-1 rounded text-xs font-bold transition ${params.lang === "ru" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}>
                РУС
              </Link>
              <Link href="/kz" className={`px-2 py-1 rounded text-xs font-bold transition ${params.lang === "kz" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}>
                ҚАЗ
              </Link>
              <Link href="/en" className={`px-2 py-1 rounded text-xs font-bold transition ${params.lang === "en" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}>
                EN
              </Link>
            </div>
            <Link
              href={`/${params.lang}/#contact`}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition whitespace-nowrap"
            >
              {locale.ctaPrimary}
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20 pb-32">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-gradient-to-br from-blue-200 to-green-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-yellow-200 to-blue-200 rounded-full opacity-20 blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-4">Детский центр развития</p>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {locale.heroTitle}
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {locale.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/${params.lang}/#contact`}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition text-center"
                >
                  {locale.ctaPrimary}
                </Link>
                <Link
                  href="tel:+77082050318"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold hover:border-blue-600 hover:text-blue-600 transition text-center"
                >
                  {locale.contactTitle}
                </Link>
              </div>
              <p className="text-gray-500 mt-6 flex items-center gap-2">
                <span className="text-2xl">⭐</span> 4.8/5 (35 отзывов на 2GIS)
              </p>
            </div>
            <div className="relative hidden md:block">
              <div className="relative w-full h-96 bg-gradient-to-br from-yellow-300 to-green-400 rounded-2xl shadow-2xl overflow-hidden">
                <Image
                  src="/brand-logo.jpg"
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
                  src="/brand-logo.jpg"
                  alt="School Kids"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">{locale.aboutTitle}</h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {locale.aboutText}
              </p>
              <div className="space-y-4">
                {locale.whyItems.map((item) => (
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
            <h3 className="text-4xl font-bold text-gray-900 mb-4">{locale.servicesTitle}</h3>
            <p className="text-xl text-gray-600">Профессиональная помощь в развитии вашего ребёнка</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {locale.services.map((service) => (
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
          <h3 className="text-4xl font-bold text-gray-900 text-center mb-16">{locale.processTitle}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {locale.process.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mb-6 mx-auto">
                  {step.num}
                </div>
                <h4 className="text-xl font-bold text-gray-900 text-center mb-2">{step.title}</h4>
                <p className="text-gray-600 text-center">{step.text}</p>
                {idx < locale.process.length - 1 && (
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
          <p className="text-3xl text-white font-bold mb-6 italic">&quot;{locale.testimonial}&quot;</p>
          <p className="text-blue-100 font-semibold">&mdash; Родитель</p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-gray-900 text-center mb-16">{locale.contactTitle}</h3>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 text-xl">
                  📍
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Адрес</p>
                  <p className="text-lg font-bold text-gray-900">{locale.address}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 text-green-600 text-xl">
                  📞
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Телефон</p>
                  <a href={`tel:+77082050318`} className="text-lg font-bold text-blue-600 hover:underline">
                    {locale.phone}
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 text-xl">
                  💬
                </div>
                <div>
                  <p className="text-gray-500 text-sm">WhatsApp</p>
                  <a href={`https://wa.me/77786545258`} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-blue-600 hover:underline">
                    {locale.whatsapp}
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 text-purple-600 text-xl">
                  ✉️
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <a href={`mailto:${locale.email}`} className="text-lg font-bold text-blue-600 hover:underline">
                    {locale.email}
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 text-orange-600 text-xl">
                  🕐
                </div>
                <div>
                  <p className="text-gray-500 text-sm">График работы</p>
                  <p className="text-lg font-bold text-gray-900">{locale.hours}</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-2xl">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Ваше имя"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600"
                />
                <input
                  type="tel"
                  placeholder="Телефон"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600"
                />
                <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600">
                  <option>Логопед</option>
                  <option>Психолог</option>
                  <option>Дефектолог</option>
                  <option>Подготовка к школе</option>
                </select>
                <textarea
                  rows={4}
                  placeholder="Расскажите о вашем ребенке..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-lg font-bold hover:shadow-lg transition"
                >
                  {locale.ctaPrimary}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-semibold text-white mb-2">{locale.footerText}</p>
          <p className="text-sm">&copy; 2024-2025 School Kids. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
