import Topbar from "@/app/components/Topbar";
import { fetchJson } from "@/app/lib/api";

const quickActions = [
  "Проверить заявки сайта",
  "Посмотреть заявки из WhatsApp",
  "Отследить звонки",
  "Сравнить рекламные кампании"
];

export default async function DashboardPage() {
  const summary = await fetchJson<{
    leads: number;
    deals: number;
    revenue: number;
    avgCheck: number;
    revenuePlan: number;
  }>("/crm/analytics/summary", undefined, {
    leads: 0,
    deals: 0,
    revenue: 0,
    avgCheck: 0,
    revenuePlan: 0
  });
  const metrics = [
    { label: "Лиды", value: summary.leads.toString() },
    { label: "Сделки", value: summary.deals.toString() },
    { label: "Средний чек", value: `${summary.avgCheck.toLocaleString("ru-RU")} ₸` },
    { label: "План выручки", value: `${summary.revenuePlan.toLocaleString("ru-RU")} ₸` }
  ];

  return (
    <div className="flex flex-col gap-6">
      <Topbar />
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="card">
            <p className="text-xs text-slate-500">{metric.label}</p>
            <p className="metric mt-3">{metric.value}</p>
          </div>
        ))}
      </section>
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <h3 className="text-lg font-semibold">Сводка по каналам</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { label: "Telegram", value: "—" },
              { label: "WhatsApp", value: "—" },
              { label: "Телефония", value: "—" },
              { label: "Сайт", value: "—" }
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold">Быстрые действия</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {quickActions.map((item) => (
              <li key={item} className="rounded-xl bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="card">
        <h3 className="text-lg font-semibold">План продаж по выручке</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {["Январь", "Февраль", "Март"].map((month) => (
            <div key={month} className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">{month}</p>
              <p className="mt-2 text-xl font-semibold">350 000 ₸</p>
              <p className="mt-1 text-xs text-slate-400">Факт: 280 000 ₸</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
