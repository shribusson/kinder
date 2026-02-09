import PageHeader from "@/app/components/PageHeader";
import { fetchJson } from "@/app/lib/api";
import CallsTable from "./components/CallsTable";

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

export default async function CallsPage({
  searchParams
}: {
  searchParams?: { direction?: string; status?: string };
}) {
  const query = new URLSearchParams();
  if (searchParams?.direction) query.append('direction', searchParams.direction);
  if (searchParams?.status) query.append('status', searchParams.status);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const response = await fetchJson<{ calls: Call[] }>(`/telephony/calls${queryString}`, undefined, { calls: [] });
  const calls = response.calls || [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Звонки"
        subtitle="История входящих и исходящих звонков"
      />
      <CallsTable initialCalls={calls} />
    </div>
  );
}
