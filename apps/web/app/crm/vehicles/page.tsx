'use client';

import { useEffect, useState } from 'react';
import { IconSearch, IconCar, IconHistory, IconPlus } from '@tabler/icons-react';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';
import Link from 'next/link';

interface Vehicle {
  id: string;
  brandId: string;
  modelId: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  color?: string;
  mileage?: number;
  createdAt: string;
  brand: { id: string; name: string; cyrillicName?: string };
  model: { id: string; name: string; cyrillicName?: string; class?: string };
  _count: { serviceHistory: number };
}

interface HistoryEntry {
  id: string;
  serviceDate: string;
  description: string;
  mileageAtService?: number;
  notes?: string;
  cost?: number;
  deal?: { id: string; title: string; stage: string };
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // History panel
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Add history modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyForm, setHistoryForm] = useState({
    description: '',
    mileageAtService: '',
    notes: '',
    cost: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/vehicles/list`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        setVehicles(json.data || json);
      }
    } catch (e) {
      console.error('Failed to fetch vehicles:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (vehicleId: string) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/vehicles/${vehicleId}/history`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        setHistory(json.data || json);
      }
    } catch (e) {
      console.error('Failed to fetch history:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const selectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    fetchHistory(vehicle.id);
  };

  const addHistory = async () => {
    if (!selectedVehicle) return;
    try {
      const body: any = {
        description: historyForm.description,
      };
      if (historyForm.mileageAtService) body.mileageAtService = parseInt(historyForm.mileageAtService);
      if (historyForm.notes) body.notes = historyForm.notes;
      if (historyForm.cost) body.cost = parseInt(historyForm.cost);

      const res = await fetch(`${apiBaseUrl}/vehicles/${selectedVehicle.id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setHistoryModalOpen(false);
        setHistoryForm({ description: '', mileageAtService: '', notes: '', cost: '' });
        fetchHistory(selectedVehicle.id);
      } else {
        const err = await res.json();
        alert(err.message || 'Error');
      }
    } catch (e) {
      console.error(e);
      alert('Error adding history');
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.brand.name.toLowerCase().includes(q) ||
      v.model.name.toLowerCase().includes(q) ||
      v.vin?.toLowerCase().includes(q) ||
      v.licensePlate?.toLowerCase().includes(q) ||
      v.brand.cyrillicName?.toLowerCase().includes(q) ||
      v.model.cyrillicName?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-900">Автомобили</h1>
        <p className="text-sm text-slate-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Автомобили</h1>
            <p className="text-sm text-slate-500">{vehicles.length} автомобилей в системе</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по марке, модели, VIN, номеру..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div className="flex gap-6">
          {/* Vehicles List */}
          <div className="flex-1">
            {filteredVehicles.length === 0 ? (
              <div className="card text-center py-12">
                <IconCar size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Нет автомобилей</h3>
                <p className="text-sm text-slate-500">
                  Автомобили создаются при оформлении сделок
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-200">
                      <th className="pb-3 pr-4">Автомобиль</th>
                      <th className="pb-3 pr-4">Год</th>
                      <th className="pb-3 pr-4">VIN</th>
                      <th className="pb-3 pr-4">Гос. номер</th>
                      <th className="pb-3 pr-4">Пробег</th>
                      <th className="pb-3 pr-4 text-center">История</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map(v => (
                      <tr
                        key={v.id}
                        onClick={() => selectVehicle(v)}
                        className={`border-b border-slate-50 cursor-pointer hover:bg-orange-50 transition-colors ${
                          selectedVehicle?.id === v.id ? 'bg-orange-50' : ''
                        }`}
                      >
                        <td className="py-3 pr-4">
                          <div className="font-medium text-slate-900">
                            {v.brand.name} {v.model.name}
                          </div>
                          {v.color && <div className="text-xs text-slate-500">{v.color}</div>}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{v.year || '—'}</td>
                        <td className="py-3 pr-4">
                          <span className="font-mono text-xs text-slate-600">{v.vin || '—'}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-medium">{v.licensePlate || '—'}</span>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {v.mileage ? `${v.mileage.toLocaleString()} км` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                            v._count.serviceHistory > 0
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            <IconHistory size={12} />
                            {v._count.serviceHistory}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* History Panel */}
          {selectedVehicle && (
            <div className="w-96 flex-shrink-0">
              <div className="card sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {selectedVehicle.brand.name} {selectedVehicle.model.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedVehicle.licensePlate || selectedVehicle.vin || 'Без номера'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setHistoryModalOpen(true);
                      setHistoryForm({ description: '', mileageAtService: '', notes: '', cost: '' });
                    }}
                    className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 transition-colors flex items-center gap-1"
                  >
                    <IconPlus size={14} />
                    Запись
                  </button>
                </div>

                <h4 className="text-xs font-medium text-slate-500 uppercase mb-3">История обслуживания</h4>

                {historyLoading ? (
                  <p className="text-sm text-slate-400">Загрузка...</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-slate-400">Нет записей</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.map(h => (
                      <div key={h.id} className="border-l-2 border-orange-200 pl-3 py-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {new Date(h.serviceDate).toLocaleDateString('ru')}
                          </span>
                          {h.cost != null && (
                            <span className="text-xs font-medium text-slate-700">
                              {h.cost.toLocaleString()} тг
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-medium text-slate-900 mt-0.5">{h.description}</div>
                        {h.mileageAtService != null && (
                          <div className="text-xs text-slate-500">{h.mileageAtService.toLocaleString()} км</div>
                        )}
                        {h.notes && (
                          <div className="text-xs text-slate-500 mt-0.5">{h.notes}</div>
                        )}
                        {h.deal && (
                          <Link
                            href={`/crm/deals/${h.deal.id}`}
                            className="text-xs text-orange-600 hover:underline mt-0.5 block"
                          >
                            Сделка: {h.deal.title}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-6">Добавить запись в историю</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Описание <span className="text-red-500">*</span></label>
                <input
                  value={historyForm.description}
                  onChange={e => setHistoryForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Замена масла и фильтров"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Пробег (км)</label>
                  <input
                    type="number"
                    value={historyForm.mileageAtService}
                    onChange={e => setHistoryForm(f => ({ ...f, mileageAtService: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Стоимость (тг)</label>
                  <input
                    type="number"
                    value={historyForm.cost}
                    onChange={e => setHistoryForm(f => ({ ...f, cost: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Заметки</label>
                <textarea
                  value={historyForm.notes}
                  onChange={e => setHistoryForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setHistoryModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={addHistory}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
