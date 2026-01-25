import PageHeader from "@/app/components/PageHeader";
import { fetchJson } from "@/app/lib/api";

interface Summary {
  leads: number;
  deals: number;
  revenue: number;
  avgCheck: number;
  revenuePlan: number;
}

interface UTMRow {
  utm: string;
  leads: number;
}

export default async function AnalyticsPage() {
  const summary = await fetchJson<Summary>("/crm/analytics/summary", undefined, {
    leads: 0,
    deals: 0,
    revenue: 0,
    avgCheck: 0,
    revenuePlan: 0
  });
  const utmReport = await fetchJson<UTMRow[]>("/crm/analytics/utm", undefined, []);
  const metrics = [
    { label: "Лиды", value: summary.leads.toString() },
    { label: "Сделки", value: summary.deals.toString() },
    { label: "Выручка", value: `${summary.revenue.toLocaleString("ru-RU")} ₸` },
    { label: "Средний чек", value: `${summary.avgCheck.toLocaleString("ru-RU")} ₸` }
  ];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Аналитика"
        subtitle={`План выручки: ${summary.revenuePlan.toLocaleString("ru-RU")} ₸`}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="card">
            <p className="text-xs text-slate-500">{metric.label}</p>
            <p className="metric mt-3">{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="text-xl font-semibold">Эффективность UTM</h2>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">UTM</th>
              <th>Лиды</th>
            </tr>
          </thead>
          <tbody>
            {utmReport.map((row) => (
              <tr key={row.utm} className="border-t border-slate-100">
                <td className="py-3 font-medium text-slate-900">{row.utm}</td>
                <td>{row.leads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
