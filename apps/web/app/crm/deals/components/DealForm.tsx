'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Brand {
  id: string;
  name: string;
  cyrillicName?: string;
  popular: boolean;
}

interface Model {
  id: string;
  name: string;
  cyrillicName?: string;
  class?: string;
}

interface Vehicle {
  id: string;
  brandId: string;
  modelId: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  color?: string;
  mileage?: number;
  brand?: Brand;
  model?: Model;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  unit?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface ServiceSelection {
  serviceId: string;
  quantity: number;
  service?: Service;
}

interface Deal {
  id: string;
  leadId: string;
  title: string;
  stage: string;
  amount: number;
  revenue?: number;
  lead?: Lead;
  vehicleId?: string;
  vehicle?: Vehicle;
}

interface DealFormProps {
  deal?: Deal;
  onSuccess: () => void;
  onCancel: () => void;
}

const DEAL_STAGES = [
  { value: 'diagnostics', label: 'На диагностике' },
  { value: 'planned', label: 'Запланирована' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'ready', label: 'Готова' },
  { value: 'closed', label: 'Закрыта' },
  { value: 'cancelled', label: 'Отменена' },
];

export default function DealForm({ deal, onSuccess, onCancel }: DealFormProps) {
  const [formData, setFormData] = useState({
    leadId: deal?.leadId || '',
    title: deal?.title || '',
    stage: deal?.stage || 'diagnostics',
    amount: deal?.amount || 0,
    revenue: deal?.revenue || 0,
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [error, setError] = useState('');

  // Vehicle state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    brandId: deal?.vehicle?.brandId || '',
    modelId: deal?.vehicle?.modelId || '',
    year: deal?.vehicle?.year || null as number | null,
    vin: deal?.vehicle?.vin || '',
    licensePlate: deal?.vehicle?.licensePlate || '',
    color: deal?.vehicle?.color || '',
    mileage: deal?.vehicle?.mileage || null as number | null,
  });
  const [existingVehicle, setExistingVehicle] = useState<Vehicle | null>(null);

  // Services state
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);

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

  // Load brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/vehicles/brands`, {
          headers: getAuthHeaders(),
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setBrands(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch brands:', err);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  // Load models when brand selected
  useEffect(() => {
    if (!vehicleData.brandId) {
      setModels([]);
      return;
    }

    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const response = await fetch(
          `${apiBaseUrl}/vehicles/brands/${vehicleData.brandId}/models`,
          {
            headers: getAuthHeaders(),
            cache: 'no-store',
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setModels(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch models:', err);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, [vehicleData.brandId]);

  // Load available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/services`, {
          headers: getAuthHeaders(),
          cache: 'no-store',
        });
        if (response.ok) {
          const services = await response.json();
          setAvailableServices(services);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // Auto-calculate total amount from selected services
  useEffect(() => {
    const total = selectedServices.reduce((sum, item) => {
      const service = availableServices.find(s => s.id === item.serviceId);
      const unitPrice = service?.price || 0;
      return sum + (unitPrice * item.quantity);
    }, 0);

    setFormData(prev => ({ ...prev, amount: total }));
  }, [selectedServices, availableServices]);

  // Add service to selection
  const handleAddService = (serviceId: string) => {
    if (!serviceId) return;
    if (selectedServices.some(s => s.serviceId === serviceId)) {
      toast.error('Услуга уже добавлена');
      return;
    }

    setSelectedServices([...selectedServices, { serviceId, quantity: 1 }]);
  };

  // Update service quantity
  const handleUpdateQuantity = (serviceId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedServices(prev =>
      prev.map(item =>
        item.serviceId === serviceId ? { ...item, quantity } : item
      )
    );
  };

  // Remove service from selection
  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(item => item.serviceId !== serviceId));
  };

  // Check if vehicle exists by VIN or license plate
  const handleVehicleLookup = async (field: 'vin' | 'licensePlate') => {
    const value = field === 'vin' ? vehicleData.vin : vehicleData.licensePlate;
    if (!value || value.length < 3) {
      setExistingVehicle(null);
      return;
    }

    try {
      const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;
      const endpoint = field === 'vin' ? 'vin' : 'plate';
      const response = await fetch(
        `${apiBaseUrl}/vehicles/lookup/${endpoint}/${encodeURIComponent(value)}`,
        {
          headers: {
            ...getAuthHeaders(),
            'x-account-id': accountId || '',
          },
          cache: 'no-store',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const vehicle = data.data;
          setExistingVehicle(vehicle);
          setVehicleData({
            brandId: vehicle.brandId,
            modelId: vehicle.modelId,
            year: vehicle.year,
            vin: vehicle.vin || '',
            licensePlate: vehicle.licensePlate || '',
            color: vehicle.color || '',
            mileage: vehicle.mileage,
          });
          toast.success('Автомобиль найден в базе!');
        } else {
          setExistingVehicle(null);
        }
      }
    } catch (err) {
      console.error('Failed to lookup vehicle:', err);
    }
  };

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

      if (formData.revenue) {
        payload.revenue = Number(formData.revenue);
      }

      // Add vehicle data if provided
      if (vehicleData.brandId && vehicleData.modelId) {
        payload.vehicleData = {
          brandId: vehicleData.brandId,
          modelId: vehicleData.modelId,
          year: vehicleData.year || undefined,
          vin: vehicleData.vin || undefined,
          licensePlate: vehicleData.licensePlate || undefined,
          color: vehicleData.color || undefined,
          mileage: vehicleData.mileage || undefined,
        };
      }

      // Add services if selected
      if (selectedServices.length > 0) {
        payload.services = selectedServices.map(item => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
        }));
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
          placeholder="Замена тормозных колодок"
        />
      </div>

      {/* Vehicle Information Section */}
      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Информация об автомобиле</h3>

        {existingVehicle && (
          <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
            ✓ Автомобиль найден в базе: {existingVehicle.brand?.cyrillicName || existingVehicle.brand?.name} {existingVehicle.model?.cyrillicName || existingVehicle.model?.name}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Brand */}
          <div>
            <label htmlFor="brandId" className="block text-sm font-medium text-slate-700 mb-1">
              Марка
            </label>
            {loadingBrands ? (
              <div className="text-xs text-slate-500">Загрузка...</div>
            ) : (
              <select
                id="brandId"
                value={vehicleData.brandId}
                onChange={(e) => {
                  setVehicleData({
                    ...vehicleData,
                    brandId: e.target.value,
                    modelId: '', // Reset model when brand changes
                  });
                  setExistingVehicle(null);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="">Выберите марку</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.cyrillicName || brand.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Model */}
          <div>
            <label htmlFor="modelId" className="block text-sm font-medium text-slate-700 mb-1">
              Модель
            </label>
            {loadingModels ? (
              <div className="text-xs text-slate-500">Загрузка...</div>
            ) : (
              <select
                id="modelId"
                value={vehicleData.modelId}
                onChange={(e) => {
                  setVehicleData({ ...vehicleData, modelId: e.target.value });
                  setExistingVehicle(null);
                }}
                disabled={!vehicleData.brandId}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:bg-slate-100"
              >
                <option value="">Выберите модель</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.cyrillicName || model.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Year */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-slate-700 mb-1">
              Год выпуска
            </label>
            <input
              id="year"
              type="number"
              value={vehicleData.year || ''}
              onChange={(e) => setVehicleData({ ...vehicleData, year: e.target.value ? Number(e.target.value) : null })}
              min={1950}
              max={new Date().getFullYear() + 1}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="2020"
            />
          </div>

          {/* License Plate */}
          <div>
            <label htmlFor="licensePlate" className="block text-sm font-medium text-slate-700 mb-1">
              Гос. номер
            </label>
            <input
              id="licensePlate"
              type="text"
              value={vehicleData.licensePlate}
              onChange={(e) => setVehicleData({ ...vehicleData, licensePlate: e.target.value.toUpperCase() })}
              onBlur={() => handleVehicleLookup('licensePlate')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="А123БВ 01"
            />
          </div>

          {/* VIN */}
          <div className="col-span-2">
            <label htmlFor="vin" className="block text-sm font-medium text-slate-700 mb-1">
              VIN
            </label>
            <input
              id="vin"
              type="text"
              value={vehicleData.vin}
              onChange={(e) => setVehicleData({ ...vehicleData, vin: e.target.value.toUpperCase() })}
              onBlur={() => handleVehicleLookup('vin')}
              maxLength={17}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="17 символов"
            />
            <p className="mt-1 text-xs text-slate-500">
              При вводе VIN или гос. номера проверим, есть ли машина в базе
            </p>
          </div>

          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-slate-700 mb-1">
              Цвет
            </label>
            <input
              id="color"
              type="text"
              value={vehicleData.color}
              onChange={(e) => setVehicleData({ ...vehicleData, color: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="Черный"
            />
          </div>

          {/* Mileage */}
          <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-slate-700 mb-1">
              Пробег (км)
            </label>
            <input
              id="mileage"
              type="number"
              value={vehicleData.mileage || ''}
              onChange={(e) => setVehicleData({ ...vehicleData, mileage: e.target.value ? Number(e.target.value) : null })}
              min={0}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="50000"
            />
          </div>
        </div>
      </div>

      {/* Services Selection Section */}
      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Услуги</h3>

        {/* Service selector */}
        <div className="mb-3">
          <label htmlFor="serviceSelect" className="block text-sm font-medium text-slate-700 mb-1">
            Добавить услугу
          </label>
          {loadingServices ? (
            <div className="text-xs text-slate-500">Загрузка услуг...</div>
          ) : (
            <select
              id="serviceSelect"
              onChange={(e) => {
                handleAddService(e.target.value);
                e.target.value = ''; // Reset select
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="">Выберите услугу...</option>
              {availableServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} {service.price ? `— ${service.price.toLocaleString('ru-RU')} ₸` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Selected services list */}
        {selectedServices.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600 mb-2">
              Выбранные услуги ({selectedServices.length})
            </div>
            {selectedServices.map((item) => {
              const service = availableServices.find(s => s.id === item.serviceId);
              if (!service) return null;

              const unitPrice = service.price || 0;
              const total = unitPrice * item.quantity;

              return (
                <div
                  key={item.serviceId}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900 truncate">
                      {service.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {unitPrice.toLocaleString('ru-RU')} ₸ {service.unit ? `за ${service.unit}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.serviceId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 rounded flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item.serviceId, parseInt(e.target.value) || 1)}
                      min={1}
                      className="w-16 text-center rounded border border-slate-300 px-2 py-1 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.serviceId, item.quantity + 1)}
                      className="w-7 h-7 rounded flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-100 text-slate-700"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-sm font-semibold text-slate-900 w-24 text-right">
                    {total.toLocaleString('ru-RU')} ₸
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveService(item.serviceId)}
                    className="w-7 h-7 rounded flex items-center justify-center text-red-600 hover:bg-red-50"
                    title="Удалить"
                  >
                    ×
                  </button>
                </div>
              );
            })}

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="text-sm font-semibold text-slate-900">Итого:</div>
              <div className="text-lg font-bold text-orange-600">
                {formData.amount.toLocaleString('ru-RU')} ₸
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500 py-3 text-center bg-slate-50 rounded-lg border border-slate-200">
            Услуги не выбраны. Сумма сделки будет указана вручную.
          </div>
        )}
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
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            target.value = target.value.replace(/^0+(?=\d)/, '');
          }}
          required
          min="0"
          step="1"
          readOnly={selectedServices.length > 0}
          className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            selectedServices.length > 0 ? 'bg-slate-100 cursor-not-allowed' : ''
          }`}
          placeholder="50000"
        />
        {selectedServices.length > 0 && (
          <p className="mt-1 text-xs text-slate-500">
            Сумма рассчитывается автоматически из выбранных услуг
          </p>
        )}
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
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            target.value = target.value.replace(/^0+(?=\d)/, '');
          }}
          min="0"
          step="1"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
