import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IconArrowLeft, IconCalendar, IconMail, IconPhone, IconUser } from '@tabler/icons-react';
import { fetchJson } from '@/app/lib/api';
import LeadDetailActions from './components/LeadDetailActions';

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
  createdAt: string;
  updatedAt: string;
  deals?: Array<{
    id: string;
    title: string;
    stage: string;
    amount: number;
  }>;
  bookings?: Array<{
    id: string;
    scheduledAt: string;
    specialist: string;
    status: string;
  }>;
}

const STAGE_LABELS: Record<string, string> = {
  new: 'Новый',
  contacted: 'Связались',
  qualified: 'Квалифицирован',
  trial_booked: 'Записан на пробное',
  attended: 'Посетил',
  won: 'Выигран',
  lost: 'Потерян',
};

const SOURCE_LABELS: Record<string, string> = {
  website: 'Сайт',
  instagram: 'Instagram',
  '2gis': '2GIS',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  phone: 'Телефон',
  referral: 'Рекомендация',
  other: 'Другое',
};

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await fetchJson<Lead>(`/crm/leads/${params.id}`, undefined, undefined);

  if (!lead) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/crm/leads"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <IconArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
          <p className="text-sm text-slate-500">ID: {lead.id}</p>
        </div>
        <LeadDetailActions lead={lead} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <IconUser size={20} className="text-slate-400" />
              Контактная информация
            </h2>
            <dl className="space-y-3">
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <dt className="flex items-center gap-2 text-sm text-slate-600 w-32">
                    <IconPhone size={16} />
                    Телефон
                  </dt>
                  <dd className="font-medium text-slate-900">
                    <a href={`tel:${lead.phone}`} className="hover:text-orange-600">
                      {lead.phone}
                    </a>
                  </dd>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-3">
                  <dt className="flex items-center gap-2 text-sm text-slate-600 w-32">
                    <IconMail size={16} />
                    Email
                  </dt>
                  <dd className="font-medium text-slate-900">
                    <a href={`mailto:${lead.email}`} className="hover:text-orange-600">
                      {lead.email}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* UTM Data */}
          {(lead.utmSource || lead.utmMedium || lead.utmCampaign || lead.utmContent || lead.utmTerm) && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">UTM метки</h2>
              <dl className="grid grid-cols-2 gap-4">
                {lead.utmSource && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">utm_source</dt>
                    <dd className="font-medium text-slate-900">{lead.utmSource}</dd>
                  </div>
                )}
                {lead.utmMedium && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">utm_medium</dt>
                    <dd className="font-medium text-slate-900">{lead.utmMedium}</dd>
                  </div>
                )}
                {lead.utmCampaign && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">utm_campaign</dt>
                    <dd className="font-medium text-slate-900">{lead.utmCampaign}</dd>
                  </div>
                )}
                {lead.utmContent && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">utm_content</dt>
                    <dd className="font-medium text-slate-900">{lead.utmContent}</dd>
                  </div>
                )}
                {lead.utmTerm && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">utm_term</dt>
                    <dd className="font-medium text-slate-900">{lead.utmTerm}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Deals */}
          {lead.deals && lead.deals.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Сделки</h2>
              <div className="space-y-2">
                {lead.deals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/crm/deals/${deal.id}`}
                    className="block p-3 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{deal.title}</div>
                        <div className="text-sm text-slate-500">{deal.stage}</div>
                      </div>
                      <div className="font-semibold text-slate-900">
                        {deal.amount.toLocaleString()} ₸
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bookings */}
          {lead.bookings && lead.bookings.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Бронирования</h2>
              <div className="space-y-2">
                {lead.bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{booking.specialist}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <IconCalendar size={14} />
                          {new Date(booking.scheduledAt).toLocaleString('ru-RU')}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Детали</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-500 mb-1">Источник</dt>
                <dd className="font-medium text-slate-900">
                  {SOURCE_LABELS[lead.source] || lead.source}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 mb-1">Стадия</dt>
                <dd>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    lead.stage === 'won'
                      ? 'bg-green-100 text-green-700'
                      : lead.stage === 'lost'
                      ? 'bg-red-100 text-red-700'
                      : lead.stage === 'new'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {STAGE_LABELS[lead.stage] || lead.stage}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 mb-1">Дата создания</dt>
                <dd className="font-medium text-slate-900">
                  {new Date(lead.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 mb-1">Последнее обновление</dt>
                <dd className="font-medium text-slate-900">
                  {new Date(lead.updatedAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Activity placeholder */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">История активности</h2>
            <p className="text-sm text-slate-500">
              Скоро здесь появится история взаимодействий с клиентом
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
