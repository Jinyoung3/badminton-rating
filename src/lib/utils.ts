/**
 * Format user display name with their user number
 * Example: "John Smith#20"
 */
export function formatUserDisplayName(name: string, userNumber: number): string {
  return `${name}#${userNumber}`;
}

/**
 * Calculate games won and lost from match games data
 */
export function calculateGamesWonLost(
  games: Array<{ team1: number; team2: number }>,
  isTeam1: boolean
): { won: number; lost: number } {
  let won = 0;
  let lost = 0;
  
  games.forEach((game) => {
    if (isTeam1) {
      if (game.team1 > game.team2) won++;
      else lost++;
    } else {
      if (game.team2 > game.team1) won++;
      else lost++;
    }
  });
  
  return { won, lost };
}

/**
 * Get opponent user ids for a match (the side that did not request)
 */
export function getOpponentIds(
  match: { player1Id: string; player2Id: string; player3Id: string | null; player4Id: string | null; gameType: string },
  requesterId: string
): string[] {
  const team1Ids = match.gameType === 'doubles' ? [match.player1Id, match.player2Id] : [match.player1Id];
  const team2Ids = match.gameType === 'doubles' ? [match.player3Id, match.player4Id].filter(Boolean) as string[] : [match.player2Id];
  const isRequesterTeam1 = team1Ids.includes(requesterId);
  return isRequesterTeam1 ? team2Ids : team1Ids;
}

/**
 * Determine match winner from games
 */
export function determineMatchWinner(
  games: Array<{ team1: number; team2: number }>
): 'team1' | 'team2' {
  let team1Games = 0;
  let team2Games = 0;
  
  games.forEach((game) => {
    if (game.team1 > game.team2) team1Games++;
    else team2Games++;
  });
  
  return team1Games > team2Games ? 'team1' : 'team2';
}
