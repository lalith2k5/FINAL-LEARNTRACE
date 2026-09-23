export type AdaptiveAttempt = {
  correct: boolean;
  difficulty: number;
};

export type AdaptiveState = {
  targetDifficulty: number; // 1..5
  reason: string;
};

const DIFF_MIN = 1;
const DIFF_MAX = 5;
const WINDOW = 3; // look at last N attempts

function clamp(x: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, x));
}

/**
 * Cold-start difficulty based on current mastery:
 *   mastery < 0.4 → start at 2
 *   0.4–0.7       → start at 3
 *   > 0.7         → start at 4
 */
export function startingDifficulty(mastery: number): number {
  if (mastery < 0.4) return 2;
  if (mastery < 0.7) return 3;
  return 4;
}

/**
 * Given the recent attempts and current target, return the next target
 * difficulty plus a short reason (for UI display).
 */
export function pickNextDifficulty(
  recent: AdaptiveAttempt[],
  currentTarget: number
): AdaptiveState {
  const window = recent.slice(-WINDOW);

  // Cold start
  if (window.length === 0) {
    return {
      targetDifficulty: clamp(currentTarget, DIFF_MIN, DIFF_MAX),
      reason: "Starting difficulty (no recent attempts)",
    };
  }

  const correct = window.filter((a) => a.correct).length;
  const total = window.length;

  // Not enough attempts yet to adapt meaningfully
  if (total < WINDOW) {
    return {
      targetDifficulty: currentTarget,
      reason: `Collecting evidence (${correct}/${total})`,
    };
  }

  // Full window: adapt
  if (correct === 3) {
    const next = clamp(currentTarget + 1, DIFF_MIN, DIFF_MAX);
    return {
      targetDifficulty: next,
      reason:
        next === currentTarget
          ? "Maxed out — staying at 5"
          : "3/3 correct — stepping up",
    };
  }

  if (correct === 2) {
    return {
      targetDifficulty: currentTarget,
      reason: "2/3 correct — staying",
    };
  }

  if (correct === 1) {
    const next = clamp(currentTarget - 1, DIFF_MIN, DIFF_MAX);
    return {
      targetDifficulty: next,
      reason:
        next === currentTarget
          ? "Floored — staying at 1"
          : "1/3 correct — stepping down",
    };
  }

  // 0/3 correct
  const next = clamp(currentTarget - 2, DIFF_MIN, DIFF_MAX);
  return {
    targetDifficulty: next,
    reason:
      next === currentTarget
        ? "Floored — staying at 1"
        : "0/3 correct — dropping 2 levels",
  };
}

/**
 * Score how "good" a candidate question is for the target difficulty.
 * Lower score = better fit.
 */
export function difficultyFitScore(
  questionDifficulty: number,
  targetDifficulty: number
): number {
  return Math.abs(questionDifficulty - targetDifficulty);
}
