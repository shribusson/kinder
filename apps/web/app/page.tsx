import Link from "next/link";

const features = [
  "Онлайн‑запись к специалистам и контроль загрузки",
  "Сквозная аналитика рекламы и UTM‑источников",
  "Канбан сделок и автоматизация работы менеджеров",
  "Интеграции: Telegram, WhatsApp, телефония, сайт"
];

const services = [
  "Логопед",
  "Психолог",
  "Дефектолог",
  "Подготовка к школе",
  "Коррекционные занятия"
];

export default function MarketingPage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="grid gap-8 rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-100 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
            Детский центр
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Полноценный сайт и CRM для роста записей и выручки
          </h1>
          <p className="text-lg text-slate-600">
            Продающий сайт, воронка лидов и интеграции с мессенджерами — всё в одном месте. Удобно
            для владельца и менеджеров.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/site"
              className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Оставить заявку
            </Link>
            <Link
              href="/crm"
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Войти в CRM
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          {features.map((feature) => (
            <div key={feature} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              {feature}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="text-2xl font-semibold text-slate-900">Услуги центра</h2>
          <p className="mt-2 text-sm text-slate-500">
            Основные направления работы и специалисты.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <div key={service} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                {service}
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900">Быстрая запись</h3>
          <p className="mt-2 text-sm text-slate-500">
            Оставьте заявку и мы подберем удобное время.
          </p>
          <Link
            href="/site"
            className="mt-6 inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Записаться
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900">Как мы работаем</h3>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            <li>1. Получаем заявку с сайта или мессенджера.</li>
            <li>2. Менеджер уточняет запрос и подбирает специалиста.</li>
            <li>3. Вы записываетесь на удобное время и получаете напоминание.</li>
          </ol>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900">Прозрачная статистика</h3>
          <p className="mt-3 text-sm text-slate-600">
            Отслеживайте эффективность рекламы, конверсию и средний чек прямо в CRM.
          </p>
          <Link
            href="/crm/analytics"
            className="mt-6 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Посмотреть аналитику
          </Link>
        </div>
      </section>
    </div>
  );
}
