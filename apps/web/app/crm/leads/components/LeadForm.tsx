'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  source: string;
  stage: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

interface LeadFormProps {
  lead?: Lead;
  onSuccess: () => void;
  onCancel: () => void;
}

const LEAD_STAGES = [
  { value: 'new', label: 'Новый' },
  { value: 'contacted', label: 'Связались' },
  { value: 'qualified', label: 'Квалифицирован' },
  { value: 'trial_booked', label: 'Записан на диагностику' },
  { value: 'attended', label: 'Диагностика проведена' },
  { value: 'won', label: 'Выигран' },
  { value: 'lost', label: 'Потерян' },
];

const LEAD_SOURCES = [
  { value: 'website', label: 'Сайт' },
  { value: 'instagram', label: 'Instagram' },
  { value: '2gis', label: '2GIS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'phone', label: 'Телефон' },
  { value: 'referral', label: 'Рекомендация' },
  { value: 'other', label: 'Другое' },
];

export default function LeadForm({ lead, onSuccess, onCancel }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    phone: lead?.phone || '',
    email: lead?.email || '',
    source: lead?.source || '',
    stage: lead?.stage || 'new',
    utmSource: lead?.utmSource || '',
    utmMedium: lead?.utmMedium || '',
    utmCampaign: lead?.utmCampaign || '',
    utmContent: lead?.utmContent || '',
    utmTerm: lead?.utmTerm || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUtm, setShowUtm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;

      const url = lead
        ? `${apiBaseUrl}/crm/leads/${lead.id}`
        : `${apiBaseUrl}/crm/leads`;
      const method = lead ? 'PATCH' : 'POST';

      const payload: any = {
        name: formData.name,
        source: formData.source,
        stage: formData.stage,
      };

      if (!lead) {
        payload.accountId = accountId;
      }

      if (formData.phone) payload.phone = formData.phone;
      if (formData.email) payload.email = formData.email;

      // Add UTM data if any field is filled
      if (formData.utmSource || formData.utmMedium || formData.utmCampaign || formData.utmContent || formData.utmTerm) {
        payload.utm = {
          utm_source: formData.utmSource || undefined,
          utm_medium: formData.utmMedium || undefined,
          utm_campaign: formData.utmCampaign || undefined,
          utm_content: formData.utmContent || undefined,
          utm_term: formData.utmTerm || undefined,
        };
      }

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

      toast.success(lead ? 'Лид успешно обновлен!' : 'Лид успешно создан!');
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
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
          Имя *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          placeholder="Иван Иванов"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
          Телефон
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          placeholder="+7 (XXX) XXX-XX-XX"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          placeholder="example@mail.com"
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
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Выберите источник</option>
          {LEAD_SOURCES.map((source) => (
            <option key={source.value} value={source.value}>
              {source.label}
            </option>
          ))}
        </select>
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
          {LEAD_STAGES.map((stage) => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </select>
      </div>

      {/* UTM fields - collapsible */}
      <div className="border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={() => setShowUtm(!showUtm)}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          {showUtm ? '− Скрыть UTM метки' : '+ Добавить UTM метки'}
        </button>

        {showUtm && (
          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="utmSource" className="block text-xs font-medium text-slate-600 mb-1">
                utm_source
              </label>
              <input
                id="utmSource"
                type="text"
                value={formData.utmSource}
                onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="google, instagram, direct"
              />
            </div>
            <div>
              <label htmlFor="utmMedium" className="block text-xs font-medium text-slate-600 mb-1">
                utm_medium
              </label>
              <input
                id="utmMedium"
                type="text"
                value={formData.utmMedium}
                onChange={(e) => setFormData({ ...formData, utmMedium: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="cpc, social, email"
              />
            </div>
            <div>
              <label htmlFor="utmCampaign" className="block text-xs font-medium text-slate-600 mb-1">
                utm_campaign
              </label>
              <input
                id="utmCampaign"
                type="text"
                value={formData.utmCampaign}
                onChange={(e) => setFormData({ ...formData, utmCampaign: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="spring_promo"
              />
            </div>
            <div>
              <label htmlFor="utmContent" className="block text-xs font-medium text-slate-600 mb-1">
                utm_content
              </label>
              <input
                id="utmContent"
                type="text"
                value={formData.utmContent}
                onChange={(e) => setFormData({ ...formData, utmContent: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="banner_1"
              />
            </div>
            <div>
              <label htmlFor="utmTerm" className="block text-xs font-medium text-slate-600 mb-1">
                utm_term
              </label>
              <input
                id="utmTerm"
                type="text"
                value={formData.utmTerm}
                onChange={(e) => setFormData({ ...formData, utmTerm: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="автомастерская караганда"
              />
            </div>
          </div>
        )}
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
          disabled={loading}
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
