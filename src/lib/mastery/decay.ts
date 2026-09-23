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