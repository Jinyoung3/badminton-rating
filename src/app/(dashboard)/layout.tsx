import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/user';
import { getPendingCorrectionRequestsForRespondent } from '@/actions/corrections';
import DashboardNav from '@/components/DashboardNav';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  // Redirect to complete profile if not completed
  if (!user?.profileCompleted) {
    redirect('/complete-profile');
  }

  const notifications = await getPendingCorrectionRequestsForRespondent();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} notifications={notifications} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
