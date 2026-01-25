import Topbar from "@/app/components/Topbar";
import { fetchJson } from "@/app/lib/api";

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
      <section className="card">
        <h3 className="text-lg font-semibold mb-4">Быстрый доступ</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/crm/leads" className="rounded-xl bg-blue-50 p-4 hover:bg-blue-100 transition-colors">
            <p className="text-sm font-medium text-blue-900">Лиды</p>
          </a>
          <a href="/crm/deals" className="rounded-xl bg-green-50 p-4 hover:bg-green-100 transition-colors">
            <p className="text-sm font-medium text-green-900">Сделки</p>
          </a>
          <a href="/crm/bookings" className="rounded-xl bg-purple-50 p-4 hover:bg-purple-100 transition-colors">
            <p className="text-sm font-medium text-purple-900">Записи</p>
          </a>
          <a href="/crm/analytics" className="rounded-xl bg-orange-50 p-4 hover:bg-orange-100 transition-colors">
            <p className="text-sm font-medium text-orange-900">Аналитика</p>
          </a>
        </div>
      </section>
    </div>
  );
}
