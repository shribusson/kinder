'use client';

import { useEffect, useState } from 'react';
import { IconSearch, IconUser, IconHistory, IconPlus, IconTrash } from '@tabler/icons-react';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';
import Link from 'next/link';

interface ProfileRecord {
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

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // History panel
  const [selectedProfile, setSelectedProfile] = useState<ProfileRecord | null>(null);
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
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/profiles/list`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        setProfiles(json.data || json);
      }
    } catch (e) {
      console.error('Failed to fetch profiles:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (profileId: string) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/profiles/${profileId}/history`, {
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

  const selectProfile = (profile: ProfileRecord) => {
    setSelectedProfile(profile);
    fetchHistory(profile.id);
  };

  const addHistory = async () => {
    if (!selectedProfile) return;
    try {
      const body: any = {
        description: historyForm.description,
      };
      if (historyForm.mileageAtService) body.mileageAtService = parseInt(historyForm.mileageAtService);
      if (historyForm.notes) body.notes = historyForm.notes;
      if (historyForm.cost) body.cost = parseInt(historyForm.cost);

      const res = await fetch(`${apiBaseUrl}/profiles/${selectedProfile.id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setHistoryModalOpen(false);
        setHistoryForm({ description: '', mileageAtService: '', notes: '', cost: '' });
        fetchHistory(selectedProfile.id);
      } else {
        const err = await res.json();
        alert(err.message || 'Error');
      }
    } catch (e) {
      console.error(e);
      alert('Error adding history');
    }
  };

  const deleteProfile = async (profile: ProfileRecord) => {
    const confirmed = window.confirm(
      `Удалить профиль ${profile.brand.name} ${profile.model.name}${profile.licensePlate ? ` (${profile.licensePlate})` : ''}?`,
    );
    if (!confirmed) return;

    try {
      setDeletingProfileId(profile.id);
      const res = await fetch(`${apiBaseUrl}/profiles/${profile.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Не удалось удалить профиль');
      }

      setProfiles((prev) => prev.filter((item) => item.id !== profile.id));
      if (selectedProfile?.id === profile.id) {
        setSelectedProfile(null);
        setHistory([]);
      }
    } catch (e: any) {
      alert(e.message || 'Ошибка удаления профиля');
    } finally {
      setDeletingProfileId(null);
    }
  };

  const filteredProfiles = profiles.filter(v => {
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
        <h1 className="text-2xl font-bold text-slate-900">Профили детей</h1>
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
            <h1 className="text-2xl font-bold text-slate-900">Профили детей</h1>
            <p className="text-sm text-slate-500">{profiles.length} профилей в системе</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по профилю, идентификатору, коду..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div className="flex gap-6">
          {/* Profiles List */}
          <div className="flex-1">
            {filteredProfiles.length === 0 ? (
              <div className="card text-center py-12">
                <IconUser size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Нет профилей</h3>
                <p className="text-sm text-slate-500">
                  Профили создаются при оформлении сделок
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-200">
                      <th className="pb-3 pr-4">Профиль</th>
                          <th className="pb-3 pr-4">Возраст</th>
                          <th className="pb-3 pr-4">ID профиля</th>
                      <th className="pb-3 pr-4">Код</th>
                          <th className="pb-3 pr-4">Индекс</th>
                      <th className="pb-3 pr-4 text-center">История</th>
                      <th className="pb-3 pr-4 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.map(v => (
                      <tr
                        key={v.id}
                        onClick={() => selectProfile(v)}
                        className={`border-b border-slate-50 cursor-pointer hover:bg-orange-50 transition-colors ${
                          selectedProfile?.id === v.id ? 'bg-orange-50' : ''
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
                          {v.mileage ? `${v.mileage.toLocaleString()}` : '—'}
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
                        <td className="py-3 pr-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProfile(v);
                            }}
                            disabled={deletingProfileId === v.id}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <IconTrash size={14} />
                            {deletingProfileId === v.id ? 'Удаление...' : 'Удалить'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* History Panel */}
          {selectedProfile && (
            <div className="w-96 flex-shrink-0">
              <div className="card sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {selectedProfile.brand.name} {selectedProfile.model.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedProfile.licensePlate || selectedProfile.vin || 'Без кода'}
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

                <h4 className="text-xs font-medium text-slate-500 uppercase mb-3">История событий</h4>

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
                          <div className="text-xs text-slate-500">{h.mileageAtService.toLocaleString()}</div>
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
                  placeholder="Обновление данных профиля"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Индекс</label>
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
