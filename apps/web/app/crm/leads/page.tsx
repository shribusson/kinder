import PageHeader from "@/app/components/PageHeader";
import SearchForm from "@/app/components/SearchForm";
import ExportLink from "@/app/crm/components/ExportLink";
import LeadsTable from "./components/LeadsTable";
import { fetchJson } from "@/app/lib/api";

interface Lead {
  id: string;
  name: string;
  source: string;
  stage: string;
  phone?: string;
  email?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
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
      <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-4 shadow-sm ring-1 ring-slate-100">
        <SearchForm placeholder="Поиск по имени, телефону, email" />
      </div>
      <LeadsTable initialLeads={leads} />
    </div>
  );
}
