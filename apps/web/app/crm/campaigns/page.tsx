import PageHeader from "@/app/components/PageHeader";
import { fetchJson } from "@/app/lib/api";

interface Campaign {
  id: string;
  name: string;
  spend: number;
  leads: number;
}

export default async function CampaignsPage() {
  const campaigns = await fetchJson<Campaign[]>("/crm/campaigns", undefined, []);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Рекламные кампании"
        subtitle="Все источники и расходы"
      />
      <div className="card">
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Канал</th>
              <th>Расход</th>
              <th>Лиды</th>
              <th>CPL</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-t border-slate-100">
                <td className="py-3 font-medium text-slate-900">
                  {campaign.name}
                </td>
                <td>{campaign.spend.toLocaleString("ru-RU")} ₸</td>
                <td>{campaign.leads}</td>
                <td>
                  {campaign.leads ? Math.round(campaign.spend / campaign.leads) : 0} ₸
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
