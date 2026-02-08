'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Request a score correction for a match (participants only)
 */
export async function requestScoreCorrection(
  matchId: string,
  eventId: string,
  reason: string
) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  try {
    // Verify match exists and is part of event
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match || match.eventId !== eventId) {
      return { success: false, error: 'Invalid match or event' };
    }

    // Verify user is a participant in the match
    const isParticipant = 
      match.player1Id === user.id ||
      match.player2Id === user.id ||
      match.player3Id === user.id ||
      match.player4Id === user.id;

    if (!isParticipant) {
      return { success: false, error: 'Only match participants can request corrections' };
    }

    // Check if user already has a pending request for this match
    const existingRequest = await prisma.scoreCorrectionRequest.findFirst({
      where: {
        matchId,
        requesterId: user.id,
        status: 'pending',
      },
    });

    if (existingRequest) {
      return { success: false, error: 'You already have a pending correction request for this match' };
    }

    // Create correction request
    await prisma.scoreCorrectionRequest.create({
      data: {
        matchId,
        eventId,
        requesterId: user.id,
        reason,
        status: 'pending',
      },
    });

    revalidatePath(`/event/${eventId}`);
    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error('Error requesting score correction:', error);
    return { success: false, error: 'Failed to submit correction request' };
  }
}

/**
 * Get all score correction requests for an event (creator only)
 */
export async function getEventCorrectionRequests(eventId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify user is event creator
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.creatorId !== user.id) {
    return { success: false, error: 'Only event creator can view correction requests' };
  }

  try {
    const requests = await prisma.scoreCorrectionRequest.findMany({
      where: { eventId },
      include: {
        requester: true,
        match: {
          include: {
            player1: true,
            player2: true,
            player3: true,
            player4: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, requests };
  } catch (error) {
    console.error('Error fetching correction requests:', error);
    return { success: false, error: 'Failed to fetch correction requests' };
  }
}

/**
 * Approve a score correction request
 */
export async function approveCorrectionRequest(requestId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  try {
    // Get the request with event
    const request = await prisma.scoreCorrectionRequest.findUnique({
      where: { id: requestId },
      include: { event: true },
    });

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    // Verify user is event creator
    if (request.event.creatorId !== user.id) {
      return { success: false, error: 'Only event creator can approve requests' };
    }

    // Update request status
    await prisma.scoreCorrectionRequest.update({
      where: { id: requestId },
      data: { status: 'approved' },
    });

    revalidatePath(`/event/${request.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error approving correction request:', error);
    return { success: false, error: 'Failed to approve request' };
  }
}

/**
 * Reject a score correction request
 */
export async function rejectCorrectionRequest(requestId: string, reason?: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  try {
    // Get the request with event
    const request = await prisma.scoreCorrectionRequest.findUnique({
      where: { id: requestId },
      include: { event: true },
    });

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    // Verify user is event creator
    if (request.event.creatorId !== user.id) {
      return { success: false, error: 'Only event creator can reject requests' };
    }

    // Update request status
    await prisma.scoreCorrectionRequest.update({
      where: { id: requestId },
      data: { 
        status: 'rejected',
        // Optionally add rejection reason to the reason field
        ...(reason && { reason: `${request.reason}\n\nRejection reason: ${reason}` }),
      },
    });

    revalidatePath(`/event/${request.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error rejecting correction request:', error);
    return { success: false, error: 'Failed to reject request' };
  }
}

/**
 * Get user's own correction requests
 */
export async function getMyCorrectionRequests() {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return [];
  }

  try {
    const requests = await prisma.scoreCorrectionRequest.findMany({
      where: { requesterId: user.id },
      include: {
        match: {
          include: {
            player1: true,
            player2: true,
            player3: true,
            player4: true,
          },
        },
        event: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests;
  } catch (error) {
    console.error('Error fetching user correction requests:', error);
    return [];
  }
}