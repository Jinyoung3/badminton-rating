'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { 
  calculateSinglesRatingChanges, 
  calculateDoublesRatingChanges,
  RATING_CONSTANTS 
} from '@/lib/rating/calculator';
import { determineMatchWinner } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

interface GameScore {
  team1: number;
  team2: number;
}

/**
 * Shared logic to handle player validation and rating calculation
 */
async function processMatchData(data: {
  gameType: 'singles' | 'doubles';
  player1Id: string;
  player2Id: string;
  player3Id?: string;
  player4Id?: string;
  games: GameScore[];
}) {
  const playerIds = [
    data.player1Id,
    data.player2Id,
    ...(data.player3Id ? [data.player3Id] : []),
    ...(data.player4Id ? [data.player4Id] : []),
  ];

  // Validate player counts
  if (data.gameType === 'singles' && playerIds.length !== 2) {
    throw new Error('Singles matches must have exactly 2 players');
  }
  if (data.gameType === 'doubles' && playerIds.length !== 4) {
    throw new Error('Doubles matches require 4 players');
  }

  const players = await prisma.user.findMany({
    where: { id: { in: playerIds } },
  });

  const playerMap = new Map(players.map(p => [p.id, p]));
  const getRating = (id: string) => {
    const p = playerMap.get(id);
    if (!p) throw new Error(`Player ${id} not found`);
    return { mu: p.ratingMu, phi: p.ratingPhi, sigma: p.ratingSigma };
  };

  const winner = determineMatchWinner(data.games);
  
  // Calculate rating changes based on game type
  const ratingChanges = data.gameType === 'singles' 
    ? calculateSinglesRatingChanges(getRating(data.player1Id), getRating(data.player2Id), winner)
    : calculateDoublesRatingChanges(
        getRating(data.player1Id), 
        getRating(data.player2Id), 
        getRating(data.player3Id!), 
        getRating(data.player4Id!), 
        winner
      );

  return { players: playerMap, winner, ratingChanges };
}

/**
 * Record a challenge match (casual play)
 */
export async function recordChallengeMatch(data: {
  gameType: 'singles' | 'doubles';
  player1Id: string;
  player2Id: string;
  player3Id?: string;
  player4Id?: string;
  games: GameScore[];
  isPractice?: boolean;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error('Not authenticated');

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error('User not found');

  try {
    const { winner, ratingChanges } = await processMatchData(data);
    
    const playerIds = [data.player1Id, data.player2Id, data.player3Id, data.player4Id].filter(Boolean);
    if (!playerIds.includes(user.id)) {
      return { success: false, error: 'You must be a participant to record this match.' };
    }

    // Normal matches always update; practice matches depend on constants
    const shouldUpdate = !data.isPractice || RATING_CONSTANTS.PRACTICE_AFFECTS_RATING;

    const match = await prisma.$transaction(async (tx) => {
      const newMatch = await tx.match.create({
        data: {
          type: data.isPractice ? 'practice' : 'challenge',
          gameType: data.gameType,
          creatorId: user.id,
          player1Id: data.player1Id,
          player2Id: data.player2Id,
          player3Id: data.player3Id,
          player4Id: data.player4Id,
          games: data.games,
          winner,
        },
        include: { player1: true, player2: true, player3: true, player4: true },
      });

      if (shouldUpdate) {
        await updateMatchRatings(tx, data, ratingChanges, winner);
      }
      return newMatch;
    });

    revalidatePath('/record');
    revalidatePath('/dashboard');
    return { success: true, match, ratingChanges: shouldUpdate ? ratingChanges : null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record match' };
  }
}

/**
 * Record an event match (creator only)
 */
export async function recordEventMatch(data: {
  eventId: string;
  gameType: 'singles' | 'doubles';
  player1Id: string;
  player2Id: string;
  player3Id?: string;
  player4Id?: string;
  games: GameScore[];
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error('Not authenticated');

  const user = await prisma.user.findUnique({ where: { clerkId } });
  const event = await prisma.event.findUnique({ where: { id: data.eventId } });
  
  if (!user || !event || event.creatorId !== user.id) {
    return { success: false, error: 'Only event creator can record matches' };
  }

  try {
    const { winner, ratingChanges } = await processMatchData(data);

    const match = await prisma.$transaction(async (tx) => {
      const newMatch = await tx.match.create({
        data: {
          type: 'event',
          gameType: data.gameType,
          eventId: data.eventId,
          creatorId: user.id,
          player1Id: data.player1Id,
          player2Id: data.player2Id,
          player3Id: data.player3Id,
          player4Id: data.player4Id,
          games: data.games,
          winner,
        },
        include: { player1: true, player2: true, player3: true, player4: true, event: true },
      });

      await updateMatchRatings(tx, data, ratingChanges, winner);
      return newMatch;
    });

    revalidatePath(`/event/${data.eventId}`);
    revalidatePath('/dashboard');
    return { success: true, match, ratingChanges };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record event match' };
  }
}

/**
 * Internal helper to apply rating updates to the database
 */
async function updateMatchRatings(tx: any, data: any, changes: any, winner: string) {
  const playersToUpdate = [
    { id: data.player1Id, rating: changes.player1NewRating, team: 'team1' },
    { id: data.player2Id, rating: changes.player2NewRating, team: 'team1' },
  ];

  if (data.gameType === 'doubles') {
    playersToUpdate.push(
      { id: data.player3Id, rating: (changes as any).player3NewRating, team: 'team2' },
      { id: data.player4Id, rating: (changes as any).player4NewRating, team: 'team2' }
    );
  }

  for (const p of playersToUpdate) {
    await tx.user.update({
      where: { id: p.id },
      data: {
        ratingMu: p.rating.mu,
        ratingPhi: p.rating.phi,
        ratingSigma: p.rating.sigma,
        rating: Math.round(p.rating.mu),
        winCount: winner === p.team ? { increment: 1 } : undefined,
        lossCount: winner !== p.team ? { increment: 1 } : undefined,
      },
    });
  }
}

export async function getAllUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        userNumber: true,
        rating: true,
        preferredGameType: true,
        location: true,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}