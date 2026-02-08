import { RATING_CONSTANTS } from './constants';

/**
 * 🔧 RATING ALGORITHM - MATCH OUTCOME ADJUSTMENT
 * 
 * Adjusts player ratings after a match
 * 
 * Current Logic: Simple ELO-like system (placeholder)
 * - Expected score based on rating difference
 * - Actual score: 1 for win, 0 for loss
 * - Rating change = K-factor × (actual - expected)
 * 
 * ⚠️ REPLACE THIS LOGIC WITH YOUR OWN ALGORITHM
 */

/**
 * Calculate expected score (probability of winning) based on ratings
 * Uses standard ELO formula
 */
function calculateExpectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Calculate rating change for a single player after a match
 * 
 * @param playerRating - Current rating of the player
 * @param opponentRating - Current rating of the opponent (or average for doubles)
 * @param won - Whether the player won the match
 * @param kFactor - Optional custom K-factor (defaults to constant)
 * @returns Rating change (can be negative)
 */
export function calculateRatingChange(
  playerRating: number,
  opponentRating: number,
  won: boolean,
  kFactor: number = RATING_CONSTANTS.K_FACTOR
): number {
  const expectedScore = calculateExpectedScore(playerRating, opponentRating);
  const actualScore = won ? 1 : 0;
  const change = Math.round(kFactor * (actualScore - expectedScore));
  
  return change;
}

/**
 * Apply rating change to a player, respecting min/max bounds
 */
export function applyRatingChange(currentRating: number, change: number): number {
  const newRating = currentRating + change;
  
  // Enforce minimum rating of 0
  if (newRating < RATING_CONSTANTS.MIN_RATING) {
    return RATING_CONSTANTS.MIN_RATING;
  }
  
  // Allow overflow above MAX_RATING if configured
  if (!RATING_CONSTANTS.ALLOW_OVERFLOW && newRating > RATING_CONSTANTS.MAX_RATING) {
    return RATING_CONSTANTS.MAX_RATING;
  }
  
  return newRating;
}

/**
 * Calculate rating changes for a singles match
 */
export function calculateSinglesRatingChanges(
  player1Rating: number,
  player2Rating: number,
  winner: 'team1' | 'team2'
): { player1Change: number; player2Change: number } {
  const player1Won = winner === 'team1';
  
  const player1Change = calculateRatingChange(player1Rating, player2Rating, player1Won);
  const player2Change = calculateRatingChange(player2Rating, player1Rating, !player1Won);
  
  return {
    player1Change,
    player2Change,
  };
}

/**
 * Calculate rating changes for a doubles match
 * Team 1: player1 + player2
 * Team 2: player3 + player4
 */
export function calculateDoublesRatingChanges(
  player1Rating: number,
  player2Rating: number,
  player3Rating: number,
  player4Rating: number,
  winner: 'team1' | 'team2'
): {
  player1Change: number;
  player2Change: number;
  player3Change: number;
  player4Change: number;
} {
  // Calculate average team ratings
  const team1AvgRating = (player1Rating + player2Rating) / 2;
  const team2AvgRating = (player3Rating + player4Rating) / 2;
  
  const team1Won = winner === 'team1';
  
  // Each player's change is based on their team avg vs opponent team avg
  const player1Change = calculateRatingChange(player1Rating, team2AvgRating, team1Won);
  const player2Change = calculateRatingChange(player2Rating, team2AvgRating, team1Won);
  const player3Change = calculateRatingChange(player3Rating, team1AvgRating, !team1Won);
  const player4Change = calculateRatingChange(player4Rating, team1AvgRating, !team1Won);
  
  return {
    player1Change,
    player2Change,
    player3Change,
    player4Change,
  };
}
