'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiBaseUrl } from '@/app/lib/api';

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Deal {
  id: string;
  leadId: string;
  title: string;
  stage: string;
  amount: number;
  revenue?: number;
  lead?: Lead;
}

interface DealFormProps {
  deal?: Deal;
  onSuccess: () => void;
  onCancel: () => void;
}

const DEAL_STAGES = [
  { value: 'на_диагностике', label: 'На диагностике' },
  { value: 'запланирована', label: 'Запланирована' },
  { value: 'в_работе', label: 'В работе' },
  { value: 'готова', label: 'Готова' },
  { value: 'закрыта', label: 'Закрыта' },
  { value: 'отменена', label: 'Отменена' },
];

export default function DealForm({ deal, onSuccess, onCancel }: DealFormProps) {
  const [formData, setFormData] = useState({
    leadId: deal?.leadId || '',
    title: deal?.title || '',
    stage: deal?.stage || 'new',
    amount: deal?.amount || 0,
    revenue: deal?.revenue || 0,
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;
        const response = await fetch(`${apiBaseUrl}/crm/leads?accountId=${accountId}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          setLeads(data);
        }
      } catch (err) {
        console.error('Failed to fetch leads:', err);
      } finally {
        setLoadingLeads(false);
      }
    };

    fetchLeads();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;

      const url = deal
        ? `${apiBaseUrl}/crm/deals/${deal.id}`
        : `${apiBaseUrl}/crm/deals`;
      const method = deal ? 'PATCH' : 'POST';

      const payload: any = {
        leadId: formData.leadId,
        title: formData.title,
        stage: formData.stage,
        amount: Number(formData.amount),
      };

      if (!deal) {
        payload.accountId = accountId;
      }

      if (formData.revenue) {
        payload.revenue = Number(formData.revenue);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка сохранения');
      }

      toast.success(deal ? 'Сделка успешно обновлена!' : 'Сделка успешно создана!');
      onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Произошла ошибка';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Lead selection */}
      <div>
        <label htmlFor="leadId" className="block text-sm font-medium text-slate-700 mb-1">
          Лид *
        </label>
        {loadingLeads ? (
          <div className="text-sm text-slate-500">Загрузка лидов...</div>
        ) : (
          <select
            id="leadId"
            value={formData.leadId}
            onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
            required
            disabled={!!deal} // Can't change lead after creation
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:bg-slate-100"
          >
            <option value="">Выберите лида</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name} {lead.phone ? `(${lead.phone})` : ''}
              </option>
            ))}
          </select>
        )}
        {deal && (
          <p className="mt-1 text-xs text-slate-500">
            Лида нельзя изменить после создания сделки
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
          Название сделки *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          placeholder="Курс логопедии 10 занятий"
        />
      </div>

      {/* Stage */}
      <div>
        <label htmlFor="stage" className="block text-sm font-medium text-slate-700 mb-1">
          Стадия
        </label>
        <select
          id="stage"
          value={formData.stage}
          onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          {DEAL_STAGES.map((stage) => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
          Ожидаемая сумма (₸) *
        </label>
        <input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          required
          min="0"
          step="1"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          placeholder="50000"
        />
      </div>

      {/* Revenue */}
      <div>
        <label htmlFor="revenue" className="block text-sm font-medium text-slate-700 mb-1">
          Фактическая выручка (₸)
        </label>
        <input
          id="revenue"
          type="number"
          value={formData.revenue}
          onChange={(e) => setFormData({ ...formData, revenue: Number(e.target.value) })}
          min="0"
          step="1"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          placeholder="45000"
        />
        <p className="mt-1 text-xs text-slate-500">
          Заполните это поле когда сделка будет закрыта
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={loading || loadingLeads}
          className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
