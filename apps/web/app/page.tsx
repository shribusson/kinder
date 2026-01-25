import Link from "next/link";

const services = [
  "Логопед",
  "Психолог",
  "Дефектолог",
  "Подготовка к школе",
  "Групповые занятия"
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="grid gap-10 rounded-3xl bg-gradient-to-r from-blue-50 to-white p-10 shadow-sm ring-1 ring-slate-100 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Детский центр</p>
          <h1 className="text-4xl font-semibold text-slate-900">School Kids — развитие детей в Караганде</h1>
          <p className="text-lg text-slate-600">
            Помогаем детям говорить чётко, учиться с интересом и развиваться гармонично. Опытные логопеды,
            психологи и педагоги, уютные кабинеты и понятная обратная связь для родителей.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/ru/contacts" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              Оставить заявку
            </Link>
            <Link href="/ru/services" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              Посмотреть услуги
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-2xl bg-white p-5 border border-slate-100">
            <p className="text-sm text-slate-600">Индивидуальные программы и диагностика каждые 4–6 недель</p>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-slate-100">
            <p className="text-sm text-slate-600">Уютные кабинеты, занятия без стресса</p>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-slate-100">
            <p className="text-sm text-slate-600">Обратная связь родителям после каждого визита</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-slate-900">Услуги центра</h2>
        <p className="mt-2 text-sm text-slate-500">Основные направления работы и специалисты.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-800">
              {service}
            </div>
          ))}
        </div>
        <Link href="/ru/services" className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
          Все услуги
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Как пройти первое занятие</h3>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            <li>1. Оставьте заявку — перезвоним и уточним запрос.</li>
            <li>2. Подберем специалиста и удобное время.</li>
            <li>3. Проведем диагностику и дадим рекомендации.</li>
          </ol>
        </div>
        <div className="rounded-2xl border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Контакты</h3>
          <p className="mt-3 text-sm text-slate-600">г. Караганда, ул. Язева, 9</p>
          <p className="text-sm text-slate-600">+7 708 205 03 18</p>
          <p className="text-sm text-slate-600">+7 778 654 52 58 (WhatsApp)</p>
          <p className="text-sm text-slate-600">info@schoolkids.kz</p>
          <Link href="/ru/contacts" className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            Связаться
          </Link>
        </div>
      </section>
    </div>
  );
}
