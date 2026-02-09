import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IconArrowLeft, IconUser, IconCurrencyTenge, IconCar } from '@tabler/icons-react';
import { fetchJson } from '@/app/lib/api';
import DealDetailActions from './components/DealDetailActions';
import { WorkOrderSection } from './components/WorkOrderSection';
import VehicleHistorySection from './components/VehicleHistorySection';

interface Deal {
  id: string;
  leadId: string;
  title: string;
  stage: string;
  amount: number;
  revenue?: number;
  metadata?: Record<string, any>;
  vehicleId?: string;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  vehicle?: {
    id: string;
    brandId: string;
    modelId: string;
    year?: number;
    vin?: string;
    licensePlate?: string;
    color?: string;
    mileage?: number;
    brand?: {
      id: string;
      name: string;
      cyrillicName?: string;
    };
    model?: {
      id: string;
      name: string;
      cyrillicName?: string;
      class?: string;
    };
  };
  workOrder?: {
    id: string;
    orderNumber: number;
    generatedAt: string;
    pdfUrl: string;
    customerName: string;
  };
}

const STAGE_LABELS: Record<string, string> = {
  diagnostics: 'На диагностике',
  planned: 'Запланирована',
  in_progress: 'В работе',
  ready: 'Готова',
  closed: 'Закрыта',
  cancelled: 'Отменена',
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

          {/* Vehicle Information */}
          {deal.vehicle && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <IconCar size={20} className="text-slate-400" />
                Автомобиль
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                    {(deal.vehicle.brand?.cyrillicName || deal.vehicle.brand?.name || '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-base mb-1">
                      {deal.vehicle.brand?.cyrillicName || deal.vehicle.brand?.name} {deal.vehicle.model?.cyrillicName || deal.vehicle.model?.name}
                    </div>
                    <div className="text-sm text-slate-600 space-y-0.5">
                      {deal.vehicle.year && <div>Год: {deal.vehicle.year}</div>}
                      {deal.vehicle.licensePlate && (
                        <div className="font-mono font-medium text-slate-700">
                          {deal.vehicle.licensePlate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {deal.vehicle.vin && (
                    <div className="col-span-2">
                      <dt className="text-xs text-slate-500 mb-1">VIN</dt>
                      <dd className="font-mono text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded">
                        {deal.vehicle.vin}
                      </dd>
                    </div>
                  )}
                  {deal.vehicle.color && (
                    <div>
                      <dt className="text-xs text-slate-500 mb-1">Цвет</dt>
                      <dd className="font-medium text-slate-900">{deal.vehicle.color}</dd>
                    </div>
                  )}
                  {deal.vehicle.mileage && (
                    <div>
                      <dt className="text-xs text-slate-500 mb-1">Пробег</dt>
                      <dd className="font-medium text-slate-900">
                        {deal.vehicle.mileage.toLocaleString('ru-RU')} км
                      </dd>
                    </div>
                  )}
                  {deal.vehicle.model?.class && (
                    <div>
                      <dt className="text-xs text-slate-500 mb-1">Класс</dt>
                      <dd className="font-medium text-slate-900">{deal.vehicle.model.class}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Vehicle History Section */}
              {deal.vehicleId && <VehicleHistorySection vehicleId={deal.vehicleId} />}
            </div>
          )}

          {/* Activity History Placeholder */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">История активности</h2>
            <p className="text-sm text-slate-500">
              Скоро здесь появится история изменений и взаимодействий
            </p>
          </div>

          {/* Work Order Section */}
          <div className="card">
            <WorkOrderSection
              dealId={deal.id}
              customerName={deal.lead?.name || ''}
              carModel={(deal.metadata as any)?.carModel}
              licensePlate={(deal.metadata as any)?.licensePlate}
              workOrder={deal.workOrder}
            />
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
                    deal.stage === 'closed'
                      ? 'bg-green-100 text-green-700'
                      : deal.stage === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : deal.stage === 'diagnostics'
                      ? 'bg-indigo-100 text-indigo-700'
                      : deal.stage === 'ready'
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
