import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/user';
import DashboardNav from '@/components/DashboardNav';

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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
