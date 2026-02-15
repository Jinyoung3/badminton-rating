'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Create a new event
 */
export async function createEvent(data: {
  name: string;
  description?: string;
  location: string;
  date: Date;
  organizationId: string;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Not authenticated');
  }
  
  // Get current user
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  try {
    const event = await prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        date: data.date,
        organizationId: data.organizationId,
        creatorId: user.id,
      },
      include: {
        organization: true,
        creator: true,
        _count: {
          select: { participants: true },
        },
      },
    });
    
    revalidatePath('/event');
    return { success: true, event };
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, error: 'Failed to create event' };
  }
}

/**
 * Get all events (optionally filter by location or organization)
 */
export async function getEvents(filters?: {
  location?: string;
  organizationId?: string;
}) {
  try {
    const events = await prisma.event.findMany({
      where: {
        ...(filters?.location && {
          location: {
            contains: filters.location,
            mode: 'insensitive',
          },
        }),
        ...(filters?.organizationId && {
          organizationId: filters.organizationId,
        }),
      },
      include: {
        organization: true,
        creator: true,
        _count: {
          select: { participants: true },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

/**
 * Get event by ID with participants
 */
export async function getEventById(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organization: true,
        creator: true,
        participants: {
          include: {
            user: true,
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        _count: {
          select: { participants: true, matches: true },
        },
      },
    });
    
    return event;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

/**
 * Join an event by ID (e.g. from the event list)
 */
export async function joinEventById(eventId: string) {
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
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return { success: false, error: 'Event not found.' };
    }

    const existing = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'You have already joined this event' };
    }

    await prisma.eventParticipant.create({
      data: {
        eventId: event.id,
        userId: user.id,
      },
    });

    revalidatePath('/event');
    return { success: true, event };
  } catch (error) {
    console.error('Error joining event:', error);
    return { success: false, error: 'Failed to join event' };
  }
}

/**
 * Leave an event
 */
export async function leaveEvent(eventId: string) {
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
    await prisma.eventParticipant.delete({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        },
      },
    });
    
    revalidatePath('/event');
    return { success: true };
  } catch (error) {
    console.error('Error leaving event:', error);
    return { success: false, error: 'Failed to leave event' };
  }
}

/**
 * Remove participant from event (creator only)
 */
export async function removeParticipant(eventId: string, participantUserId: string) {
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
    return { success: false, error: 'Only event creator can remove participants' };
  }
  
  try {
    await prisma.eventParticipant.delete({
      where: {
        eventId_userId: {
          eventId,
          userId: participantUserId,
        },
      },
    });
    
    revalidatePath(`/event/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error removing participant:', error);
    return { success: false, error: 'Failed to remove participant' };
  }
}

/**
 * Mark participant as absent (creator only)
 */
export async function markParticipantAbsent(eventId: string, participantUserId: string, isAbsent: boolean) {
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
    return { success: false, error: 'Only event creator can mark attendance' };
  }
  
  try {
    await prisma.eventParticipant.update({
      where: {
        eventId_userId: {
          eventId,
          userId: participantUserId,
        },
      },
      data: {
        isAbsent,
      },
    });
    
    revalidatePath(`/event/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating attendance:', error);
    return { success: false, error: 'Failed to update attendance' };
  }
}

/**
 * Get user's joined events
 */
export async function getMyEvents() {
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
    const participants = await prisma.eventParticipant.findMany({
      where: { userId: user.id },
      include: {
        event: {
          include: {
            organization: true,
            creator: true,
            _count: {
              select: { participants: true },
            },
          },
        },
      },
      orderBy: {
        event: {
          date: 'asc',
        },
      },
    });
    
    return participants.map(p => p.event);
  } catch (error) {
    console.error('Error fetching user events:', error);
    return [];
  }
}

/**
 * Get events created by current user
 */
export async function getMyCreatedEvents() {
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
    const events = await prisma.event.findMany({
      where: { creatorId: user.id },
      include: {
        organization: true,
        _count: {
          select: { participants: true, matches: true },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching created events:', error);
    return [];
  }
}