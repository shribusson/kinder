import PageHeader from "@/app/components/PageHeader";
import { fetchJson } from "@/app/lib/api";

interface Booking {
  id: string;
  specialist: string;
  scheduledAt: string;
  status: string;
}

export default async function BookingsPage() {
  const bookings = await fetchJson<Booking[]>("/crm/bookings", undefined, []);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Записи"
        subtitle="Расписание специалистов"
      />
      <div className="card">
        <div className="mt-4 space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-slate-900">{booking.specialist}</p>
                <p className="text-slate-500">{booking.status}</p>
              </div>
              <span className="text-slate-600">
                {new Date(booking.scheduledAt).toLocaleString("ru-RU")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
