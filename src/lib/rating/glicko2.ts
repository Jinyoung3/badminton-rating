/**
 * Glicko-2 Rating System Implementation
 * Based on: http://www.glicko.net/glicko/glicko2.pdf
 */

export interface Rating {
  mu: number;      // Rating value (default: 1500)
  phi: number;     // Rating deviation (uncertainty, default: 350)
  sigma: number;   // Volatility (default: 0.06)
}

export interface MatchResult {
  opponentRating: Rating;
  score: number;  // 1 = win, 0 = loss, 0.5 = draw
}

export interface Glicko2Options {
  mu?: number;
  phi?: number;
  sigma?: number;
  tau?: number;      // System constant (0.3-1.2, default: 0.5)
  epsilon?: number;  // Convergence tolerance (default: 0.000001)
}

// Score constants
export const WIN = 1;
export const LOSS = 0;
export const DRAW = 0.5;

export class Glicko2 {
  private readonly _mu: number;
  private readonly _phi: number;
  private readonly _sigma: number;
  private readonly _tau: number;
  private readonly _epsilon: number;

  constructor(options: Glicko2Options = {}) {
    this._mu = options.mu ?? 1500;
    this._phi = options.phi ?? 350;
    this._sigma = options.sigma ?? 0.06;
    this._tau = options.tau ?? 0.5;
    this._epsilon = options.epsilon ?? 0.000001;
  }

  /**
   * Create a new rating with default values
   */
  createRating(mu?: number, phi?: number, sigma?: number): Rating {
    return {
      mu: mu ?? this._mu,
      phi: phi ?? this._phi,
      sigma: sigma ?? this._sigma,
    };
  }

  /**
   * Scale rating down to Glicko-2 scale
   */
  private scaleDown(rating: Rating): { mu: number; phi: number } {
    return {
      mu: (rating.mu - this._mu) / 173.7178,
      phi: rating.phi / 173.7178,
    };
  }

  /**
   * Scale rating up from Glicko-2 scale
   */
  private scaleUp(mu: number, phi: number): { mu: number; phi: number } {
    return {
      mu: mu * 173.7178 + this._mu,
      phi: phi * 173.7178,
    };
  }

  /**
   * Reduce impact of game as a function of rating deviation
   */
  private reduceImpact(phi: number): number {
    return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
  }

  /**
   * Expected score
   */
  private expectScore(mu: number, muJ: number, phiJ: number): number {
    return 1 / (1 + Math.exp(-this.reduceImpact(phiJ) * (mu - muJ)));
  }

  /**
   * Determine new volatility (iterative algorithm)
   */
  private determineSigma(
    phi: number,
    sigma: number,
    delta: number,
    v: number
  ): number {
    const tau = this._tau;
    const epsilon = this._epsilon;

    // Step 5.1
    let a = Math.log(sigma * sigma);

    // Step 5.2
    const f = (x: number): number => {
      const ex = Math.exp(x);
      const phiSquare = phi * phi;
      const dSquare = delta * delta;
      
      const num1 = ex * (dSquare - phiSquare - v - ex);
      const den1 = 2 * Math.pow(phiSquare + v + ex, 2);
      
      const num2 = x - a;
      const den2 = tau * tau;
      
      return num1 / den1 - num2 / den2;
    };

    // Step 5.3
    let A = a;
    let B: number;

    if (delta * delta > phi * phi + v) {
      B = Math.log(delta * delta - phi * phi - v);
    } else {
      let k = 1;
      while (f(a - k * tau) < 0) {
        k++;
      }
      B = a - k * tau;
    }

    // Step 5.4
    let fA = f(A);
    let fB = f(B);

    // Step 5.5
    while (Math.abs(B - A) > epsilon) {
      const C = A + ((A - B) * fA) / (fB - fA);
      const fC = f(C);

      if (fC * fB < 0) {
        A = B;
        fA = fB;
      } else {
        fA = fA / 2;
      }

      B = C;
      fB = fC;
    }

    // Step 5.6
    return Math.exp(A / 2);
  }

  /**
   * Calculate new rating after match results
   */
  rate(rating: Rating, results: MatchResult[]): Rating {
    if (results.length === 0) {
      // No games played - just increase uncertainty
      const scaled = this.scaleDown(rating);
      const phiStar = Math.sqrt(scaled.phi * scaled.phi + rating.sigma * rating.sigma);
      const upscaled = this.scaleUp(scaled.mu, phiStar);
      return {
        mu: upscaled.mu,
        phi: upscaled.phi,
        sigma: rating.sigma,
      };
    }

    // Step 1: Scale down
    const scaled = this.scaleDown(rating);
    const mu = scaled.mu;
    const phi = scaled.phi;

    // Step 2: Compute variance (v) and delta
    let v = 0;
    let delta = 0;

    for (const result of results) {
      const scaledOpp = this.scaleDown(result.opponentRating);
      const g = this.reduceImpact(scaledOpp.phi);
      const e = this.expectScore(mu, scaledOpp.mu, scaledOpp.phi);

      v += g * g * e * (1 - e);
      delta += g * (result.score - e);
    }

    v = 1 / v;
    delta = v * delta;

    // Step 3: Determine new volatility
    const newSigma = this.determineSigma(phi, rating.sigma, delta, v);

    // Step 4: Update rating deviation to new pre-rating period value
    const phiStar = Math.sqrt(phi * phi + newSigma * newSigma);

    // Step 5: Update rating and RD
    const newPhi = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
    
    let newMu = mu;
    for (const result of results) {
      const scaledOpp = this.scaleDown(result.opponentRating);
      const g = this.reduceImpact(scaledOpp.phi);
      const e = this.expectScore(mu, scaledOpp.mu, scaledOpp.phi);
      newMu += newPhi * newPhi * g * (result.score - e);
    }

    // Step 6: Scale back up
    const upscaled = this.scaleUp(newMu, newPhi);

    return {
      mu: upscaled.mu,
      phi: upscaled.phi,
      sigma: newSigma,
    };
  }

  /**
   * Convenience method for 1v1 matches
   */
  rate1v1(
    rating1: Rating,
    rating2: Rating,
    isDraw: boolean
  ): [Rating, Rating] {
    const score1 = isDraw ? DRAW : WIN;
    const score2 = isDraw ? DRAW : LOSS;

    const newRating1 = this.rate(rating1, [
      { opponentRating: rating2, score: score1 },
    ]);

    const newRating2 = this.rate(rating2, [
      { opponentRating: rating1, score: score2 },
    ]);

    return [newRating1, newRating2];
  }

  /**
   * Calculate match quality (0-1, higher = more competitive)
   */
  quality1v1(rating1: Rating, rating2: Rating): number {
    const scaled1 = this.scaleDown(rating1);
    const scaled2 = this.scaleDown(rating2);

    const delta = scaled1.mu - scaled2.mu;
    const sumPhi = scaled1.phi * scaled1.phi + scaled2.phi * scaled2.phi;

    return Math.exp(-delta * delta / (2 * sumPhi)) / Math.sqrt(1 + sumPhi);
  }
}

/**
 * Helper: Format rating for display
 */
export function formatRating(rating: Rating): string {
  return `${Math.round(rating.mu)} ± ${Math.round(rating.phi * 2)}`;
}

/**
 * Helper: Get conservative rating estimate (mu - 2*phi)
 */
export function getConservativeRating(rating: Rating): number {
  return Math.round(rating.mu - 2 * rating.phi);
}