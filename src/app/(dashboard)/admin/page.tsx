import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/user';
import { getAdminData } from '@/actions/admin';
import AdminPanel from '@/components/AdminPanel';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (!user.isAdmin) {
    redirect('/dashboard');
  }

  const data = await getAdminData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Console</h1>
        <p className="text-gray-600 mt-2">
          Full-access management for players, organizations, events, and matches.
        </p>
      </div>

      <AdminPanel
        players={data.players}
        organizations={data.organizations}
        events={data.events}
        matches={data.matches}
      />
    </div>
  );
}
