import { prisma } from './prisma';

/**
 * Generate a unique 4-digit event code
 */
export async function generateEventCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate random 4-digit number
    code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Check if code already exists
    const existing = await prisma.event.findUnique({
      where: { eventCode: code },
    });
    
    if (!existing) {
      isUnique = true;
      return code;
    }
  }
  
  throw new Error('Failed to generate unique event code');
}

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
