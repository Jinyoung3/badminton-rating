'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { 
  calculateSinglesRatingChanges, 
  calculateDoublesRatingChanges,
  applyRatingChange,
  RATING_CONSTANTS 
} from '@/lib/rating/calculator';
import { determineMatchWinner } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

interface GameScore {
  team1: number;
  team2: number;
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
    // Validate game type and players
    if (data.gameType === 'singles' && (data.player3Id || data.player4Id)) {
      return { success: false, error: 'Singles matches can only have 2 players' };
    }
    
    if (data.gameType === 'doubles' && (!data.player3Id || !data.player4Id)) {
      return { success: false, error: 'Doubles matches require 4 players' };
    }

    const playerIds = [
      data.player1Id,
      data.player2Id,
      ...(data.player3Id ? [data.player3Id] : []),
      ...(data.player4Id ? [data.player4Id] : []),
    ];
    if (!playerIds.includes(user.id)) {
      return {
        success: false,
        error: 'You can only record a challenge match if you are one of the players.',
      };
    }

    // Determine winner
    const winner = determineMatchWinner(data.games);
    
    // Get current ratings
    const players = await prisma.user.findMany({
      where: {
        id: {
          in: [
            data.player1Id,
            data.player2Id,
            ...(data.player3Id ? [data.player3Id] : []),
            ...(data.player4Id ? [data.player4Id] : []),
          ],
        },
      },
    });
    
    const player1 = players.find(p => p.id === data.player1Id)!;
    const player2 = players.find(p => p.id === data.player2Id)!;
    const player3 = data.player3Id ? players.find(p => p.id === data.player3Id) : null;
    const player4 = data.player4Id ? players.find(p => p.id === data.player4Id) : null;
    
    let ratingChanges: {
      player1Change: number;
      player2Change: number;
      player3Change?: number;
      player4Change?: number;
    };
    
    // Calculate rating changes
    if (data.gameType === 'singles') {
      ratingChanges = calculateSinglesRatingChanges(
        player1.rating,
        player2.rating,
        winner
      );
    } else {
      ratingChanges = calculateDoublesRatingChanges(
        player1.rating,
        player2.rating,
        player3!.rating,
        player4!.rating,
        winner
      );
    }
    
    // Only apply rating changes if not a practice match
    const shouldUpdateRatings = !data.isPractice && !RATING_CONSTANTS.PRACTICE_AFFECTS_RATING;
    
    // Create match and update ratings in a transaction
    const match = await prisma.$transaction(async (tx) => {
      // Create match
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
        include: {
          player1: true,
          player2: true,
          player3: true,
          player4: true,
        },
      });
      
      if (shouldUpdateRatings) {
        // Update player 1
        const newPlayer1Rating = applyRatingChange(player1.rating, ratingChanges.player1Change);
        await tx.user.update({
          where: { id: player1.id },
          data: {
            rating: newPlayer1Rating,
            winCount: winner === 'team1' ? { increment: 1 } : undefined,
            lossCount: winner !== 'team1' ? { increment: 1 } : undefined,
          },
        });
        
        // Update player 2
        const newPlayer2Rating = applyRatingChange(player2.rating, ratingChanges.player2Change);
        await tx.user.update({
          where: { id: player2.id },
          data: {
            rating: newPlayer2Rating,
            winCount: winner === 'team1' ? { increment: 1 } : undefined,
            lossCount: winner !== 'team1' ? { increment: 1 } : undefined,
          },
        });
        
        // Update players 3 and 4 for doubles
        if (data.gameType === 'doubles' && player3 && player4) {
          const newPlayer3Rating = applyRatingChange(player3.rating, ratingChanges.player3Change!);
          await tx.user.update({
            where: { id: player3.id },
            data: {
              rating: newPlayer3Rating,
              winCount: winner === 'team2' ? { increment: 1 } : undefined,
              lossCount: winner !== 'team2' ? { increment: 1 } : undefined,
            },
          });
          
          const newPlayer4Rating = applyRatingChange(player4.rating, ratingChanges.player4Change!);
          await tx.user.update({
            where: { id: player4.id },
            data: {
              rating: newPlayer4Rating,
              winCount: winner === 'team2' ? { increment: 1 } : undefined,
              lossCount: winner !== 'team2' ? { increment: 1 } : undefined,
            },
          });
        }
      }
      
      return newMatch;
    });
    
    revalidatePath('/record');
    revalidatePath('/dashboard');
    
    return { 
      success: true, 
      match,
      ratingChanges: shouldUpdateRatings ? ratingChanges : null,
    };
  } catch (error) {
    console.error('Error recording match:', error);
    return { success: false, error: 'Failed to record match' };
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
    where: { id: data.eventId },
  });
  
  if (!event || event.creatorId !== user.id) {
    return { success: false, error: 'Only event creator can record matches' };
  }
  
  try {
    // Validate game type and players
    if (data.gameType === 'singles' && (data.player3Id || data.player4Id)) {
      return { success: false, error: 'Singles matches can only have 2 players' };
    }
    
    if (data.gameType === 'doubles' && (!data.player3Id || !data.player4Id)) {
      return { success: false, error: 'Doubles matches require 4 players' };
    }
    
    // Verify all players are participants
    const participants = await prisma.eventParticipant.findMany({
      where: { eventId: data.eventId },
    });
    
    const participantIds = new Set(participants.map(p => p.userId));
    const allPlayerIds = [data.player1Id, data.player2Id, data.player3Id, data.player4Id].filter(Boolean);
    
    if (!allPlayerIds.every(id => participantIds.has(id!))) {
      return { success: false, error: 'All players must be event participants' };
    }
    
    // Determine winner
    const winner = determineMatchWinner(data.games);
    
    // Get current ratings
    const players = await prisma.user.findMany({
      where: {
        id: {
          in: allPlayerIds as string[],
        },
      },
    });
    
    const player1 = players.find(p => p.id === data.player1Id)!;
    const player2 = players.find(p => p.id === data.player2Id)!;
    const player3 = data.player3Id ? players.find(p => p.id === data.player3Id) : null;
    const player4 = data.player4Id ? players.find(p => p.id === data.player4Id) : null;
    
    let ratingChanges: {
      player1Change: number;
      player2Change: number;
      player3Change?: number;
      player4Change?: number;
    };
    
    // Calculate rating changes
    if (data.gameType === 'singles') {
      ratingChanges = calculateSinglesRatingChanges(
        player1.rating,
        player2.rating,
        winner
      );
    } else {
      ratingChanges = calculateDoublesRatingChanges(
        player1.rating,
        player2.rating,
        player3!.rating,
        player4!.rating,
        winner
      );
    }
    
    // Create match and update ratings in a transaction
    const match = await prisma.$transaction(async (tx) => {
      // Create match
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
        include: {
          player1: true,
          player2: true,
          player3: true,
          player4: true,
          event: true,
        },
      });
      
      // Update ratings and stats
      const newPlayer1Rating = applyRatingChange(player1.rating, ratingChanges.player1Change);
      await tx.user.update({
        where: { id: player1.id },
        data: {
          rating: newPlayer1Rating,
          winCount: winner === 'team1' ? { increment: 1 } : undefined,
          lossCount: winner !== 'team1' ? { increment: 1 } : undefined,
        },
      });
      
      const newPlayer2Rating = applyRatingChange(player2.rating, ratingChanges.player2Change);
      await tx.user.update({
        where: { id: player2.id },
        data: {
          rating: newPlayer2Rating,
          winCount: winner === 'team1' ? { increment: 1 } : undefined,
          lossCount: winner !== 'team1' ? { increment: 1 } : undefined,
        },
      });
      
      if (data.gameType === 'doubles' && player3 && player4) {
        const newPlayer3Rating = applyRatingChange(player3.rating, ratingChanges.player3Change!);
        await tx.user.update({
          where: { id: player3.id },
          data: {
            rating: newPlayer3Rating,
            winCount: winner === 'team2' ? { increment: 1 } : undefined,
            lossCount: winner !== 'team2' ? { increment: 1 } : undefined,
          },
        });
        
        const newPlayer4Rating = applyRatingChange(player4.rating, ratingChanges.player4Change!);
        await tx.user.update({
          where: { id: player4.id },
          data: {
            rating: newPlayer4Rating,
            winCount: winner === 'team2' ? { increment: 1 } : undefined,
            lossCount: winner !== 'team2' ? { increment: 1 } : undefined,
          },
        });
      }
      
      return newMatch;
    });
    
    revalidatePath(`/event/${data.eventId}`);
    revalidatePath('/dashboard');
    
    return { 
      success: true, 
      match,
      ratingChanges,
    };
  } catch (error) {
    console.error('Error recording event match:', error);
    return { success: false, error: 'Failed to record match' };
  }
}

/**
 * Get all users for player selection
 */
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        userNumber: true,
        rating: true,
        preferredGameType: true,
        location: true,
      },
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Create a score correction request
 */
export async function createScoreCorrectionRequest(data: {
  matchId: string;
  eventId: string;
  reason: string;
}) {
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
    const request = await prisma.scoreCorrectionRequest.create({
      data: {
        matchId: data.matchId,
        eventId: data.eventId,
        requesterId: user.id,
        reason: data.reason,
        status: 'pending',
      },
    });
    
    revalidatePath(`/event/${data.eventId}`);
    
    return { success: true, request };
  } catch (error) {
    console.error('Error creating correction request:', error);
    return { success: false, error: 'Failed to create correction request' };
  }
}