export {
  calculateInitialRating,
  validateSelfRating,
  type SelfRatingAnswers,
  type PlayerRating,
} from './initial-rating';

export {
  calculateSinglesRatingChanges,
  calculateDoublesRatingChanges,
  applyRatingBounds,
  // Legacy exports for backwards compatibility
  calculateRatingChange,
  applyRatingChange,
} from './match-adjustment';

export { RATING_CONSTANTS } from './constants';