'use server';

import { prisma } from '@/lib/prisma';

interface UserWithId {
    id: string;
    [key: string]: unknown;
}

interface MatchRecord {
    winCount: number;
    lossCount: number;
    winCountSingles: number;
    lossCountSingles: number;
    winCountDoubles: number;
    lossCountDoubles: number;
}

/**
 * Hydrate a list of users with live win/loss records computed from the matches table.
 * This is used by leaderboard and player search to show accurate stats.
 */
export async function hydrateUsersWithLiveRecords<T extends UserWithId>(
    users: T[]
): Promise<(T & MatchRecord)[]> {
    if (users.length === 0) {
        return users as (T & MatchRecord)[];
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

    const stats = new Map<string, MatchRecord>();

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
            for (const id of [match.player1Id, match.player2Id]) {
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

        // Doubles
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
