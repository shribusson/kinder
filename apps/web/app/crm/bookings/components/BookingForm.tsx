'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { apiBaseUrl } from '@/app/lib/api';

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

interface Booking {
  id: string;
  leadId: string;
  specialist: string;
  resourceId?: string;
  scheduledAt: string;
  status: string;
  lead?: Lead;
  resource?: Resource;
}

interface BookingFormProps {
  booking?: Booking;
  onSuccess: () => void;
  onCancel: () => void;
}

const BOOKING_STATUSES = [
  { value: 'SCHEDULED', label: 'Запланировано' },
  { value: 'CONFIRMED', label: 'Подтверждено' },
  { value: 'COMPLETED', label: 'Завершено' },
  { value: 'CANCELLED', label: 'Отменено' },
  { value: 'NO_SHOW', label: 'Не пришел' },
];

export default function BookingForm({ booking, onSuccess, onCancel }: BookingFormProps) {
  const [formData, setFormData] = useState({
    leadId: booking?.leadId || '',
    resourceId: booking?.resourceId || '',
    specialist: booking?.specialist || '',
    scheduledAt: booking?.scheduledAt ? new Date(booking.scheduledAt) : new Date(),
    status: booking?.status || 'SCHEDULED',
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;

        const [leadsResponse, resourcesResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/crm/leads?accountId=${accountId}`, { cache: 'no-store' }),
          fetch(`${apiBaseUrl}/crm/resources?accountId=${accountId}`, { cache: 'no-store' }),
        ]);

        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json();
          setLeads(leadsData);
        }

        if (resourcesResponse.ok) {
          const resourcesData = await resourcesResponse.json();
          setResources(resourcesData);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;

      const url = booking
        ? `${apiBaseUrl}/crm/bookings/${booking.id}`
        : `${apiBaseUrl}/crm/bookings`;
      const method = booking ? 'PATCH' : 'POST';

      const payload: any = {
        leadId: formData.leadId,
        scheduledAt: formData.scheduledAt.toISOString(),
        status: formData.status,
      };

      if (!booking) {
        payload.accountId = accountId;
      }

      // Use resourceId if available, otherwise fall back to specialist string
      if (formData.resourceId) {
        payload.resourceId = formData.resourceId;
        const resource = resources.find(r => r.id === formData.resourceId);
        payload.specialist = resource?.name || formData.specialist;
      } else {
        payload.specialist = formData.specialist;
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

      toast.success(booking ? 'Запись успешно обновлена!' : 'Запись успешно создана!');
      onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Произошла ошибка';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="py-8 text-center text-slate-500">
        Загрузка данных...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Lead selection */}
      <div>
        <label htmlFor="leadId" className="block text-sm font-medium text-slate-700 mb-1">
          Клиент *
        </label>
        <select
          id="leadId"
          value={formData.leadId}
          onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
          required
          disabled={!!booking} // Can't change lead after creation
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
        >
          <option value="">Выберите клиента</option>
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.name} {lead.phone ? `(${lead.phone})` : ''}
            </option>
          ))}
        </select>
        {booking && (
          <p className="mt-1 text-xs text-slate-500">
            Клиента нельзя изменить после создания записи
          </p>
        )}
      </div>

      {/* Resource/Specialist selection */}
      <div>
        <label htmlFor="resourceId" className="block text-sm font-medium text-slate-700 mb-1">
          Специалист *
        </label>
        {resources.length > 0 ? (
          <select
            id="resourceId"
            value={formData.resourceId}
            onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
            required={resources.length > 0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Выберите специалиста</option>
            {resources.filter(r => r.isActive && r.type === 'specialist').map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>
            ))}
          </select>
        ) : (
          <>
            <input
              id="specialist"
              type="text"
              value={formData.specialist}
              onChange={(e) => setFormData({ ...formData, specialist: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Имя специалиста"
            />
            <p className="mt-1 text-xs text-slate-500">
              Специалисты не настроены. Используйте текстовое поле.
            </p>
          </>
        )}
      </div>

      {/* Date and Time picker */}
      <div>
        <label htmlFor="scheduledAt" className="block text-sm font-medium text-slate-700 mb-1">
          Дата и время *
        </label>
        <DatePicker
          id="scheduledAt"
          selected={formData.scheduledAt}
          onChange={(date: Date | null) => date && setFormData({ ...formData, scheduledAt: date })}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="dd.MM.yyyy HH:mm"
          minDate={new Date()}
          timeCaption="Время"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          wrapperClassName="w-full"
        />
        <p className="mt-1 text-xs text-slate-500">
          Выберите дату и время приёма
        </p>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
          Статус
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {BOOKING_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
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
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
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
