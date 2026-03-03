import { redirect } from 'next/navigation';

export default function LegacyVehiclesRedirectPage() {
  redirect('/crm/profiles');
}
