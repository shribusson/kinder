import PageHeader from "@/app/components/PageHeader";
import ExportLink from "@/app/crm/components/ExportLink";
import DealsKanban from "./components/DealsKanban";
import { fetchJson } from "@/app/lib/api";

interface Deal {
  id: string;
  leadId: string;
  title: string;
  stage: string;
  amount: number;
  revenue?: number;
  lead?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

interface DealsPageProps {
  searchParams?: {
    stage?: string;
    q?: string;
  };
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const params = new URLSearchParams();
  if (searchParams?.stage) {
    params.set("stage", searchParams.stage);
  }
  if (searchParams?.q) {
    params.set("q", searchParams.q);
  }

  const endpoint = params.toString() ? `/crm/deals?${params.toString()}` : "/crm/deals";
  const deals = await fetchJson<Deal[]>(endpoint, undefined, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Заказы"
        subtitle="Канбан по стадиям — перетаскивайте карточки для изменения стадии"
        action={<ExportLink path="/crm/deals/export" label="Экспорт CSV" />}
      />
      <DealsKanban initialDeals={deals} />
    </div>
  );
}
