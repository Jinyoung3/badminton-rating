import { RATING_CONSTANTS } from './constants';

/**
 * 🔧 RATING ALGORITHM - INITIAL RATING
 * 
 * Converts self-rating questionnaire (8 questions, 1-10 each) to initial rating (0-9000+)
 * 
 * Current Logic:
 * - Sum all answers (min: 8, max: 80)
 * - Map linearly to 0-9000 range
 * - If all 1's → 0
 * - If all 10's → 9000
 * - Mixed values → proportional calculation
 * 
 * ⚠️ REPLACE THIS LOGIC WITH YOUR OWN ALGORITHM
 */

export interface SelfRatingAnswers {
  question1: number; // How comfortable are you with basic grip and footwork?
  question2: number; // Can you rally consistently without mistakes?
  question3: number; // How well do you control shot placement?
  question4: number; // How strong and consistent is your overhead technique?
  question5: number; // How well do you move and recover on court?
  question6: number; // How do you handle match situations and strategy?
  question7: number; // How experienced are you with competitive play?
  question8: number; // Can you teach or analyze badminton technique?
}

export function calculateInitialRating(selfRating: SelfRatingAnswers): number {
  const { MIN_RATING, MAX_RATING, MIN_SELF_RATING_SUM, MAX_SELF_RATING_SUM } = RATING_CONSTANTS;
  
  // Sum all self-rating values
  const sum = Object.values(selfRating).reduce((acc, val) => acc + val, 0);
  
  // Linear interpolation: map [8, 80] → [0, 9000]
  const rating = MIN_RATING + 
    ((sum - MIN_SELF_RATING_SUM) / (MAX_SELF_RATING_SUM - MIN_SELF_RATING_SUM)) * 
    (MAX_RATING - MIN_RATING);
  
  return Math.round(rating);
}

/**
 * Validate that all self-rating answers are within valid range (1-10)
 */
export function validateSelfRating(selfRating: SelfRatingAnswers): boolean {
  return Object.values(selfRating).every(val => val >= 1 && val <= 10);
}
