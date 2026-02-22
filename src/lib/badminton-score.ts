/**
 * Badminton game scoring rules:
 * - Game goes to 21 points (must win by 2).
 * - At 20-20 (deuce), play until one side leads by 2 (e.g. 22-20, 23-21).
 * - 30 point cap: at 29-29, the next point wins. 30-29 is valid; no need to win by 2.
 */

export interface GameScore {
  team1: number;
  team2: number;
}

/**
 * Check if a single game score is valid under standard badminton rules.
 */
export function isValidBadmintonGame(team1: number, team2: number): boolean {
  const high = Math.max(team1, team2);
  const low = Math.min(team1, team2);
  if (high < 21) return false;
  if (low < 0) return false;
  // 21-0 through 21-19
  if (high === 21 && low <= 19) return true;
  // Deuce: 22-20, 23-21, ... 29-27 (winner leads by 2)
  if (high >= 22 && high <= 29 && high - low === 2) return true;
  // 30 point cap: 30-29 or 29-30
  if (high === 30 && low === 29) return true;
  return false;
}

/**
 * Validate all games in a match. Returns error message or null if valid.
 */
export function validateMatchGames(games: GameScore[]): string | null {
  if (!games.length) return 'At least one game is required';
  for (let i = 0; i < games.length; i++) {
    const { team1, team2 } = games[i];
    if (!isValidBadmintonGame(team1, team2)) {
      return `Game ${i + 1} score ${team1}-${team2} is invalid. Games go to 21 (win by 2), or 30-29 at the cap.`;
    }
  }
  return null;
}
