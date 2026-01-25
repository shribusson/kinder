import Link from "next/link";
import type { Metadata } from "next";

const content = {
  ru: {
    localeLabel: "Рус",
    title: "Детский центр — логопед, психолог, подготовка к школе",
    description:
      "Детский центр: логопед, психолог, дефектолог. Индивидуальные программы, заботливые специалисты и удобная запись.",
    heroTag: "Детский центр",
    heroTitle: "Помогаем детям говорить, учиться и развиваться",
    heroSubtitle:
      "Логопед, психолог, дефектолог и подготовка к школе. Индивидуальные программы и бережное сопровождение.",
    ctaPrimary: "Записаться",
    ctaSecondary: "Получить консультацию",
    featuresTitle: "Преимущества центра",
    features: [
      "Индивидуальные планы занятий",
      "Комфортная адаптация ребёнка",
      "Опытные специалисты и методики",
      "Удобный график и напоминания"
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
    <div className="flex flex-col gap-16">
      <header className="flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center gap-3">
          <img
            src="/brand-logo.jpg"
            alt="School Kids"
            className="h-10 w-10 rounded-xl object-cover"
          />
          <div className="text-sm font-semibold text-slate-800">School Kids</div>
        </div>
        <div className="flex gap-2 text-sm">
          {["ru", "kz", "en"].map((lang) => (
            <Link
              key={lang}
              href={`/${lang}`}
              className={
                lang === params.lang
                  ? "rounded-full bg-brand-600 px-3 py-1 text-white"
                  : "rounded-full border border-slate-200 px-3 py-1 text-slate-600"
              }
            >
              {content[lang as Locale].localeLabel}
            </Link>
          ))}
        </div>
      </header>

      <section className="grid gap-8 rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-100 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
            {locale.heroTag}
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">{locale.heroTitle}</h1>
          <p className="text-lg text-slate-600">{locale.heroSubtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${params.lang}/site`}
              className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
            >
              {locale.ctaPrimary}
            </Link>
            <Link
              href={`/${params.lang}/site`}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              {locale.ctaSecondary}
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          {locale.features.map((feature) => (
            <div key={feature} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              {feature}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="text-2xl font-semibold text-slate-900">{locale.servicesTitle}</h2>
          <p className="mt-2 text-sm text-slate-500">{locale.servicesSubtitle}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {locale.services.map((service) => (
              <div key={service} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                {service}
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900">{locale.trustTitle}</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {locale.trustItems.map((item) => (
              <li key={item} className="rounded-xl bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900">{locale.processTitle}</h3>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            {locale.process.map((step, index) => (
              <li key={step}>{index + 1}. {step}</li>
            ))}
          </ol>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900">{locale.faqTitle}</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {locale.faq.map((item) => (
              <div key={item.q} className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="font-medium text-slate-900">{item.q}</p>
                <p className="mt-1 text-slate-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900">{locale.supportTitle}</h3>
          <p className="mt-3 text-sm text-slate-600">{locale.supportText}</p>
        </div>
        <div className="card flex flex-col items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">School Kids</p>
            <h4 className="mt-2 text-xl font-semibold text-slate-900">{locale.ctaPrimary}</h4>
          </div>
          <Link
            href={`/${params.lang}/site`}
            className="inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {locale.supportCta}
          </Link>
        </div>
      </section>

      <section className="card flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-slate-900">{locale.footerTitle}</h3>
        <p className="text-sm text-slate-600">{locale.footerSubtitle}</p>
        <Link
          href={`/${params.lang}/site`}
          className="inline-flex w-fit rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {locale.leadCta}
        </Link>
      </section>
    </div>
  );
}
