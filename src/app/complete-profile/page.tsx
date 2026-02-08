import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { getCurrentUser } from '@/actions/user';
import CompleteProfileForm from './CompleteProfileForm';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

export default async function CompleteProfilePage() {
  // Check if user is authenticated
  const { userId } = await auth();
  const clerkUser = await currentUser();
  
  if (!userId || !clerkUser) {
    redirect('/sign-in');
  }
  
  // Check if user already has a completed profile
  const dbUser = await getCurrentUser();
  
  if (dbUser?.profileCompleted) {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">
            🏸 Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Tell us about yourself to start your badminton journey
          </p>
        </div>
        
        <CompleteProfileForm email={clerkUser.emailAddresses[0]?.emailAddress ?? ''} />
      </div>
    </div>
  );
}
