'use server';

import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { calculateInitialRating, type SelfRatingAnswers } from '@/lib/rating/calculator';
import { revalidatePath } from 'next/cache';

/**
 * Get current user's profile from database
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const userInclude = {
    organization: true,
    selfRating: true,
  } as const;

  // Primary lookup: linked Clerk account id
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: userInclude,
  });

  if (user) {
    return user;
  }

  // Fallback: account/provider switched, but profile already exists by email
  const clerk = await currentUser();
  const clerkEmail = clerk?.emailAddresses?.[0]?.emailAddress?.trim();
  if (!clerkEmail) {
    return null;
  }

  const existingByEmail = await prisma.user.findFirst({
    where: {
      email: {
        equals: clerkEmail,
        mode: 'insensitive',
      },
    },
    include: userInclude,
  });

  if (!existingByEmail) {
    return null;
  }

  // Keep the DB linked to the currently signed-in Clerk account
  user = await prisma.user.update({
    where: { id: existingByEmail.id },
    data: { clerkId: userId, email: clerkEmail },
    include: userInclude,
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
  
  const initialRating = calculateInitialRating(data.selfRating);
  let organizationId: string | null = data.organizationId?.trim() || null;

  // Ensure organization exists when provided (avoids foreign key errors)
  if (organizationId) {
    const org = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) organizationId = null;
  }

  const selfRatingData = {
    question1: data.selfRating.question1,
    question2: data.selfRating.question2,
    question3: data.selfRating.question3,
    question4: data.selfRating.question4,
    question5: data.selfRating.question5,
    question6: data.selfRating.question6,
    question7: data.selfRating.question7,
    question8: data.selfRating.question8,
  };

  const roundedRating = Math.round(initialRating.mu);
  const userUpdateData = {
    profileCompleted: true,
    name: data.name,
    sex: data.sex,
    location: data.location,
    preferredGameType: data.preferredGameType,
    organizationId,
    ratingMu: initialRating.mu,
    ratingPhi: initialRating.phi,
    ratingSigma: initialRating.sigma,
    rating: roundedRating,
    ratingSingles: roundedRating,
    ratingMuSingles: initialRating.mu,
    ratingPhiSingles: initialRating.phi,
    ratingSigmaSingles: initialRating.sigma,
    ratingDoubles: roundedRating,
    ratingMuDoubles: initialRating.mu,
    ratingPhiDoubles: initialRating.phi,
    ratingSigmaDoubles: initialRating.sigma,
  };

  try {
    // 1) Find by clerkId (existing linked user)
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true, selfRating: true },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: userUpdateData,
      });
    } else {
      // 2) Find by email (same person, new Clerk session – link account)
      const existingByEmail = await prisma.user.findUnique({
        where: { email: data.email.trim() },
      });
      if (existingByEmail) {
        await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { ...userUpdateData, clerkId: userId },
        });
        user = await prisma.user.findUnique({
          where: { id: existingByEmail.id },
          include: { organization: true, selfRating: true },
        })!;
      } else {
        // 3) New user – create
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: data.email.trim(),
            name: data.name,
            sex: data.sex,
            location: data.location,
            preferredGameType: data.preferredGameType,
            organizationId,
            ratingMu: initialRating.mu,
            ratingPhi: initialRating.phi,
            ratingSigma: initialRating.sigma,
            rating: roundedRating,
            ratingSingles: roundedRating,
            ratingMuSingles: initialRating.mu,
            ratingPhiSingles: initialRating.phi,
            ratingSigmaSingles: initialRating.sigma,
            ratingDoubles: roundedRating,
            ratingMuDoubles: initialRating.mu,
            ratingPhiDoubles: initialRating.phi,
            ratingSigmaDoubles: initialRating.sigma,
            profileCompleted: true,
            selfRating: {
              create: selfRatingData,
            },
          },
          include: {
            organization: true,
            selfRating: true,
          },
        });
      }
    }

    if (!user) {
      throw new Error('User not found after create/update');
    }

    // Upsert SelfRating (create or update)
    await prisma.selfRating.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...selfRatingData },
      update: selfRatingData,
    });

    revalidatePath('/');
    return { success: true, user };
  } catch (error) {
    console.error('Error creating user profile:', error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Wrapper function to avoid "Cannot redefine property: $$id" error.
 * This provides a new function reference for the Server Action registry.
 */
export async function completeProfile(data: {
  email: string;
  name: string;
  sex: string;
  location: string;
  preferredGameType: string;
  organizationId: string;
  selfRating: {
    question1: number;
    question2: number;
    question3: number;
    question4: number;
    question5: number;
    question6: number;
    question7: number;
    question8: number;
  };
}) {
  return createUserProfile(data);
}

/**
 * Update user's self-rating and recalculate rating
 */
export async function updateSelfRating(selfRating: SelfRatingAnswers) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  const newRating = calculateInitialRating(selfRating);
  
  // Validation fix: Check for property existence on the Rating object
  if (!newRating || typeof newRating.mu !== 'number') {
    console.error('Invalid rating calculated:', newRating, 'from selfRating:', selfRating);
    return { success: false, error: 'Failed to calculate rating' };
  }
  
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ratingMu: newRating.mu,
        ratingPhi: newRating.phi,
        ratingSigma: newRating.sigma, // Fixed typo from 'ratingingSigma'
        rating: Math.round(newRating.mu),
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
  if (!user) throw new Error('Not authenticated');
  
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId },
    });
    
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/organization');
    return { success: true };
  } catch (error) {
    console.error('Error switching organization:', error);
    return { success: false, error: 'Failed to switch organization' };
  }
}

/**
 * Update user profile details
 */
export async function updateProfile(data: {
  name?: string;
  location?: string;
  preferredGameType?: string;
  sex?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  
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
