'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { calculateInitialRating, type SelfRatingAnswers } from '@/lib/rating/calculator';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Get current user's profile from database
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      organization: true,
      selfRating: true,
    },
  });
  
  return user;
}

/**
 * Check if user has completed their profile
 */
export async function hasCompletedProfile() {
  const user = await getCurrentUser();
  return user?.profileCompleted ?? false;
}

/**
 * Create user profile with self-rating questionnaire
 */
export async function createUserProfile(data: {
  email: string;
  name: string;
  sex: string;
  location: string;
  preferredGameType: string;
  organizationId: string;
  selfRating: SelfRatingAnswers;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Not authenticated');
  }
  
  // Calculate initial rating from self-assessment
  const initialRating = calculateInitialRating(data.selfRating);
  
  try {
    // Create user with profile and self-rating in a transaction
    const user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: data.email,
        name: data.name,
        sex: data.sex,
        location: data.location,
        preferredGameType: data.preferredGameType,
        organizationId: data.organizationId,
        rating: initialRating,
        profileCompleted: true,
        selfRating: {
          create: {
            question1: data.selfRating.question1,
            question2: data.selfRating.question2,
            question3: data.selfRating.question3,
            question4: data.selfRating.question4,
            question5: data.selfRating.question5,
            question6: data.selfRating.question6,
            question7: data.selfRating.question7,
            question8: data.selfRating.question8,
          },
        },
      },
      include: {
        organization: true,
        selfRating: true,
      },
    });
    
    revalidatePath('/');
    return { success: true, user };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: 'Failed to create profile' };
  }
}

/**
 * Update user's self-rating and recalculate rating
 */
export async function updateSelfRating(selfRating: SelfRatingAnswers) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  // Calculate new rating from self-assessment
  const newRating = calculateInitialRating(selfRating);
  
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        rating: newRating,
        selfRating: {
          upsert: {
            create: {
              question1: selfRating.question1,
              question2: selfRating.question2,
              question3: selfRating.question3,
              question4: selfRating.question4,
              question5: selfRating.question5,
              question6: selfRating.question6,
              question7: selfRating.question7,
              question8: selfRating.question8,
            },
            update: {
              question1: selfRating.question1,
              question2: selfRating.question2,
              question3: selfRating.question3,
              question4: selfRating.question4,
              question5: selfRating.question5,
              question6: selfRating.question6,
              question7: selfRating.question7,
              question8: selfRating.question8,
            },
          },
        },
      },
    });
    
    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Error updating self-rating:', error);
    return { success: false, error: 'Failed to update self-rating' };
  }
}

/**
 * Switch user's organization
 */
export async function switchOrganization(organizationId: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId },
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error switching organization:', error);
    return { success: false, error: 'Failed to switch organization' };
  }
}
/**
 * Update user profile (name, location, preferred game type, sex)
 */
export async function updateProfile(data: {
  name?: string;
  location?: string;
  preferredGameType?: string;
  sex?: string;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.location && { location: data.location }),
        ...(data.preferredGameType && { preferredGameType: data.preferredGameType }),
        ...(data.sex && { sex: data.sex }),
      },
    });
    
    revalidatePath('/');
    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}