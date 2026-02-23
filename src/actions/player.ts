'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

async function hydratePlayersWithLiveRecord(players: any[]) {
  if (players.length === 0) {
    return players;
  }

  const playerIds = players.map((p) => p.id);
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { player1Id: { in: playerIds } },
        { player2Id: { in: playerIds } },
        { player3Id: { in: playerIds } },
        { player4Id: { in: playerIds } },
      ],
    },
    select: {
      gameType: true,
      winner: true,
      player1Id: true,
      player2Id: true,
      player3Id: true,
      player4Id: true,
    },
  });

  const record = new Map<string, { winCount: number; lossCount: number }>();
  for (const id of playerIds) {
    record.set(id, { winCount: 0, lossCount: 0 });
  }

  for (const match of matches) {
    if (match.gameType === 'singles') {
      const p1 = record.get(match.player1Id);
      const p2 = record.get(match.player2Id);
      if (p1) {
        if (match.winner === 'team1') p1.winCount += 1;
        else p1.lossCount += 1;
      }
      if (p2) {
        if (match.winner === 'team2') p2.winCount += 1;
        else p2.lossCount += 1;
      }
      continue;
    }

    const team1 = [match.player1Id, match.player2Id].filter(Boolean) as string[];
    const team2 = [match.player3Id, match.player4Id].filter(Boolean) as string[];

    for (const id of team1) {
      const s = record.get(id);
      if (!s) continue;
      if (match.winner === 'team1') s.winCount += 1;
      else s.lossCount += 1;
    }
    for (const id of team2) {
      const s = record.get(id);
      if (!s) continue;
      if (match.winner === 'team2') s.winCount += 1;
      else s.lossCount += 1;
    }
  }

  return players.map((player) => ({
    ...player,
    ...(record.get(player.id) ?? { winCount: 0, lossCount: 0 }),
  }));
}

/**
 * Search players by name, location, or rating range
 */
export async function searchPlayers(params: {
  query?: string;
  location?: string;
  minRating?: number;
  maxRating?: number;
  preferredGameType?: string;
  organizationId?: string;
  limit?: number;
}) {
  const {
    query,
    location,
    minRating,
    maxRating,
    preferredGameType,
    organizationId,
    limit = 20,
  } = params;

  try {
    const players = await prisma.user.findMany({
      where: {
        // No profileCompleted filter — match leaderboard (show all users with profiles)
        ...(query && {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        }),
        ...(location && {
          location: {
            contains: location,
            mode: 'insensitive',
          },
        }),
        ...(minRating !== undefined && {
          rating: {
            gte: minRating,
          },
        }),
        ...(maxRating !== undefined && {
          rating: {
            lte: maxRating,
          },
        }),
        ...(preferredGameType && {
          preferredGameType,
        }),
        ...(organizationId && {
          organizationId,
        }),
      },
      include: {
        organization: true,
      },
      orderBy: {
        rating: 'desc',
      },
      take: limit,
    });

    return await hydratePlayersWithLiveRecord(players);
  } catch (error) {
    console.error('Error searching players:', error);
    return [];
  }
}

/**
 * Get player profile by ID with detailed stats
 */
export async function getPlayerProfile(playerId: string) {
  try {
    const player = await prisma.user.findUnique({
      where: { id: playerId },
      include: {
        organization: true,
        selfRating: true,
        matchesAsPlayer1: {
          include: {
            player2: true,
            player3: true,
            player4: true,
            event: true,
          },
          orderBy: {
            matchDate: 'desc',
          },
          take: 10,
        },
        matchesAsPlayer2: {
          include: {
            player1: true,
            player3: true,
            player4: true,
            event: true,
          },
          orderBy: {
            matchDate: 'desc',
          },
          take: 10,
        },
        matchesAsPlayer3: {
          include: {
            player1: true,
            player2: true,
            player4: true,
            event: true,
          },
          orderBy: {
            matchDate: 'desc',
          },
          take: 10,
        },
        matchesAsPlayer4: {
          include: {
            player1: true,
            player2: true,
            player3: true,
            event: true,
          },
          orderBy: {
            matchDate: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!player) return null;

    // Combine all matches
    const allMatches = [
      ...player.matchesAsPlayer1,
      ...player.matchesAsPlayer2,
      ...player.matchesAsPlayer3,
      ...player.matchesAsPlayer4,
    ].sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());

    // Calculate additional stats
    const singlesMatches = allMatches.filter(m => m.gameType === 'singles');
    const doublesMatches = allMatches.filter(m => m.gameType === 'doubles');
    
    const singlesWins = singlesMatches.filter(m => {
      const isPlayer1 = m.player1Id === player.id;
      return (isPlayer1 && m.winner === 'team1') || (!isPlayer1 && m.winner === 'team2');
    }).length;

    const doublesWins = doublesMatches.filter(m => {
      const isTeam1 = m.player1Id === player.id || m.player2Id === player.id;
      return (isTeam1 && m.winner === 'team1') || (!isTeam1 && m.winner === 'team2');
    }).length;

    return {
      ...player,
      recentMatches: allMatches.slice(0, 10),
      stats: {
        totalMatches: allMatches.length,
        singlesRecord: {
          wins: singlesWins,
          losses: singlesMatches.length - singlesWins,
          winRate: singlesMatches.length > 0 
            ? ((singlesWins / singlesMatches.length) * 100).toFixed(1)
            : '0.0',
        },
        doublesRecord: {
          wins: doublesWins,
          losses: doublesMatches.length - doublesWins,
          winRate: doublesMatches.length > 0
            ? ((doublesWins / doublesMatches.length) * 100).toFixed(1)
            : '0.0',
        },
      },
    };
  } catch (error) {
    console.error('Error fetching player profile:', error);
    return null;
  }
}

/**
 * Get match history for a player
 */
export async function getPlayerMatchHistory(
  playerId: string,
  params?: {
    gameType?: 'singles' | 'doubles';
    matchType?: 'event' | 'challenge' | 'practice';
    limit?: number;
    offset?: number;
  }
) {
  const { gameType, matchType, limit = 20, offset = 0 } = params || {};

  try {
    const whereClause = {
      OR: [
        { player1Id: playerId },
        { player2Id: playerId },
        { player3Id: playerId },
        { player4Id: playerId },
      ],
      ...(gameType && { gameType }),
      ...(matchType && { type: matchType }),
    };

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where: whereClause,
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
        skip: offset,
      }),
      prisma.match.count({ where: whereClause }),
    ]);

    return { matches, total };
  } catch (error) {
    console.error('Error fetching match history:', error);
    return { matches: [], total: 0 };
  }
}

/**
 * Get current user's profile for editing
 */
export async function getMyProfile() {
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
