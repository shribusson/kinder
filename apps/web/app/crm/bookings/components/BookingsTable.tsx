'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconEdit, IconTrash, IconCalendar } from '@tabler/icons-react';
import BookingModal from './BookingModal';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

interface Booking {
  id: string;
  leadId: string;
  specialist: string;
  resourceId?: string;
  scheduledAt: string;
  status: string;
  lead?: Lead;
  resource?: Resource;
}

interface BookingsTableProps {
  initialBookings: Booking[];
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Запланировано',
  CONFIRMED: 'Подтверждено',
  COMPLETED: 'Завершено',
  CANCELLED: 'Отменено',
  NO_SHOW: 'Не пришел',
};

export default function BookingsTable({ initialBookings }: BookingsTableProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    refreshBookings();
  }, []);

  const refreshBookings = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/crm/bookings`, {
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to refresh bookings:', error);
    }
  };

  const handleCreateClick = () => {
    setSelectedBooking(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string, leadName: string) => {
    if (!confirm(`Вы уверены, что хотите отменить запись для "${leadName}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`${apiBaseUrl}/crm/bookings/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      setBookings((prev) => prev.filter((booking) => booking.id !== id));
    } catch (error) {
      console.error('Failed to delete booking:', error);
      alert('Ошибка удаления записи');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = () => {
    refreshBookings();
  };

  // Sort bookings by date (upcoming first)
  const sortedBookings = [...bookings].sort((a, b) =>
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-600">
            Всего записей: <span className="font-semibold text-slate-900">{bookings.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/crm/bookings/calendar"
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <IconCalendar size={16} />
              Календарь
            </Link>
            <button
              onClick={handleCreateClick}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
            >
              + Создать запись
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {sortedBookings.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              Нет записей. Создайте первую!
            </div>
          ) : (
            sortedBookings.map((booking) => {
              const isPast = new Date(booking.scheduledAt) < new Date();
              const isToday = new Date(booking.scheduledAt).toDateString() === new Date().toDateString();

              return (
                <div
                  key={booking.id}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                    isPast
                      ? 'border-slate-200 bg-slate-50'
                      : isToday
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-slate-900">
                        {booking.lead?.name || 'Неизвестный клиент'}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        booking.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : booking.status === 'CONFIRMED'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {STATUS_LABELS[booking.status] || booking.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>👤 {booking.resource?.name || booking.specialist}</span>
                      <span className="flex items-center gap-1">
                        <IconCalendar size={14} />
                        {new Date(booking.scheduledAt).toLocaleString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {booking.lead?.phone && (
                        <span>📞 {booking.lead.phone}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(booking)}
                      className="rounded p-2 text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      title="Редактировать"
                    >
                      <IconEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(booking.id, booking.lead?.name || 'клиента')}
                      disabled={deletingId === booking.id}
                      className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Отменить"
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <BookingModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
