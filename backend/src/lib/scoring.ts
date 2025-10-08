/**
 * Scoring Calculation Library
 * Implements the job scoring model for ranking jobs A/B/C
 *
 * Scoring Model Summary:
 * - 4 factors: Client Engagement, Search Difficulty, Time Open, Fee Size (each 1-5 scale)
 * - Each factor has a weight (must sum to 1.0)
 * - Composite score per scorer = weighted sum of factors
 * - Final score = average of 3 scorers' composite scores
 * - Rank assignment: A ≥ 4.0, B ≥ 2.5, C < 2.5
 */

// Types
export interface FactorScores {
  client_engagement_score: number;
  search_difficulty_score: number;
  time_open_score: number;
  fee_size_score: number;
}

export interface ScoringWeights {
  client_engagement: number;
  search_difficulty: number;
  time_open: number;
  fee_size: number;
}

export interface ScorerComposite {
  scorer_id: string;
  composite_score: number;
  scorer_role: string;
}

export type Rank = 'A' | 'B' | 'C';

// Constants
const RANK_THRESHOLDS = {
  A: 4.0,
  B: 2.5,
} as const;

const SCORE_MIN = 1;
const SCORE_MAX = 5;

/**
 * Get default scoring weights (equal weighting - 25% each)
 * NOTE: These are placeholders pending team discussion
 */
export function getDefaultWeights(): ScoringWeights {
  return {
    client_engagement: 0.25,
    search_difficulty: 0.25,
    time_open: 0.25,
    fee_size: 0.25,
  };
}

/**
 * Validate that all factor scores are within valid range (1-5)
 * @param scores - Factor scores to validate
 * @returns true if valid, false otherwise
 */
export function validateFactorScores(scores: FactorScores): boolean {
  const scoreValues = [
    scores.client_engagement_score,
    scores.search_difficulty_score,
    scores.time_open_score,
    scores.fee_size_score,
  ];

  return scoreValues.every(
    (score) =>
      Number.isInteger(score) &&
      score >= SCORE_MIN &&
      score <= SCORE_MAX
  );
}

/**
 * Validate that weights sum to 1.0 (allowing small floating point tolerance)
 * @param weights - Scoring weights to validate
 * @returns true if valid, false otherwise
 */
export function validateWeights(weights: ScoringWeights): boolean {
  const sum =
    weights.client_engagement +
    weights.search_difficulty +
    weights.time_open +
    weights.fee_size;

  // Allow small floating point tolerance (0.0001)
  return Math.abs(sum - 1.0) < 0.0001;
}

/**
 * Calculate weighted composite score for a single scorer
 * @param scores - Individual factor scores (1-5 scale)
 * @param weights - Weight configuration (must sum to 1.0)
 * @returns Composite score (1.0 to 5.0)
 */
export function calculateCompositeScore(
  scores: FactorScores,
  weights: ScoringWeights = getDefaultWeights()
): number {
  if (!validateFactorScores(scores)) {
    throw new Error('Invalid factor scores: must be integers between 1-5');
  }

  if (!validateWeights(weights)) {
    throw new Error('Invalid weights: must sum to 1.0');
  }

  const composite =
    scores.client_engagement_score * weights.client_engagement +
    scores.search_difficulty_score * weights.search_difficulty +
    scores.time_open_score * weights.time_open +
    scores.fee_size_score * weights.fee_size;

  // Round to 2 decimal places
  return Math.round(composite * 100) / 100;
}

/**
 * Calculate final team score (average of all scorers' composite scores)
 * @param compositeScores - Array of composite scores from different scorers
 * @returns Final team score (1.0 to 5.0)
 */
export function calculateFinalScore(compositeScores: number[]): number {
  if (compositeScores.length === 0) {
    throw new Error('Cannot calculate final score: no composite scores provided');
  }

  // Validate all composite scores are in valid range
  const allValid = compositeScores.every(
    (score) => score >= 1.0 && score <= 5.0
  );

  if (!allValid) {
    throw new Error('Invalid composite scores: must be between 1.0 and 5.0');
  }

  const sum = compositeScores.reduce((acc, score) => acc + score, 0);
  const average = sum / compositeScores.length;

  // Round to 2 decimal places
  return Math.round(average * 100) / 100;
}

/**
 * Assign A/B/C rank based on final score
 * @param finalScore - Final team score (1.0 to 5.0)
 * @returns Rank ('A', 'B', or 'C')
 */
export function assignRank(finalScore: number): Rank {
  if (finalScore < 1.0 || finalScore > 5.0) {
    throw new Error('Invalid final score: must be between 1.0 and 5.0');
  }

  if (finalScore >= RANK_THRESHOLDS.A) {
    return 'A';
  } else if (finalScore >= RANK_THRESHOLDS.B) {
    return 'B';
  } else {
    return 'C';
  }
}

/**
 * Group scores by scorer and calculate their composite scores
 * Handles multiple scores per scorer by using the most recent
 * @param scores - Array of job scores from database
 * @param weights - Weight configuration
 * @returns Array of scorer composites with role information
 */
export function calculateScorerComposites(
  scores: Array<{
    scorer_id: string;
    scoring_date: string;
    client_engagement_score: number;
    search_difficulty_score: number;
    time_open_score: number;
    fee_size_score: number;
    users?: {
      role: string;
    };
  }>,
  weights: ScoringWeights = getDefaultWeights()
): ScorerComposite[] {
  // Group scores by scorer_id
  const scoresByScorer = new Map<string, typeof scores[0]>();

  scores.forEach((score) => {
    const existing = scoresByScorer.get(score.scorer_id);

    // Keep most recent score per scorer
    if (!existing || new Date(score.scoring_date) > new Date(existing.scoring_date)) {
      scoresByScorer.set(score.scorer_id, score);
    }
  });

  // Calculate composite for each scorer
  const composites: ScorerComposite[] = [];

  scoresByScorer.forEach((score, scorer_id) => {
    const factorScores: FactorScores = {
      client_engagement_score: score.client_engagement_score,
      search_difficulty_score: score.search_difficulty_score,
      time_open_score: score.time_open_score,
      fee_size_score: score.fee_size_score,
    };

    const composite = calculateCompositeScore(factorScores, weights);

    composites.push({
      scorer_id,
      composite_score: composite,
      scorer_role: score.users?.role || 'unknown',
    });
  });

  return composites;
}

/**
 * Main function to calculate full ranking from job scores
 * @param scores - All scores for a job from database
 * @param weights - Weight configuration
 * @returns Ranking data ready for database insertion
 */
export function calculateJobRanking(
  scores: Array<{
    scorer_id: string;
    scoring_date: string;
    client_engagement_score: number;
    search_difficulty_score: number;
    time_open_score: number;
    fee_size_score: number;
    users?: {
      role: string;
    };
  }>,
  weights: ScoringWeights = getDefaultWeights()
): {
  composite_score: number;
  rank: Rank;
  account_manager_composite: number | null;
  sales_person_composite: number | null;
  ceo_composite: number | null;
} {
  if (scores.length === 0) {
    throw new Error('Cannot calculate ranking: no scores provided');
  }

  // Calculate composite scores by scorer
  const scorerComposites = calculateScorerComposites(scores, weights);

  // Extract composites by role
  let account_manager_composite: number | null = null;
  let sales_person_composite: number | null = null;
  let ceo_composite: number | null = null;

  scorerComposites.forEach((scorer) => {
    switch (scorer.scorer_role) {
      case 'account_manager':
        account_manager_composite = scorer.composite_score;
        break;
      case 'sales_person':
        sales_person_composite = scorer.composite_score;
        break;
      case 'ceo':
        ceo_composite = scorer.composite_score;
        break;
    }
  });

  // Calculate final score (average of all composites)
  const compositeScores = scorerComposites.map((s) => s.composite_score);
  const finalScore = calculateFinalScore(compositeScores);

  // Assign rank
  const rank = assignRank(finalScore);

  return {
    composite_score: finalScore,
    rank,
    account_manager_composite,
    sales_person_composite,
    ceo_composite,
  };
}
