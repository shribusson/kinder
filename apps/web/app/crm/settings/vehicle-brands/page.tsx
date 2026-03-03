import { redirect } from 'next/navigation';

export default function LegacyVehicleBrandsRedirectPage() {
  redirect('/crm/settings/directories');
}
