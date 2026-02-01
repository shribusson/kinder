import PageHeader from "@/app/components/PageHeader";
import BookingsTable from "./components/BookingsTable";
import { fetchJson } from "@/app/lib/api";

interface Booking {
  id: string;
  leadId: string;
  specialist: string;
  resourceId?: string;
  scheduledAt: string;
  status: string;
  lead?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  resource?: {
    id: string;
    name: string;
    type: string;
    isActive: boolean;
  };
}

export default async function BookingsPage() {
  const bookings = await fetchJson<Booking[]>("/crm/bookings", undefined, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Записи"
        subtitle="Расписание специалистов и управление приёмами"
      />
      <BookingsTable initialBookings={bookings} />
    </div>
  );
}
