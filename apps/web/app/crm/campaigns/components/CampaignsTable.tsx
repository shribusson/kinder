'use client';

import { useState } from 'react';
import { IconEdit, IconTrash, IconTrendingUp, IconPlus } from '@tabler/icons-react';
import CampaignModal from './CampaignModal';
import { apiBaseUrl } from '@/app/lib/api';

interface Campaign {
  id: string;
  name: string;
  source: string;
  spend: number;
  leads: number;
  createdAt: string;
  updatedAt: string;
}

interface CampaignsTableProps {
  initialCampaigns: Campaign[];
}

const SOURCE_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  '2gis': '2GIS',
  google: 'Google Ads',
  facebook: 'Facebook Ads',
  yandex: 'Яндекс.Директ',
  vk: 'VK Реклама',
  telegram: 'Telegram Ads',
  referral: 'Реферальная программа',
  other: 'Другое',
};

export default function CampaignsTable({ initialCampaigns }: CampaignsTableProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refreshCampaigns = async () => {
    try {
      const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;
      const response = await fetch(`${apiBaseUrl}/crm/campaigns?accountId=${accountId}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Failed to refresh campaigns:', error);
    }
  };

  const handleCreateClick = () => {
    setSelectedCampaign(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить кампанию "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`${apiBaseUrl}/crm/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }

      setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      alert('Ошибка удаления кампании');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = () => {
    refreshCampaigns();
  };

  // Calculate totals
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0);
  const avgCPL = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;

  // Sort by spend descending
  const sortedCampaigns = [...campaigns].sort((a, b) => b.spend - a.spend);

  return (
    <>
      <div className="card">
        {/* Header with stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm text-slate-500">Всего расход</div>
              <div className="text-2xl font-bold text-slate-900">
                {totalSpend.toLocaleString('ru-RU')} ₸
              </div>
            </div>
            <div className="h-12 w-px bg-slate-200" />
            <div>
              <div className="text-sm text-slate-500">Всего лидов</div>
              <div className="text-2xl font-bold text-blue-600">
                {totalLeads}
              </div>
            </div>
            <div className="h-12 w-px bg-slate-200" />
            <div>
              <div className="text-sm text-slate-500">Средний CPL</div>
              <div className="text-2xl font-bold text-green-600">
                {avgCPL.toLocaleString('ru-RU')} ₸
              </div>
            </div>
          </div>
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <IconPlus size={16} />
            Добавить кампанию
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Кампания
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Источник
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Расход
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Лиды
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  CPL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  ROI
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {sortedCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <IconTrendingUp size={48} className="text-slate-300" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          Нет рекламных кампаний
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Создайте первую кампанию для отслеживания расходов и эффективности
                        </p>
                        <button
                          onClick={handleCreateClick}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                        >
                          <IconPlus size={16} />
                          Добавить кампанию
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedCampaigns.map((campaign) => {
                  const cpl = campaign.leads > 0 ? Math.round(campaign.spend / campaign.leads) : 0;
                  // Rough ROI estimation (assuming avg deal value of 50000 KZT and 20% conversion)
                  const estimatedRevenue = campaign.leads * 50000 * 0.2;
                  const roi = campaign.spend > 0 ? Math.round(((estimatedRevenue - campaign.spend) / campaign.spend) * 100) : 0;

                  return (
                    <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{campaign.name}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(campaign.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {SOURCE_LABELS[campaign.source] || campaign.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-900">
                          {campaign.spend.toLocaleString('ru-RU')} ₸
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-600">
                          {campaign.leads}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${
                          cpl < 2000 ? 'text-green-600' : cpl < 3000 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {cpl.toLocaleString('ru-RU')} ₸
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${
                          roi > 100 ? 'text-green-600' : roi > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {roi > 0 ? '+' : ''}{roi}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(campaign)}
                            className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Редактировать"
                          >
                            <IconEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(campaign.id, campaign.name)}
                            disabled={deletingId === campaign.id}
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Удалить"
                          >
                            <IconTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Info note */}
        {sortedCampaigns.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Примечание:</strong> ROI рассчитывается приблизительно на основе средней стоимости сделки 50,000 ₸ и конверсии в продажу 20%.
              Фактические показатели могут отличаться.
            </p>
          </div>
        )}
      </div>

      <CampaignModal
        campaign={selectedCampaign}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
