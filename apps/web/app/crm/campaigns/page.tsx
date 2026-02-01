import PageHeader from "@/app/components/PageHeader";
import { fetchJson } from "@/app/lib/api";
import CampaignsTable from "./components/CampaignsTable";

interface Campaign {
  id: string;
  name: string;
  source: string;
  spend: number;
  leads: number;
  createdAt: string;
  updatedAt: string;
}

export default async function CampaignsPage() {
  const campaigns = await fetchJson<Campaign[]>("/crm/campaigns", undefined, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Рекламные кампании"
        subtitle="Отслеживайте эффективность рекламных каналов и расходы"
      />
      <CampaignsTable initialCampaigns={campaigns} />
    </div>
  );
}
