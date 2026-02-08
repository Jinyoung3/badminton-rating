/**
 * 🔧 RATING ALGORITHM - CONSTANTS
 * 
 * Configuration values for the rating system
 * 
 * ⚠️ MODIFY THESE VALUES AS NEEDED
 */

export const RATING_CONSTANTS = {
  // Rating bounds
  MIN_RATING: 0,      // Minimum possible rating
  MAX_RATING: 9000,   // Target max (but overflow allowed)
  ALLOW_OVERFLOW: true, // Allow ratings above MAX_RATING
  
  // Initial rating calculation
  MIN_SELF_RATING_SUM: 8,   // All questions answered 1
  MAX_SELF_RATING_SUM: 80,  // All questions answered 10
  
  // Match adjustment (ELO-like K-factor)
  K_FACTOR: 32,  // Standard K-factor for rating changes
  
  // Practice match settings
  PRACTICE_AFFECTS_RATING: false, // Should practice matches affect rating?
} as const;
