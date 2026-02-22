import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { getCurrentUser } from '@/actions/user';
import CompleteProfileForm from './CompleteProfileForm';
import SignOutLink from '@/components/SignOutLink';

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
  
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">
            🏸 Complete Your Profile
          </h1>
          <p className="text-gray-600 mb-4">
            Tell us about yourself to start your badminton journey
          </p>
          <div className="inline-block text-left bg-white/80 rounded-lg border border-primary-200 px-4 py-3 mb-2">
            <p className="text-sm font-medium text-gray-700">Signed in as</p>
            <p className="text-lg font-semibold text-primary-800">{email || 'No email'}</p>
            {name && <p className="text-sm text-gray-600">{name}</p>}
            <SignOutLink className="text-xs text-primary-600 hover:underline mt-2 inline-block text-left">
              Not you? Sign out and use a different account
            </SignOutLink>
          </div>
        </div>

        <CompleteProfileForm email={email} />
      </div>
    </div>
  );
}

// import { redirect } from 'next/navigation';
// import { getCurrentUser } from '@/actions/user';
// import ProfileCompletionClient from '@/components/ProfileCompletionClient';

// export default async function CompleteProfilePage() {
//   const user = await getCurrentUser();

//   // Redirect if already completed
//   if (user?.profileCompleted) {
//     redirect('/dashboard');
//   }

//   // Redirect to sign in if not authenticated
//   if (!user) {
//     redirect('/sign-in');
//   }

//   return <ProfileCompletionClient email={user.emailAddresses[0]?.emailAddress ?? ''} />
// }