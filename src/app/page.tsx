import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from '@/actions/user';
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult.userId ?? null;

    // If not authenticated, redirect to sign in
    if (!userId) {
      redirect('/sign-in');
    }

    // If authenticated, check if profile is complete
    const dbUser = await getCurrentUser();

    if (!dbUser?.profileCompleted) {
      redirect('/complete-profile');
    }

    // If profile is complete, redirect to dashboard
    redirect('/dashboard');
  } catch (error) {
    console.error('Error in home page:', error);
    if (userId) {
      redirect('/complete-profile');
    }
    redirect('/sign-in');
  }
}
