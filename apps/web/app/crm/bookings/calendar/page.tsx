'use client';

import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ru';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import BookingModal from '../components/BookingModal';
import { apiBaseUrl } from '@/app/lib/api';

// Set Russian locale
moment.locale('ru');
const localizer = momentLocalizer(moment);

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

interface CalendarEvent extends Event {
  resource: Booking;
}

const messages = {
  allDay: 'Весь день',
  previous: 'Назад',
  next: 'Вперед',
  today: 'Сегодня',
  month: 'Месяц',
  week: 'Неделя',
  day: 'День',
  agenda: 'Повестка',
  date: 'Дата',
  time: 'Время',
  event: 'Событие',
  noEventsInRange: 'Нет записей в этом диапазоне.',
  showMore: (total: number) => `+ ещё ${total}`,
};

export default function BookingsCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<Date | undefined>();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const accountId = typeof window !== 'undefined' ? localStorage.getItem('accountId') : null;
      const response = await fetch(`${apiBaseUrl}/crm/bookings?accountId=${accountId}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const events: CalendarEvent[] = bookings.map((booking) => ({
    title: `${booking.lead?.name || 'Клиент'} → ${booking.resource?.name || booking.specialist}`,
    start: new Date(booking.scheduledAt),
    end: new Date(new Date(booking.scheduledAt).getTime() + 60 * 60 * 1000), // +1 hour default
    resource: booking,
  }));

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    setSelectedBooking(undefined);
    setSelectedSlot(start);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedBooking(event.resource);
    setSelectedSlot(undefined);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    fetchBookings();
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const booking = event.resource;
    let backgroundColor = '#3b82f6'; // blue

    switch (booking.status) {
      case 'COMPLETED':
        backgroundColor = '#10b981'; // green
        break;
      case 'CANCELLED':
        backgroundColor = '#ef4444'; // red
        break;
      case 'CONFIRMED':
        backgroundColor = '#8b5cf6'; // purple
        break;
      case 'NO_SHOW':
        backgroundColor = '#f59e0b'; // orange
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/crm/bookings"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <IconArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Календарь записей</h1>
            <p className="text-sm text-slate-500">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/crm/bookings"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <IconArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Календарь записей</h1>
            <p className="text-sm text-slate-500">
              Нажмите на пустую ячейку для создания записи, на событие — для просмотра
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedBooking(undefined);
              setSelectedSlot(undefined);
              setIsModalOpen(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + Создать запись
          </button>
        </div>

        {/* Legend */}
        <div className="card">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-medium text-slate-600">Статусы:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span>Запланировано</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span>Подтверждено</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span>Завершено</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span>Не пришёл</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span>Отменено</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="card" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            messages={messages}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="week"
          />
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
