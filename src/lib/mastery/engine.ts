export type AttemptEvidence = {
  correct: boolean;
  difficulty: number;      // 1..5
  timeTakenMs: number;
  expectedMs: number;
  confidence?: number;     // 1..5
  attemptNo: number;
  skillWeight: number;     // 0..1
};

const clamp = (x: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, x));

/**
 * Bayesian-flavored mastery update.
 * prior  = current mastery (0..1)
 * signal = weighted correctness signal in [0,1]
 * alpha  = learning rate scaled by evidence quality
 */
export function updateMastery(prior: number, e: AttemptEvidence): number {
  const difficulty = clamp((e.difficulty - 1) / 4, 0, 1);
  const timeFactor = clamp(e.expectedMs / Math.max(e.timeTakenMs, 1), 0.5, 1.5);
  const confFactor = e.confidence
    ? 0.75 + (e.confidence - 1) * 0.125
    : 1;
  const attemptPenalty = 1 / (1 + 0.15 * (e.attemptNo - 1));

  const signal = e.correct
    ? 0.5 + 0.5 * difficulty
    : 0.5 * difficulty;

  const alpha = clamp(
    0.18 * e.skillWeight * timeFactor * confFactor * attemptPenalty,
    0.03,
    0.4
  );

  const next = prior + alpha * (signal - prior);
  return clamp(next, 0.01, 0.99);
}

