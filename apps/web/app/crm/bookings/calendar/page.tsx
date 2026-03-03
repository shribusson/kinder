'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Event, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ru';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Link from 'next/link';
import { IconArrowLeft, IconCalendar, IconClock, IconUser } from '@tabler/icons-react';
import BookingModal from '../components/BookingModal';
import { apiBaseUrl, getAuthHeaders } from '@/app/lib/api';

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
  showMore: (total: number) => `+ еще ${total}`,
};

function getStatusMeta(status: string) {
  switch (status) {
    case 'COMPLETED':
      return { label: 'Завершено', color: '#10b981', badge: 'bg-green-100 text-green-700' };
    case 'CANCELLED':
      return { label: 'Отменено', color: '#ef4444', badge: 'bg-red-100 text-red-700' };
    case 'CONFIRMED':
      return { label: 'Подтверждено', color: '#8b5cf6', badge: 'bg-violet-100 text-violet-700' };
    case 'NO_SHOW':
      return { label: 'Не пришел', color: '#f59e0b', badge: 'bg-amber-100 text-amber-700' };
    default:
      return { label: 'Запланировано', color: '#f97316', badge: 'bg-orange-100 text-orange-700' };
  }
}

function toDateInputValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function BookingsCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<Date | undefined>();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDay, setMobileDay] = useState<Date>(new Date());

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
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
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const events: CalendarEvent[] = bookings.map((booking) => ({
    title: `${booking.lead?.name || 'Клиент'} -> ${booking.resource?.name || booking.specialist}`,
    start: new Date(booking.scheduledAt),
    end: new Date(new Date(booking.scheduledAt).getTime() + 60 * 60 * 1000),
    resource: booking,
  }));

  const mobileBookings = useMemo(() => {
    const dayStart = new Date(mobileDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    return bookings
      .filter((booking) => {
        const dt = new Date(booking.scheduledAt);
        return dt >= dayStart && dt < dayEnd;
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [bookings, mobileDay]);

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
    const meta = getStatusMeta(event.resource.status);
    return {
      style: {
        backgroundColor: meta.color,
        borderRadius: '6px',
        opacity: 0.95,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Link href="/crm/bookings" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors">
            <IconArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Календарь записей</h1>
            <p className="text-sm text-slate-500">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Link href="/crm/bookings" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors">
              <IconArrowLeft size={20} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Календарь записей</h1>
              <p className="text-sm text-slate-500">
                {isMobile ? 'Мобильный список записей на день' : 'Нажмите на ячейку для создания, на событие для редактирования'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedBooking(undefined);
              setSelectedSlot(undefined);
              setIsModalOpen(true);
            }}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors w-full md:w-auto min-h-[44px]"
          >
            + Создать запись
          </button>
        </div>

        <div className="card">
          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm">
            <span className="font-medium text-slate-600">Статусы:</span>
            {['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'].map((status) => {
              const meta = getStatusMeta(status);
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: meta.color }}></div>
                  <span>{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {isMobile ? (
          <div className="space-y-3">
            <div className="card">
              <label htmlFor="mobileDay" className="block text-sm font-medium text-slate-700 mb-2">
                День
              </label>
              <input
                id="mobileDay"
                type="date"
                value={toDateInputValue(mobileDay)}
                onChange={(e) => setMobileDay(new Date(`${e.target.value}T00:00:00`))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              {mobileBookings.length === 0 ? (
                <div className="card text-center py-8 text-slate-500 text-sm">На этот день записей нет</div>
              ) : (
                mobileBookings.map((booking) => {
                  const meta = getStatusMeta(booking.status);
                  const dt = new Date(booking.scheduledAt);
                  return (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setSelectedSlot(undefined);
                        setIsModalOpen(true);
                      }}
                      className="w-full text-left card hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="font-semibold text-slate-900 truncate">
                          {booking.lead?.name || 'Клиент'}
                        </div>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <IconClock size={14} />
                          {dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-2">
                          <IconUser size={14} />
                          {booking.resource?.name || booking.specialist}
                        </div>
                        {booking.lead?.phone && (
                          <div className="flex items-center gap-2">
                            <IconCalendar size={14} />
                            {booking.lead.phone}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : (
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
        )}
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
