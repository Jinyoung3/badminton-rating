'use server';

import { randomUUID } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { determineMatchWinner, getOpponentIds } from '@/lib/utils';

type GameScore = { team1: number; team2: number };

/**
 * Request a score correction for a match (participants only). Opponent can accept or reject.
 */
export async function requestScoreCorrection(
  matchId: string,
  reason: string,
  proposedGames: GameScore[],
  eventId?: string | null
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
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return { success: false, error: 'Match not found' };
    }
    if (match.eventId && eventId !== match.eventId) {
      return { success: false, error: 'Invalid match or event' };
    }

    const isParticipant =
      match.player1Id === user.id ||
      match.player2Id === user.id ||
      match.player3Id === user.id ||
      match.player4Id === user.id;

    if (!isParticipant) {
      return { success: false, error: 'Only match participants can request corrections' };
    }

    if (!Array.isArray(proposedGames) || proposedGames.length === 0) {
      return { success: false, error: 'Proposed score must be a non-empty list of games' };
    }
    const valid = proposedGames.every(
      (g) => typeof g?.team1 === 'number' && typeof g?.team2 === 'number'
    );
    if (!valid) {
      return { success: false, error: 'Each game must have team1 and team2 numbers' };
    }

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

    // Raw INSERT to avoid Prisma create input requiring both match and event relation objects (event is optional in schema)
    const id = randomUUID();
    const eventIdValue = eventId != null && eventId !== '' ? eventId : null;
    const proposedGamesJson = JSON.stringify(proposedGames) as any;
    await prisma.$executeRaw`
      INSERT INTO "ScoreCorrectionRequest" (id, "matchId", "eventId", "requesterId", reason, "proposedGames", status, "createdAt", "updatedAt")
      VALUES (${id}, ${matchId}, ${eventIdValue}, ${user.id}, ${reason}, ${proposedGamesJson}::jsonb, 'pending', NOW(), NOW())
    `;

    if (eventId) revalidatePath(`/event/${eventId}`);
    revalidatePath(`/matches/${matchId}`);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error requesting score correction:', error);
    return { success: false, error: 'Failed to submit correction request' };
  }
}

/**
 * Get all score correction requests for an event (creator only, read-only)
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

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.creatorId !== user.id) {
    return { success: false, error: 'Only event creator can view correction requests' };
  }

  try {
    const requests = await prisma.scoreCorrectionRequest.findMany({
      where: { eventId: eventId },
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
 * Approve a score correction request (opponent only). Updates match games and winner.
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
    const request = await prisma.scoreCorrectionRequest.findUnique({
      where: { id: requestId },
      include: { match: true },
    });

    if (!request) {
      return { success: false, error: 'Request not found' };
    }
    if (request.status !== 'pending') {
      return { success: false, error: 'Request is no longer pending' };
    }
    if (!request.proposedGames || typeof request.proposedGames !== 'object') {
      return { success: false, error: 'No proposed score to apply' };
    }

    const opponentIds = getOpponentIds(
      {
        player1Id: request.match.player1Id,
        player2Id: request.match.player2Id,
        player3Id: request.match.player3Id,
        player4Id: request.match.player4Id,
        gameType: request.match.gameType,
      },
      request.requesterId
    );
    if (!opponentIds.includes(user.id)) {
      return { success: false, error: 'Only the opponent can accept this correction' };
    }

    const proposedGames = request.proposedGames as GameScore[];
    const newWinner = determineMatchWinner(proposedGames);
    const oldWinner = request.match.winner;
    const winnerChanged = newWinner !== oldWinner;

    await prisma.$transaction(async (tx) => {
      // Update match with corrected scores and winner
      await tx.match.update({
        where: { id: request.matchId },
        data: { games: proposedGames as object, winner: newWinner },
      });

      // If the winner changed, reverse the old win/loss counts and apply new ones
      if (winnerChanged) {
        const isSingles = request.match.gameType === 'singles';
        const allPlayerIds = [
          request.match.player1Id,
          request.match.player2Id,
          ...(request.match.player3Id ? [request.match.player3Id] : []),
          ...(request.match.player4Id ? [request.match.player4Id] : []),
        ];

        for (const playerId of allPlayerIds) {
          const isTeam1 = isSingles
            ? playerId === request.match.player1Id
            : (playerId === request.match.player1Id || playerId === request.match.player2Id);
          const oldWon = (isTeam1 && oldWinner === 'team1') || (!isTeam1 && oldWinner === 'team2');
          const newWon = (isTeam1 && newWinner === 'team1') || (!isTeam1 && newWinner === 'team2');

          // Only update if this player's win/loss status changed
          if (oldWon !== newWon) {
            const countUpdate: Record<string, unknown> = {};
            if (oldWon) {
              // Was a win, now a loss
              countUpdate.winCount = { decrement: 1 };
              countUpdate.lossCount = { increment: 1 };
              if (isSingles) {
                countUpdate.winCountSingles = { decrement: 1 };
                countUpdate.lossCountSingles = { increment: 1 };
              } else {
                countUpdate.winCountDoubles = { decrement: 1 };
                countUpdate.lossCountDoubles = { increment: 1 };
              }
            } else {
              // Was a loss, now a win
              countUpdate.winCount = { increment: 1 };
              countUpdate.lossCount = { decrement: 1 };
              if (isSingles) {
                countUpdate.winCountSingles = { increment: 1 };
                countUpdate.lossCountSingles = { decrement: 1 };
              } else {
                countUpdate.winCountDoubles = { increment: 1 };
                countUpdate.lossCountDoubles = { decrement: 1 };
              }
            }

            await tx.user.update({
              where: { id: playerId },
              data: countUpdate,
            });
          }
        }
      }

      await tx.scoreCorrectionRequest.update({
        where: { id: requestId },
        data: { status: 'approved' },
      });
    });

    revalidatePath(`/matches/${request.matchId}`);
    if (request.eventId) revalidatePath(`/event/${request.eventId}`);
    revalidatePath('/leaderboard');
    revalidatePath('/dashboard');
    return {
      success: true,
      warning: winnerChanged
        ? 'Score and win/loss counts corrected. Note: Glicko-2 rating points were not recalculated — a full recalculation would require replaying all subsequent matches.'
        : undefined,
    };
  } catch (error) {
    console.error('Error approving correction request:', error);
    return { success: false, error: 'Failed to approve request' };
  }
}

/**
 * Reject a score correction request (opponent only)
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
    const request = await prisma.scoreCorrectionRequest.findUnique({
      where: { id: requestId },
      include: { match: true },
    });

    if (!request) {
      return { success: false, error: 'Request not found' };
    }
    if (request.status !== 'pending') {
      return { success: false, error: 'Request is no longer pending' };
    }

    const opponentIds = getOpponentIds(
      {
        player1Id: request.match.player1Id,
        player2Id: request.match.player2Id,
        player3Id: request.match.player3Id,
        player4Id: request.match.player4Id,
        gameType: request.match.gameType,
      },
      request.requesterId
    );
    if (!opponentIds.includes(user.id)) {
      return { success: false, error: 'Only the opponent can reject this correction' };
    }

    await prisma.scoreCorrectionRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        ...(reason && { reason: `${request.reason}\n\nRejection reason: ${reason}` }),
      },
    });

    revalidatePath(`/matches/${request.matchId}`);
    if (request.eventId) revalidatePath(`/event/${request.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error rejecting correction request:', error);
    return { success: false, error: 'Failed to reject request' };
  }
}

/**
 * Get pending score correction requests where current user is the opponent (needs to accept/reject)
 */
export async function getPendingCorrectionRequestsForRespondent() {
  const { userId } = await auth();
  if (!userId) return [];

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return [];

  try {
    const pending = await prisma.scoreCorrectionRequest.findMany({
      where: { status: 'pending', requesterId: { not: user.id } },
      include: {
        match: {
          select: {
            id: true,
            player1Id: true,
            player2Id: true,
            player3Id: true,
            player4Id: true,
            gameType: true,
          },
        },
        requester: { select: { name: true, userNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const filtered = pending.filter((req) => {
      const opponentIds = getOpponentIds(
        {
          player1Id: req.match.player1Id,
          player2Id: req.match.player2Id,
          player3Id: req.match.player3Id,
          player4Id: req.match.player4Id,
          gameType: req.match.gameType,
        },
        req.requesterId
      );
      return opponentIds.includes(user.id);
    });
    return filtered.map((req) => ({
      id: req.id,
      matchId: req.match.id,
      requesterName: `${req.requester.name}#${req.requester.userNumber}`,
      reason: req.reason,
      createdAt: req.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching pending correction requests for respondent:', error);
    return [];
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