'use client';

import { useEffect, useState } from 'react';
import { IconPlus, IconEdit, IconTrash, IconTrendingUp, IconAlertCircle } from '@tabler/icons-react';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

interface SalesPlan {
  id: string;
  period: string;
  target: number;
  actual?: number;
  createdAt: string;
  updatedAt: string;
}

export default function RevenuePlanPage() {
  const [plans, setPlans] = useState<SalesPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ period: '', target: '' });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;
      const response = await fetch(`${apiBaseUrl}/crm/sales-plans?accountId=${accountId}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newPlan.period || !newPlan.target) {
      alert('Заполните все поля');
      return;
    }

    try {
      const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;
      const response = await fetch(`${apiBaseUrl}/crm/sales-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          accountId,
          period: newPlan.period,
          target: parseFloat(newPlan.target),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create plan');
      }

      await fetchPlans();
      setNewPlan({ period: '', target: '' });
      setCreatingPlan(false);
    } catch (error) {
      console.error('Failed to create plan:', error);
      alert('Ошибка создания плана');
    }
  };

  const handleEdit = (plan: SalesPlan) => {
    setEditingId(plan.id);
    setEditValue(plan.target.toString());
  };

  const handleSaveEdit = async (planId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/crm/sales-plans/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          target: parseFloat(editValue),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update plan');
      }

      await fetchPlans();
      setEditingId(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to update plan:', error);
      alert('Ошибка обновления плана');
    }
  };

  const handleDelete = async (planId: string, period: string) => {
    if (!confirm(`Удалить план за ${period}?`)) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/crm/sales-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete plan');
      }

      setPlans((prev) => prev.filter((plan) => plan.id !== planId));
    } catch (error) {
      console.error('Failed to delete plan:', error);
      alert('Ошибка удаления плана');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">План по выручке</h1>
          <p className="text-sm text-slate-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">План по выручке</h1>
          <p className="text-sm text-slate-500">
            Установите целевые показатели выручки по периодам
          </p>
        </div>
        <button
          onClick={() => setCreatingPlan(!creatingPlan)}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <IconPlus size={16} />
          Добавить план
        </button>
      </div>

      {/* Create Form */}
      {creatingPlan && (
        <div className="card bg-orange-50 border border-orange-200">
          <h3 className="font-semibold text-slate-900 mb-4">Новый план</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Период (YYYY-MM)
              </label>
              <input
                type="month"
                value={newPlan.period}
                onChange={(e) => setNewPlan({ ...newPlan, period: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Целевая выручка (₸)
              </label>
              <input
                type="number"
                value={newPlan.target}
                onChange={(e) => setNewPlan({ ...newPlan, target: e.target.value })}
                min="0"
                step="1000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="500000"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
            >
              Создать
            </button>
            <button
              onClick={() => setCreatingPlan(false)}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Plans Table */}
      {plans.length === 0 ? (
        <div className="card text-center py-12">
          <IconAlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Нет планов по выручке
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Создайте первый план для отслеживания целевых показателей
          </p>
          <button
            onClick={() => setCreatingPlan(true)}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
          >
            <IconPlus size={16} />
            Добавить план
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Период
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  План (₸)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Факт (₸)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Прогресс
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {plans.map((plan) => {
                const progressPercentage = plan.actual && plan.target
                  ? Math.round((plan.actual / plan.target) * 100)
                  : 0;

                return (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <IconTrendingUp size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                          {new Date(plan.period + '-01').toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === plan.id ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleSaveEdit(plan.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(plan.id)}
                          autoFocus
                          className="w-32 rounded border border-orange-300 px-2 py-1 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-slate-900">
                          {plan.target.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${
                        plan.actual
                          ? plan.actual >= plan.target
                            ? 'text-green-600'
                            : 'text-orange-600'
                          : 'text-slate-400'
                      }`}>
                        {plan.actual ? plan.actual.toLocaleString() : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {plan.actual ? (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[120px]">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                progressPercentage >= 100
                                  ? 'bg-green-500'
                                  : progressPercentage >= 75
                                  ? 'bg-orange-500'
                                  : progressPercentage >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600 min-w-[40px]">
                            {progressPercentage}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="rounded p-1 text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          title="Редактировать"
                        >
                          <IconEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id, plan.period)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Удалить"
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Section */}
      <div className="card bg-orange-50 border border-orange-100">
        <div className="flex gap-3">
          <div className="text-orange-600">
            <IconAlertCircle size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-orange-900 mb-1">
              Как работает план по выручке
            </h3>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Устанавливайте целевые показатели выручки на месяц/квартал/год</li>
              <li>• Фактические значения рассчитываются автоматически из закрытых сделок</li>
              <li>• Прогресс отображается на главной странице дашборда</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
