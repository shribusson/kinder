import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IconArrowLeft, IconUser, IconCurrencyTenge } from '@tabler/icons-react';
import { fetchJson } from '@/app/lib/api';
import DealDetailActions from './components/DealDetailActions';

interface Deal {
  id: string;
  leadId: string;
  title: string;
  stage: string;
  amount: number;
  revenue?: number;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

const STAGE_LABELS: Record<string, string> = {
  new: 'Новая',
  contacted: 'Контакт установлен',
  qualified: 'Квалифицирована',
  trial_booked: 'Записан на пробное',
  attended: 'Посетил',
  won: 'Выиграна',
  lost: 'Проиграна',
};

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const deal = await fetchJson<Deal>(`/crm/deals/${params.id}`, undefined, undefined);

  if (!deal) {
    notFound();
  }

  const progressPercentage = deal.revenue && deal.amount
    ? Math.round((deal.revenue / deal.amount) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/crm/deals"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <IconArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{deal.title}</h1>
          <p className="text-sm text-slate-500">ID: {deal.id}</p>
        </div>
        <DealDetailActions deal={deal} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Amount */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <IconCurrencyTenge size={20} className="text-slate-400" />
              Финансовая информация
            </h2>
            <div className="space-y-4">
              <div>
                <dt className="text-sm text-slate-600 mb-1">Ожидаемая сумма</dt>
                <dd className="text-2xl font-bold text-slate-900">
                  {deal.amount.toLocaleString()} ₸
                </dd>
              </div>
              {deal.revenue !== null && deal.revenue !== undefined && (
                <div>
                  <dt className="text-sm text-slate-600 mb-1">Фактическая выручка</dt>
                  <dd className="text-2xl font-bold text-green-600">
                    {deal.revenue.toLocaleString()} ₸
                  </dd>
                  {deal.amount > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                        <span>Прогресс</span>
                        <span className="font-medium">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progressPercentage >= 100
                              ? 'bg-green-500'
                              : progressPercentage >= 75
                              ? 'bg-orange-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Linked Lead */}
          {deal.lead && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <IconUser size={20} className="text-slate-400" />
                Связанный лид
              </h2>
              <Link
                href={`/crm/leads/${deal.lead.id}`}
                className="block p-4 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <div className="font-medium text-slate-900 mb-1">{deal.lead.name}</div>
                <div className="text-sm text-slate-500 space-y-1">
                  {deal.lead.phone && <div>Телефон: {deal.lead.phone}</div>}
                  {deal.lead.email && <div>Email: {deal.lead.email}</div>}
                </div>
              </Link>
            </div>
          )}

          {/* Activity History Placeholder */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">История активности</h2>
            <p className="text-sm text-slate-500">
              Скоро здесь появится история изменений и взаимодействий
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Deal Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Детали</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-500 mb-1">Стадия</dt>
                <dd>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    deal.stage === 'won'
                      ? 'bg-green-100 text-green-700'
                      : deal.stage === 'lost'
                      ? 'bg-red-100 text-red-700'
                      : deal.stage === 'new'
                      ? 'bg-orange-100 text-orange-700'
                      : deal.stage === 'attended'
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {STAGE_LABELS[deal.stage] || deal.stage}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 mb-1">Дата создания</dt>
                <dd className="font-medium text-slate-900">
                  {new Date(deal.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 mb-1">Последнее обновление</dt>
                <dd className="font-medium text-slate-900">
                  {new Date(deal.updatedAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Statistics */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Статистика</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-500 mb-1">Конверсия</dt>
                <dd className="font-medium text-slate-900">
                  {deal.stage === 'won'
                    ? '100% (Выиграна)'
                    : deal.stage === 'lost'
                    ? '0% (Проиграна)'
                    : 'В процессе'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 mb-1">Эффективность</dt>
                <dd className="font-medium text-slate-900">
                  {deal.revenue && deal.amount
                    ? `${progressPercentage}% от плана`
                    : 'Не определена'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
