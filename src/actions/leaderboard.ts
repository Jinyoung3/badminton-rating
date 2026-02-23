'use server';

import { prisma } from '@/lib/prisma';

async function hydrateUsersWithLiveRecords(users: any[]) {
  if (users.length === 0) {
    return users;
  }

  const userIds = users.map((u) => u.id);

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { player1Id: { in: userIds } },
        { player2Id: { in: userIds } },
        { player3Id: { in: userIds } },
        { player4Id: { in: userIds } },
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

  const stats = new Map<
    string,
    {
      winCount: number;
      lossCount: number;
      winCountSingles: number;
      lossCountSingles: number;
      winCountDoubles: number;
      lossCountDoubles: number;
    }
  >();

  for (const id of userIds) {
    stats.set(id, {
      winCount: 0,
      lossCount: 0,
      winCountSingles: 0,
      lossCountSingles: 0,
      winCountDoubles: 0,
      lossCountDoubles: 0,
    });
  }

  for (const match of matches) {
    if (match.gameType === 'singles') {
      const participants = [match.player1Id, match.player2Id];
      for (const id of participants) {
        if (!stats.has(id)) continue;
        const didWin =
          (id === match.player1Id && match.winner === 'team1') ||
          (id === match.player2Id && match.winner === 'team2');
        const s = stats.get(id)!;
        if (didWin) {
          s.winCount += 1;
          s.winCountSingles += 1;
        } else {
          s.lossCount += 1;
          s.lossCountSingles += 1;
        }
      }
      continue;
    }

    const team1Ids = [match.player1Id, match.player2Id].filter(Boolean) as string[];
    const team2Ids = [match.player3Id, match.player4Id].filter(Boolean) as string[];

    for (const id of [...team1Ids, ...team2Ids]) {
      if (!stats.has(id)) continue;
      const isTeam1 = team1Ids.includes(id);
      const didWin =
        (isTeam1 && match.winner === 'team1') ||
        (!isTeam1 && match.winner === 'team2');
      const s = stats.get(id)!;
      if (didWin) {
        s.winCount += 1;
        s.winCountDoubles += 1;
      } else {
        s.lossCount += 1;
        s.lossCountDoubles += 1;
      }
    }
  }

  return users.map((u) => ({
    ...u,
    ...(stats.get(u.id) ?? {
      winCount: 0,
      lossCount: 0,
      winCountSingles: 0,
      lossCountSingles: 0,
      winCountDoubles: 0,
      lossCountDoubles: 0,
    }),
  }));
}

/**
 * Get leaderboard for an organization
 */
export async function getOrganizationLeaderboard(organizationId: string) {
  try {
    const users = await prisma.user.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        ratingSingles: 'desc',
      },
      include: {
        organization: true,
      },
    });

    return await hydrateUsersWithLiveRecords(users);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Get global leaderboard (all users in the database)
 */
export async function getGlobalLeaderboard() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        ratingSingles: 'desc',
      },
      include: {
        organization: true,
      },
    });
    return await hydrateUsersWithLiveRecords(users);
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    return [];
  }
}

/**
 * Get all organizations with member counts for leaderboard navigation
 */
export async function getOrganizationsForLeaderboard() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
    
    return organizations;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
}
