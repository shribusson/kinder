'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { IconPhone, IconPhoneOff } from '@tabler/icons-react';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';
import { useCallEvents } from '@/app/hooks/useCallEvents';

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

interface CallsTableProps {
  initialCalls: Call[];
}

const STATUS_LABELS: Record<string, string> = {
  ringing: 'Звонит',
  answered: 'В процессе',
  completed: 'Завершен',
  failed: 'Не удался',
  cancelled: 'Отменен',
};

const STATUS_COLORS: Record<string, string> = {
  ringing: 'bg-blue-100 text-blue-700',
  answered: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-yellow-100 text-yellow-700',
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
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CallsTable({ initialCalls }: CallsTableProps) {
  const [calls, setCalls] = useState<Call[]>(initialCalls);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('accountId');
      setAccountId(id);
    }
  }, []);

  // WebSocket integration for real-time updates
  useCallEvents({
    accountId: accountId || '',
    onNewCall: (call: Call) => {
      setCalls((prev) => [call, ...prev]);
      toast.success('Новый входящий звонок!');
    },
    onCallStatusChanged: (callId: string, status: string) => {
      setCalls((prev) =>
        prev.map((call) => (call.id === callId ? { ...call, status } : call))
      );
    },
    onCallEnded: (callId: string, duration: number) => {
      setCalls((prev) =>
        prev.map((call) => (call.id === callId ? { ...call, status: 'completed', duration } : call))
      );
    },
    onNewLead: (lead: any) => {
      toast.success(`Создан новый лид: ${lead.name}`);
      // Refresh calls to show updated lead associations
      refreshCalls();
    },
  });

  const refreshCalls = async () => {
    try {
      const id = accountId || (typeof window !== 'undefined' ? localStorage.getItem('accountId') : null);
      if (!id) return;

      const response = await fetch(`${apiBaseUrl}/telephony/calls?accountId=${id}`, {
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCalls(data.calls || []);
      }
    } catch (error) {
      console.error('Failed to refresh calls:', error);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-600">
          Всего звонков: <span className="font-semibold text-slate-900">{calls.length}</span>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="text-left text-slate-500">
          <tr>
            <th className="py-2">Направление</th>
            <th>Номер</th>
            <th>Лид</th>
            <th>Статус</th>
            <th>Длительность</th>
            <th>Дата</th>
            <th>Запись</th>
          </tr>
        </thead>
        <tbody>
          {calls.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-500">
                Нет звонков. Входящие звонки появятся здесь.
              </td>
            </tr>
          ) : (
            calls.map((call) => (
              <tr key={call.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {call.direction === 'inbound' ? (
                      <>
                        <IconPhone size={16} className="text-green-600" />
                        <span className="text-slate-600">Входящий</span>
                      </>
                    ) : (
                      <>
                        <IconPhoneOff size={16} className="text-blue-600" />
                        <span className="text-slate-600">Исходящий</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="font-medium text-slate-900">{call.phoneNumber}</td>
                <td className="text-slate-600">
                  {call.lead ? (
                    <Link
                      href={`/crm/leads/${call.lead.id}`}
                      className="text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      {call.lead.name}
                    </Link>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    STATUS_COLORS[call.status] || 'bg-slate-100 text-slate-700'
                  }`}>
                    {STATUS_LABELS[call.status] || call.status}
                  </span>
                </td>
                <td className="text-slate-600">{formatDuration(call.duration)}</td>
                <td className="text-slate-500 text-xs">{formatDate(call.startedAt)}</td>
                <td>
                  {call.recording ? (
                    <Link
                      href={`/crm/calls/${call.id}`}
                      className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                    >
                      Слушать
                    </Link>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
