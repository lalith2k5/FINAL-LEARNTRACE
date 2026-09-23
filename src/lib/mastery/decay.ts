/**
 * Knowledge decay: mastery halves every `halfLifeDays` days without practice.
 * Returns effective mastery in [0, stored].
 */
export function effectiveMastery(
  stored: number,
  lastPracticedAt: Date,
  halfLifeDays = 21
): number {
  const days = (Date.now() - lastPracticedAt.getTime()) / 86_400_000;
  if (days <= 0) return stored;
  const decay = Math.pow(0.5, days / halfLifeDays);
  return stored * decay;
}

/**
 * Convenience: how decayed is a skill (0 = fresh, 1 = fully forgotten)?
 */
export function decayRatio(
  stored: number,
  lastPracticedAt: Date,
  halfLifeDays = 21
): number {
  if (stored <= 0) return 0;
  const eff = effectiveMastery(stored, lastPracticedAt, halfLifeDays);
  return 1 - eff / stored;
}
