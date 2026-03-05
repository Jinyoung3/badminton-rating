import { Glicko2, WIN, LOSS } from './glicko2';
import { RATING_CONSTANTS } from './constants';
import type { PlayerRating } from './initial-rating';

// Initialize Glicko-2 system
const glicko = new Glicko2({
  mu: RATING_CONSTANTS.DEFAULT_MU,
  phi: RATING_CONSTANTS.DEFAULT_PHI,
  sigma: RATING_CONSTANTS.DEFAULT_SIGMA,
  tau: RATING_CONSTANTS.TAU,
  epsilon: RATING_CONSTANTS.EPSILON,
});

/**
 * Calculate rating changes for a singles match
 */
export function calculateSinglesRatingChanges(
  player1Rating: PlayerRating,
  player2Rating: PlayerRating,
  winner: 'team1' | 'team2'
): {
  player1NewRating: PlayerRating;
  player2NewRating: PlayerRating;
  player1Change: number;
  player2Change: number;
} {
  const p1Won = winner === 'team1';

  const newRating1 = glicko.rate(player1Rating, [
    { score: p1Won ? WIN : LOSS, opponentRating: player2Rating },
  ]);

  const newRating2 = glicko.rate(player2Rating, [
    { score: p1Won ? LOSS : WIN, opponentRating: player1Rating },
  ]);

  // For display purposes, calculate mu change
  const player1Change = Math.round(newRating1.mu - player1Rating.mu);
  const player2Change = Math.round(newRating2.mu - player2Rating.mu);

  return {
    player1NewRating: newRating1,
    player2NewRating: newRating2,
    player1Change,
    player2Change,
  };
}

/**
 * Calculate rating changes for doubles match
 * Each player is rated against opponent team average
 */
export function calculateDoublesRatingChanges(
  player1Rating: PlayerRating,
  player2Rating: PlayerRating,
  player3Rating: PlayerRating,
  player4Rating: PlayerRating,
  winner: 'team1' | 'team2'
): {
  player1NewRating: PlayerRating;
  player2NewRating: PlayerRating;
  player3NewRating: PlayerRating;
  player4NewRating: PlayerRating;
  player1Change: number;
  player2Change: number;
  player3Change: number;
  player4Change: number;
} {
  const team1Won = winner === 'team1';

  // Calculate opponent team averages
  const team2AvgRating: PlayerRating = {
    mu: (player3Rating.mu + player4Rating.mu) / 2,
    phi: Math.sqrt((player3Rating.phi ** 2 + player4Rating.phi ** 2) / 2),
    sigma: (player3Rating.sigma + player4Rating.sigma) / 2,
  };

  const team1AvgRating: PlayerRating = {
    mu: (player1Rating.mu + player2Rating.mu) / 2,
    phi: Math.sqrt((player1Rating.phi ** 2 + player2Rating.phi ** 2) / 2),
    sigma: (player1Rating.sigma + player2Rating.sigma) / 2,
  };

  // Rate each player against opponent team average
  const newPlayer1 = glicko.rate(player1Rating, [
    { score: team1Won ? WIN : LOSS, opponentRating: team2AvgRating }
  ]);

  const newPlayer2 = glicko.rate(player2Rating, [
    { score: team1Won ? WIN : LOSS, opponentRating: team2AvgRating }
  ]);

  const newPlayer3 = glicko.rate(player3Rating, [
    { score: team1Won ? LOSS : WIN, opponentRating: team1AvgRating }
  ]);

  const newPlayer4 = glicko.rate(player4Rating, [
    { score: team1Won ? LOSS : WIN, opponentRating: team1AvgRating }
  ]);

  return {
    player1NewRating: newPlayer1,
    player2NewRating: newPlayer2,
    player3NewRating: newPlayer3,
    player4NewRating: newPlayer4,
    player1Change: Math.round(newPlayer1.mu - player1Rating.mu),
    player2Change: Math.round(newPlayer2.mu - player2Rating.mu),
    player3Change: Math.round(newPlayer3.mu - player3Rating.mu),
    player4Change: Math.round(newPlayer4.mu - player4Rating.mu),
  };
}

/**
 * Apply rating bounds to mu value only
 */
export function applyRatingBounds(rating: PlayerRating): PlayerRating {
  let boundedMu = rating.mu;

  if (boundedMu < RATING_CONSTANTS.MIN_RATING) {
    boundedMu = RATING_CONSTANTS.MIN_RATING;
  }

  if (!RATING_CONSTANTS.ALLOW_OVERFLOW && boundedMu > RATING_CONSTANTS.MAX_RATING) {
    boundedMu = RATING_CONSTANTS.MAX_RATING;
  }

  return {
    mu: boundedMu,
    phi: rating.phi,
    sigma: rating.sigma,
  };
}

// Legacy function for backwards compatibility
export function calculateRatingChange(
  playerRating: number,
  opponentRating: number,
  won: boolean
): number {
  // Convert to Glicko-2, calculate, return mu change
  const player: PlayerRating = { mu: playerRating, phi: 350, sigma: 0.06 };
  const opponent: PlayerRating = { mu: opponentRating, phi: 350, sigma: 0.06 };
  const [newRating] = glicko.rate1v1(player, opponent, false);
  return Math.round(newRating.mu - playerRating);
}

export function applyRatingChange(currentRating: number, change: number): number {
  const newRating = currentRating + change;
  if (newRating < RATING_CONSTANTS.MIN_RATING) return RATING_CONSTANTS.MIN_RATING;
  if (!RATING_CONSTANTS.ALLOW_OVERFLOW && newRating > RATING_CONSTANTS.MAX_RATING) {
    return RATING_CONSTANTS.MAX_RATING;
  }
  return newRating;
}