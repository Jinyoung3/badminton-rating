'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/actions/user';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  if (!user.isAdmin) {
    throw new Error('Admin access required');
  }
  return user;
}

export async function getAdminData() {
  await requireAdmin();

  const [players, organizations, events, matches] = await Promise.all([
    prisma.user.findMany({
      orderBy: { userNumber: 'desc' },
      include: { organization: true },
      take: 50,
    }),
    prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { members: true, events: true },
        },
      },
      take: 50,
    }),
    prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        organization: true,
        creator: true,
        _count: {
          select: { participants: true, matches: true },
        },
      },
      take: 50,
    }),
    prisma.match.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        event: true,
        player1: true,
        player2: true,
      },
      take: 50,
    }),
  ]);

  return { players, organizations, events, matches };
}

export async function deleteEventAdmin(eventId: string) {
  await requireAdmin();

  try {
    await prisma.event.delete({ where: { id: eventId } });
    revalidatePath('/event');
    revalidatePath('/dashboard');
    revalidatePath('/leaderboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to delete event' };
  }
}

export async function deleteMatchAdmin(matchId: string) {
  await requireAdmin();

  try {
    await prisma.match.delete({ where: { id: matchId } });
    revalidatePath('/matches');
    revalidatePath('/dashboard');
    revalidatePath('/leaderboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to delete match' };
  }
}

export async function deleteOrganizationAdmin(organizationId: string) {
  await requireAdmin();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.updateMany({
        where: { organizationId },
        data: { organizationId: null },
      });
      await tx.organization.delete({ where: { id: organizationId } });
    });

    revalidatePath('/organization');
    revalidatePath('/event');
    revalidatePath('/leaderboard');
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to delete organization' };
  }
}

export async function deletePlayerAdmin(playerId: string) {
  const admin = await requireAdmin();

  if (admin.id === playerId) {
    return { success: false, error: 'You cannot delete your own admin account.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.scoreCorrectionRequest.deleteMany({
        where: { requesterId: playerId },
      });

      await tx.eventParticipant.deleteMany({
        where: { userId: playerId },
      });

      await tx.match.deleteMany({
        where: {
          OR: [
            { creatorId: playerId },
            { player1Id: playerId },
            { player2Id: playerId },
            { player3Id: playerId },
            { player4Id: playerId },
          ],
        },
      });

      await tx.event.deleteMany({
        where: { creatorId: playerId },
      });

      await tx.user.delete({
        where: { id: playerId },
      });
    });

    revalidatePath('/player');
    revalidatePath('/event');
    revalidatePath('/matches');
    revalidatePath('/leaderboard');
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to delete player' };
  }
}
