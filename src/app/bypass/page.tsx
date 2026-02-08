import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { calculateInitialRating } from '@/lib/rating/calculator';

export default async function BypassPage() {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    if (!userId || !clerkUser) {
      redirect('/sign-in');
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    
    if (existingUser) {
      redirect('/dashboard');
    }
    
    // Create a default organization if none exists
    let defaultOrg = await prisma.organization.findFirst({
      where: { name: 'Default Organization' },
    });
    
    if (!defaultOrg) {
      defaultOrg = await prisma.organization.create({
        data: {
          name: 'Default Organization',
          type: 'Club',
          location: 'Test Location',
        },
      });
    }
    
    // Create user with default values
    const initialRating = calculateInitialRating({
      question1: 5,
      question2: 5,
      question3: 5,
      question4: 5,
      question5: 5,
      question6: 5,
      question7: 5,
      question8: 5,
    });
    
    await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? 'test@example.com',
        name: clerkUser.firstName ?? 'Test User',
        sex: 'Other',
        location: 'Test City',
        preferredGameType: 'Singles',
        organizationId: defaultOrg.id,
        rating: initialRating,
        profileCompleted: true,
        selfRating: {
          create: {
            question1: 5,
            question2: 5,
            question3: 5,
            question4: 5,
            question5: 5,
            question6: 5,
            question7: 5,
            question8: 5,
          },
        },
      },
    });
    
    redirect('/dashboard');
  } catch (error) {
    console.error('Error in bypass:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p>Failed to create bypass profile. Try signing out and signing in again.</p>
          <p className="text-sm text-gray-600 mt-2">Error: {String(error)}</p>
        </div>
      </div>
    );
  }
}
