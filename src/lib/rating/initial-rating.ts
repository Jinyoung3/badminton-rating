import { RATING_CONSTANTS } from './constants';

export interface SelfRatingAnswers {
  question1: number;
  question2: number;
  question3: number;
  question4: number;
  question5: number;
  question6: number;
  question7: number;
  question8: number;
}

// NEW: Rating object structure
export interface PlayerRating {
  mu: number;      // Rating value
  phi: number;     // Rating deviation (uncertainty)
  sigma: number;   // Volatility
}

/**
 * Calculate initial Glicko-2 rating from self-assessment
 */
export function calculateInitialRating(selfRating: SelfRatingAnswers): PlayerRating {
  const { MIN_RATING, MAX_RATING, MIN_SELF_RATING_SUM, MAX_SELF_RATING_SUM, DEFAULT_PHI, DEFAULT_SIGMA } = RATING_CONSTANTS;
  
  // Sum all self-rating values
  const sum = Object.values(selfRating).reduce((acc, val) => acc + val, 0);
  
  // Calculate mu (rating) using linear interpolation
  const mu = MIN_RATING + 
    ((sum - MIN_SELF_RATING_SUM) / (MAX_SELF_RATING_SUM - MIN_SELF_RATING_SUM)) * 
    (MAX_RATING - MIN_RATING);
  
  // New players start with high uncertainty and default volatility
  return {
    mu: Math.round(mu),
    phi: DEFAULT_PHI,
    sigma: DEFAULT_SIGMA,
  };
}

export function validateSelfRating(selfRating: SelfRatingAnswers): boolean {
  return Object.values(selfRating).every(val => val >= 1 && val <= 10);
}