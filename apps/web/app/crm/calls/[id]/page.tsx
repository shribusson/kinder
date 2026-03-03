import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IconArrowLeft, IconPhone, IconPhoneOff, IconCalendar, IconClock } from '@tabler/icons-react';
import { fetchJson } from '@/app/lib/api';
import AudioPlayer from './components/AudioPlayer';

interface Call {
  id: string;
  phoneNumber: string;
  direction: 'inbound' | 'outbound';
  status: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  lead?: {
    id: string;
    name: string;
    phone: string;
  };
  recording?: {
    id: string;
    url: string;
    duration: number;
  };
}

const STATUS_LABELS: Record<string, string> = {
  ringing: 'Звонит',
  answered: 'В процессе',
  completed: 'Завершен',
  failed: 'Не удался',
  cancelled: 'Отменен',
};

function formatDuration(seconds?: number): string {
  if (!seconds) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function CallDetailPage({ params }: { params: { id: string } }) {
  const call = await fetchJson<Call>(`/telephony/calls/${params.id}`, undefined, undefined);

  if (!call) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/crm/calls"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <IconArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {call.direction === 'inbound' ? (
              <IconPhone size={24} className="text-green-600" />
            ) : (
              <IconPhoneOff size={24} className="text-blue-600" />
            )}
            {call.phoneNumber}
          </h1>
          <p className="text-sm text-slate-500">ID: {call.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recording Player */}
          {call.recording ? (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Запись разговора</h2>
              <AudioPlayer url={call.recording.url} duration={call.recording.duration} />
            </div>
          ) : (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Запись разговора</h2>
              <p className="text-slate-500">Запись не доступна</p>
            </div>
          )}

          {/* Call Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Информация о звонке</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-slate-600 mb-1">Направление</dt>
                <dd className="font-medium text-slate-900">
                  {call.direction === 'inbound' ? 'Входящий' : 'Исходящий'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-600 mb-1">Номер телефона</dt>
                <dd className="font-medium text-slate-900">
                  <a href={`tel:${call.phoneNumber}`} className="hover:text-orange-600">
                    {call.phoneNumber}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-600 mb-1">Статус</dt>
                <dd>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    call.status === 'completed'
                      ? 'bg-slate-100 text-slate-700'
                      : call.status === 'answered'
                      ? 'bg-green-100 text-green-700'
                      : call.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {STATUS_LABELS[call.status] || call.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-600 mb-1">Длительность</dt>
                <dd className="font-medium text-slate-900">
                  {formatDuration(call.duration)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-600 mb-1">Дата и время</dt>
                <dd className="font-medium text-slate-900">
                  {formatDate(call.startedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Linked Lead */}
          {call.lead ? (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Связанный лид</h2>
              <Link
                href={`/crm/leads/${call.lead.id}`}
                className="block p-3 rounded-lg border border-orange-200 bg-orange-50 hover:border-orange-300 transition-colors"
              >
                <div className="font-medium text-slate-900">{call.lead.name}</div>
                <div className="text-sm text-slate-600 mt-1">{call.lead.phone}</div>
              </Link>
            </div>
          ) : (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Связанный лид</h2>
              <p className="text-slate-500 text-sm">Лид не связан с этим звонком</p>
            </div>
          )}

          {/* Call Statistics */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Детали</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <IconPhone size={14} />
                  Тип звонка
                </dt>
                <dd className="font-medium text-slate-900">
                  {call.direction === 'inbound' ? 'Входящий' : 'Исходящий'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <IconClock size={14} />
                  Длительность
                </dt>
                <dd className="font-medium text-slate-900">
                  {formatDuration(call.duration)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <IconCalendar size={14} />
                  Начало звонка
                </dt>
                <dd className="font-medium text-slate-900">
                  {new Date(call.startedAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
