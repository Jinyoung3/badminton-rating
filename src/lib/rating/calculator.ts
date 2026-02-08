/**
 * 🔧 RATING ALGORITHM - MAIN CALCULATOR
 * 
 * This file orchestrates all rating calculations.
 * Import and use these functions throughout the app for consistent rating logic.
 * 
 * ⚠️ THIS IS THE MAIN ENTRY POINT FOR RATING CALCULATIONS
 */

export {
  calculateInitialRating,
  validateSelfRating,
  type SelfRatingAnswers,
} from './initial-rating';

export {
  calculateRatingChange,
  applyRatingChange,
  calculateSinglesRatingChanges,
  calculateDoublesRatingChanges,
} from './match-adjustment';

export { RATING_CONSTANTS } from './constants';

/**
 * Quick reference for where to modify rating logic:
 * 
 * 1. Initial rating from self-assessment
 *    → Edit: src/lib/rating/initial-rating.ts
 * 
 * 2. Rating changes after matches
 *    → Edit: src/lib/rating/match-adjustment.ts
 * 
 * 3. Rating system constants (K-factor, min/max, etc.)
 *    → Edit: src/lib/rating/constants.ts
 */
