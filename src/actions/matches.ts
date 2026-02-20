'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function getMatches(params?: {
  gameType?: 'singles' | 'doubles';
  matchType?: 'event' | 'challenge' | 'practice';
  playerId?: string;
  eventId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const {
    gameType,
    matchType,
    playerId,
    eventId,
    startDate,
    endDate,
    limit = 20,
    offset = 0,
  } = params || {};

  try {
    // 1. Fix: Declare whereClause before adding matchDate
    const whereClause: any = {
      ...(gameType && { gameType }),
      ...(matchType && { type: matchType }),
      ...(eventId && { eventId }),
      ...(playerId && {
        OR: [
          { player1Id: playerId },
          { player2Id: playerId },
          { player3Id: playerId },
          { player4Id: playerId },
        ],
      }),
    };

    // 2. Add matchDate filters safely
    if (startDate || endDate) {
      whereClause.matchDate = {};
      if (startDate) whereClause.matchDate.gte = startDate;
      if (endDate) whereClause.matchDate.lte = endDate;
    }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where: whereClause,
        include: {
          player1: { include: { organization: true } },
          player2: { include: { organization: true } },
          player3: { include: { organization: true } },
          player4: { include: { organization: true } },
          event: { include: { organization: true } },
        },
        orderBy: { matchDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.match.count({ where: whereClause }),
    ]);

    return { matches, total };
  } catch (error) {
    console.error('Error fetching matches:', error);
    return { matches: [], total: 0 };
  }
}

/**
 * Get match by ID with full details.
 * Fixed: Consolidated into one query with includes to avoid type errors.
 */
export async function getMatchById(matchId: string) {
  if (!matchId || typeof matchId !== 'string') return null;

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        player1: { include: { organization: true } },
        player2: { include: { organization: true } },
        player3: { include: { organization: true } },
        player4: { include: { organization: true } },
        event: { include: { organization: true } },
        creator: true,
        scoreCorrectionRequests: {
          include: { requester: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return match;
  } catch (error) {
    console.error('Error fetching match:', error);
    return null;
  }
}
/**
 * Get recent matches for a user (for dashboard)
 */
export async function getRecentMatches(limit: number = 5) {
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
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { player1Id: user.id },
          { player2Id: user.id },
          { player3Id: user.id },
          { player4Id: user.id },
        ],
      },
      include: {
        player1: true,
        player2: true,
        player3: true,
        player4: true,
        event: true,
      },
      orderBy: {
        matchDate: 'desc',
      },
      take: limit,
    });

    return matches;
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    return [];
  }
}

/**
 * Get match statistics for current user
 */
export async function getMatchStatistics() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return null;
  }

  try {
    // Get all matches
    const allMatches = await prisma.match.findMany({
      where: {
        OR: [
          { player1Id: user.id },
          { player2Id: user.id },
          { player3Id: user.id },
          { player4Id: user.id },
        ],
      },
      include: {
        event: true,
      },
    });

    // Calculate overall stats
    const wins = allMatches.filter(m => {
      const isTeam1 = m.player1Id === user.id || m.player2Id === user.id;
      return (isTeam1 && m.winner === 'team1') || (!isTeam1 && m.winner === 'team2');
    }).length;

    const losses = allMatches.length - wins;

    // Calculate by game type
    const singlesMatches = allMatches.filter(m => m.gameType === 'singles');
    const doublesMatches = allMatches.filter(m => m.gameType === 'doubles');

    const singlesWins = singlesMatches.filter(m => {
      const isPlayer1 = m.player1Id === user.id;
      return (isPlayer1 && m.winner === 'team1') || (!isPlayer1 && m.winner === 'team2');
    }).length;

    const doublesWins = doublesMatches.filter(m => {
      const isTeam1 = m.player1Id === user.id || m.player2Id === user.id;
      return (isTeam1 && m.winner === 'team1') || (!isTeam1 && m.winner === 'team2');
    }).length;

    // Calculate by match type
    const eventMatches = allMatches.filter(m => m.type === 'event');
    const challengeMatches = allMatches.filter(m => m.type === 'challenge');
    const practiceMatches = allMatches.filter(m => m.type === 'practice');

    const eventWins = eventMatches.filter(m => {
      const isTeam1 = m.player1Id === user.id || m.player2Id === user.id;
      return (isTeam1 && m.winner === 'team1') || (!isTeam1 && m.winner === 'team2');
    }).length;

    const challengeWins = challengeMatches.filter(m => {
      const isTeam1 = m.player1Id === user.id || m.player2Id === user.id;
      return (isTeam1 && m.winner === 'team1') || (!isTeam1 && m.winner === 'team2');
    }).length;

    const practiceWins = practiceMatches.filter(m => {
      const isTeam1 = m.player1Id === user.id || m.player2Id === user.id;
      return (isTeam1 && m.winner === 'team1') || (!isTeam1 && m.winner === 'team2');
    }).length;

    return {
      overall: {
        total: allMatches.length,
        wins,
        losses,
        winRate: allMatches.length > 0 ? ((wins / allMatches.length) * 100).toFixed(1) : '0.0',
      },
      singles: {
        total: singlesMatches.length,
        wins: singlesWins,
        losses: singlesMatches.length - singlesWins,
        winRate: singlesMatches.length > 0 ? ((singlesWins / singlesMatches.length) * 100).toFixed(1) : '0.0',
      },
      doubles: {
        total: doublesMatches.length,
        wins: doublesWins,
        losses: doublesMatches.length - doublesWins,
        winRate: doublesMatches.length > 0 ? ((doublesWins / doublesMatches.length) * 100).toFixed(1) : '0.0',
      },
      byType: {
        event: {
          total: eventMatches.length,
          wins: eventWins,
          losses: eventMatches.length - eventWins,
        },
        challenge: {
          total: challengeMatches.length,
          wins: challengeWins,
          losses: challengeMatches.length - challengeWins,
        },
        practice: {
          total: practiceMatches.length,
          wins: practiceWins,
          losses: practiceMatches.length - practiceWins,
        },
      },
    };
  } catch (error) {
    console.error('Error calculating match statistics:', error);
    return null;
  }
}