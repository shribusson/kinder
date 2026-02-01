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

export default async function DealsPage() {
  const deals = await fetchJson<Deal[]>("/crm/deals", undefined, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Сделки"
        subtitle="Канбан по стадиям — перетаскивайте карточки для изменения стадии"
        action={<ExportLink path="/crm/deals/export" label="Экспорт CSV" />}
      />
      <DealsKanban initialDeals={deals} />
    </div>
  );
}
