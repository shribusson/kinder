'use client';

import { useState, useEffect } from 'react';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

interface ServiceHistory {
  id: string;
  serviceDate: string;
  description: string;
  notes?: string;
  cost?: number;
  mileageAtService?: number;
  deal?: {
    id: string;
    title: string;
    stage: string;
  };
}

interface VehicleHistorySectionProps {
  vehicleId: string;
}

export default function VehicleHistorySection({ vehicleId }: VehicleHistorySectionProps) {
  const [history, setHistory] = useState<ServiceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, [vehicleId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/vehicles/${vehicleId}/history`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHistory(data.data);
        }
      } else {
        setError('Не удалось загрузить историю обслуживания');
      }
    } catch (err) {
      console.error('Failed to load vehicle history:', err);
      setError('Ошибка при загрузке истории');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">История обслуживания</h3>
        <div className="text-sm text-slate-500">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">История обслуживания</h3>
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        История обслуживания
        {history.length > 0 && (
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({history.length} {history.length === 1 ? 'запись' : history.length < 5 ? 'записи' : 'записей'})
          </span>
        )}
      </h3>

      {history.length === 0 ? (
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-8 text-center">
          <div className="text-slate-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-slate-600">История обслуживания пуста</p>
          <p className="text-xs text-slate-500 mt-1">
            Записи будут добавляться автоматически при закрытии сделок
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors overflow-hidden"
            >
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-slate-900">
                    {new Date(entry.serviceDate).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  {entry.mileageAtService && (
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>{entry.mileageAtService.toLocaleString('ru-RU')} км</span>
                    </div>
                  )}
                </div>
                {entry.cost && (
                  <div className="text-sm font-semibold text-orange-600">
                    {entry.cost.toLocaleString('ru-RU')} ₸
                  </div>
                )}
              </div>

              <div className="px-4 py-3">
                <p className="text-sm text-slate-900 mb-2">{entry.description}</p>

                {entry.notes && (
                  <p className="text-sm text-slate-600 mb-2 pl-3 border-l-2 border-slate-200">
                    {entry.notes}
                  </p>
                )}

                {entry.deal && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <a
                      href={`/crm/deals/${entry.deal.id}`}
                      className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-orange-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      <span>Связано со сделкой: {entry.deal.title}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
