'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/app/components/Modal';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

interface Campaign {
  id: string;
  name: string;
  source: string;
  spend: number;
  leads: number;
  createdAt: string;
  updatedAt: string;
}

interface CampaignModalProps {
  campaign?: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CAMPAIGN_SOURCES = [
  { value: 'instagram', label: 'Instagram' },
  { value: '2gis', label: '2GIS' },
  { value: 'google', label: 'Google Ads' },
  { value: 'facebook', label: 'Facebook Ads' },
  { value: 'yandex', label: 'Яндекс.Директ' },
  { value: 'vk', label: 'VK Реклама' },
  { value: 'telegram', label: 'Telegram Ads' },
  { value: 'referral', label: 'Реферальная программа' },
  { value: 'other', label: 'Другое' },
];

export default function CampaignModal({ campaign, isOpen, onClose, onSuccess }: CampaignModalProps) {
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    source: campaign?.source || 'instagram',
    spend: campaign?.spend?.toString() || '0',
    leads: campaign?.leads?.toString() || '0',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;

      const url = campaign
        ? `${apiBaseUrl}/crm/campaigns/${campaign.id}`
        : `${apiBaseUrl}/crm/campaigns`;
      const method = campaign ? 'PATCH' : 'POST';

      const payload: any = {
        name: formData.name,
        source: formData.source,
        spend: parseFloat(formData.spend),
        leads: parseInt(formData.leads),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка сохранения');
      }

      toast.success(campaign ? 'Кампания успешно обновлена!' : 'Кампания успешно создана!');
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Произошла ошибка';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cpl = formData.leads && parseInt(formData.leads) > 0
    ? Math.round(parseFloat(formData.spend) / parseInt(formData.leads))
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={campaign ? 'Редактировать кампанию' : 'Добавить кампанию'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Название кампании *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder="Летняя акция Instagram"
          />
        </div>

        {/* Source */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-slate-700 mb-1">
            Источник *
          </label>
          <select
            id="source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            {CAMPAIGN_SOURCES.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Spend */}
          <div>
            <label htmlFor="spend" className="block text-sm font-medium text-slate-700 mb-1">
              Расход (₸) *
            </label>
            <input
              id="spend"
              type="number"
              min="0"
              step="0.01"
              value={formData.spend}
              onChange={(e) => setFormData({ ...formData, spend: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="50000"
            />
          </div>

          {/* Leads */}
          <div>
            <label htmlFor="leads" className="block text-sm font-medium text-slate-700 mb-1">
              Лиды (шт) *
            </label>
            <input
              id="leads"
              type="number"
              min="0"
              step="1"
              value={formData.leads}
              onChange={(e) => setFormData({ ...formData, leads: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="25"
            />
          </div>
        </div>

        {/* CPL Calculation */}
        {cpl > 0 && (
          <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-900">
                Стоимость лида (CPL):
              </span>
              <span className="text-lg font-bold text-orange-600">
                {cpl.toLocaleString()} ₸
              </span>
            </div>
          </div>
        )}

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
            disabled={loading}
            className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  );
}
