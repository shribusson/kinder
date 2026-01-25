import PageHeader from "@/app/components/PageHeader";
import ExportLink from "@/app/crm/components/ExportLink";
import { fetchJson } from "@/app/lib/api";

interface Deal {
  id: string;
  title: string;
  stage: string;
  amount: number;
}

export default async function DealsPage() {
  const deals = await fetchJson<Deal[]>("/crm/deals", undefined, []);
  const grouped = deals.reduce<Record<string, Deal[]>>((acc, deal) => {
    acc[deal.stage] = acc[deal.stage] ?? [];
    acc[deal.stage].push(deal);
    return acc;
  }, {});
  const stages = Object.entries(grouped);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Сделки"
        subtitle="Канбан по стадиям"
        action={<ExportLink path="/crm/deals/export" label="Экспорт CSV" />}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {stages.map(([stage, items]) => (
          <div key={stage} className="card">
            <h3 className="text-sm font-semibold text-slate-600">{stage}</h3>
            <div className="mt-4 space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                >
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.amount} ₸</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {stages.length === 0 ? (
          <div className="card">Нет сделок</div>
        ) : null}
      </div>
    </div>
  );
}
