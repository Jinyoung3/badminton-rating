export const RATING_CONSTANTS = {
  // Glicko-2 default values
  DEFAULT_MU: 1500,           // Default rating
  DEFAULT_PHI: 350,           // Default rating deviation (uncertainty)
  DEFAULT_SIGMA: 0.06,        // Default volatility
  TAU: 0.5,                   // System volatility constraint (0.3-1.2 typical)
  EPSILON: 0.000001,          // Convergence tolerance
  
  // Rating bounds (applied to mu only)
  MIN_RATING: 0,
  MAX_RATING: 3000,
  ALLOW_OVERFLOW: true,
  
  // Initial rating calculation
  MIN_SELF_RATING_SUM: 8,
  MAX_SELF_RATING_SUM: 80,
  
  // Practice match settings
  PRACTICE_AFFECTS_RATING: false,
} as const;