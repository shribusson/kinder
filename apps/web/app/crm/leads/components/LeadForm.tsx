'use client';

import { useEffect, useState } from 'react';
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

interface VehicleBrand {
  id: string;
  name: string;
  cyrillicName?: string;
}

interface VehicleModel {
  id: string;
  name: string;
  cyrillicName?: string;
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
  const [vehicleData, setVehicleData] = useState({
    brandId: '',
    modelId: '',
    year: '',
    vin: '',
    licensePlate: '',
    color: '',
    mileage: '',
  });
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUtm, setShowUtm] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const response = await fetch(`${apiBaseUrl}/vehicles/brands`, {
          headers: getAuthHeaders(),
          cache: 'no-store',
        });

        if (!response.ok) return;
        const data = await response.json();
        if (data.success) {
          setBrands(data.data);
        }
      } catch (fetchError) {
        console.error('Failed to fetch brands:', fetchError);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    if (!vehicleData.brandId) {
      setModels([]);
      return;
    }

    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const response = await fetch(`${apiBaseUrl}/vehicles/brands/${vehicleData.brandId}/models`, {
          headers: getAuthHeaders(),
          cache: 'no-store',
        });

        if (!response.ok) return;
        const data = await response.json();
        if (data.success) {
          setModels(data.data);
        }
      } catch (fetchError) {
        console.error('Failed to fetch models:', fetchError);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, [vehicleData.brandId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = lead
        ? `${apiBaseUrl}/crm/leads/${lead.id}`
        : `${apiBaseUrl}/crm/leads`;
      const method = lead ? 'PATCH' : 'POST';

      const payload: any = {
        name: formData.name,
        source: formData.source,
        stage: formData.stage,
      };

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

      if (vehicleData.brandId && vehicleData.modelId) {
        payload.vehicleData = {
          brandId: vehicleData.brandId,
          modelId: vehicleData.modelId,
          year: vehicleData.year ? Number(vehicleData.year) : undefined,
          vin: vehicleData.vin || undefined,
          licensePlate: vehicleData.licensePlate || undefined,
          color: vehicleData.color || undefined,
          mileage: vehicleData.mileage ? Number(vehicleData.mileage) : undefined,
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

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Автомобиль клиента (опционально)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="vehicleBrand" className="block text-xs font-medium text-slate-600 mb-1">
              Марка
            </label>
            <select
              id="vehicleBrand"
              value={vehicleData.brandId}
              onChange={(e) => setVehicleData((prev) => ({ ...prev, brandId: e.target.value, modelId: '' }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              disabled={loadingBrands}
            >
              <option value="">{loadingBrands ? 'Загрузка...' : 'Выберите марку'}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.cyrillicName || brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="vehicleModel" className="block text-xs font-medium text-slate-600 mb-1">
              Модель
            </label>
            <select
              id="vehicleModel"
              value={vehicleData.modelId}
              onChange={(e) => setVehicleData((prev) => ({ ...prev, modelId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              disabled={!vehicleData.brandId || loadingModels}
            >
              <option value="">{loadingModels ? 'Загрузка...' : 'Выберите модель'}</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.cyrillicName || model.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="vehicleYear" className="block text-xs font-medium text-slate-600 mb-1">
              Год
            </label>
            <input
              id="vehicleYear"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={vehicleData.year}
              onChange={(e) => setVehicleData((prev) => ({ ...prev, year: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="2020"
            />
          </div>

          <div>
            <label htmlFor="vehiclePlate" className="block text-xs font-medium text-slate-600 mb-1">
              Гос. номер
            </label>
            <input
              id="vehiclePlate"
              type="text"
              value={vehicleData.licensePlate}
              onChange={(e) => setVehicleData((prev) => ({ ...prev, licensePlate: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="A123BB 01"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="vehicleVin" className="block text-xs font-medium text-slate-600 mb-1">
              VIN
            </label>
            <input
              id="vehicleVin"
              type="text"
              value={vehicleData.vin}
              onChange={(e) => setVehicleData((prev) => ({ ...prev, vin: e.target.value.toUpperCase() }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="17 символов"
              maxLength={17}
            />
          </div>

          <div>
            <label htmlFor="vehicleColor" className="block text-xs font-medium text-slate-600 mb-1">
              Цвет
            </label>
            <input
              id="vehicleColor"
              type="text"
              value={vehicleData.color}
              onChange={(e) => setVehicleData((prev) => ({ ...prev, color: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="Черный"
            />
          </div>

          <div>
            <label htmlFor="vehicleMileage" className="block text-xs font-medium text-slate-600 mb-1">
              Пробег (км)
            </label>
            <input
              id="vehicleMileage"
              type="number"
              min="0"
              value={vehicleData.mileage}
              onChange={(e) => setVehicleData((prev) => ({ ...prev, mileage: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="50000"
            />
          </div>
        </div>
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
