'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import LeadModal from './LeadModal';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

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

interface LeadsTableProps {
  initialLeads: Lead[];
}

const STAGE_LABELS: Record<string, string> = {
  new: 'Новый',
  contacted: 'Связались',
  qualified: 'Квалифицирован',
  trial_booked: 'Записан на диагностику',
  attended: 'Диагностика проведена',
  won: 'Выигран',
  lost: 'Потерян',
};

const SOURCE_LABELS: Record<string, string> = {
  website: 'Сайт',
  instagram: 'Instagram',
  '2gis': '2GIS',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  phone: 'Телефон',
  referral: 'Рекомендация',
  other: 'Другое',
};

export default function LeadsTable({ initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    refreshLeads();
  }, []);

  const refreshLeads = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/crm/leads`, {
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Failed to refresh leads:', error);
    }
  };

  const handleCreateClick = () => {
    setSelectedLead(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить лида "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`${apiBaseUrl}/crm/leads/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }

      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      toast.success(`Лид "${name}" успешно удален`);
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast.error('Ошибка удаления лида');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = () => {
    refreshLeads();
  };

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-600">
            Всего лидов: <span className="font-semibold text-slate-900">{leads.length}</span>
          </div>
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
          >
            + Создать лида
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Клиент</th>
              <th>Источник</th>
              <th>Статус</th>
              <th>Контакт</th>
              <th className="text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Нет лидов. Создайте первого!
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <Link
                      href={`/crm/leads/${lead.id}`}
                      className="font-medium text-slate-900 hover:text-orange-600 transition-colors"
                    >
                      {lead.name}
                    </Link>
                  </td>
                  <td className="text-slate-600">
                    {SOURCE_LABELS[lead.source] || lead.source}
                  </td>
                  <td>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      lead.stage === 'won'
                        ? 'bg-green-100 text-green-700'
                        : lead.stage === 'lost'
                        ? 'bg-red-100 text-red-700'
                        : lead.stage === 'new'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {STAGE_LABELS[lead.stage] || lead.stage}
                    </span>
                  </td>
                  <td className="text-slate-500">
                    {lead.phone || lead.email || '—'}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(lead)}
                        className="rounded p-1 text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        title="Редактировать"
                      >
                        <IconEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(lead.id, lead.name)}
                        disabled={deletingId === lead.id}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Удалить"
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <LeadModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
