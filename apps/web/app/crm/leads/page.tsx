import PageHeader from "@/app/components/PageHeader";
import SearchForm from "@/app/components/SearchForm";
import ExportLink from "@/app/crm/components/ExportLink";
import { fetchJson } from "@/app/lib/api";

interface Lead {
  id: string;
  name: string;
  source: string;
  stage: string;
  phone?: string;
  email?: string;
}

export default async function LeadsPage({
  searchParams
}: {
  searchParams?: { q?: string };
}) {
  const query = searchParams?.q ? `?q=${encodeURIComponent(searchParams.q)}` : "";
  const leads = await fetchJson<Lead[]>(`/crm/leads${query}`, undefined, []);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Лиды"
        subtitle="Все входящие обращения и источники"
        action={<ExportLink path="/crm/leads/export" label="Экспорт CSV" />}
      />
      <div className="card">
        <div className="flex items-center gap-4">
          <SearchForm placeholder="Поиск по имени, телефону, email" />
        </div>
        <table className="mt-4 w-full text-sm">
        <thead className="text-left text-slate-500">
          <tr>
            <th className="py-2">Клиент</th>
            <th>Источник</th>
            <th>Статус</th>
            <th>Контакт</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.name} className="border-t border-slate-100">
              <td className="py-3 font-medium text-slate-900">{lead.name}</td>
              <td>{lead.source}</td>
              <td>{lead.stage}</td>
              <td className="text-slate-500">
                {lead.phone ?? lead.email ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
