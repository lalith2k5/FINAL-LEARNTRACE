export type MisconceptionAttempt = {
  skillId: string;
  skillName: string;
  questionId: string;
  questionPrompt: string;
  correct: boolean;
  selectedOptionId: string | null;
  correctOptionId: string;
  options: { id: string; text: string }[];
  createdAt: Date;
};

export type Misconception = {
  skillId: string;
  skillName: string;
  selectedOptionId: string;
  selectedOptionText: string;
  correctOptionId: string;
  correctOptionText: string;
  count: number;
  totalWrongOnSkill: number;
  repeatedRate: number;   // count / totalWrongOnSkill
  lastSeenAt: Date;
  exampleQuestions: string[];
};

const MIN_OCCURRENCES = 2;

/**
 * Find recurring misconception patterns.
 *
 * Groups wrong attempts by (skillId, selectedOptionId). If the same wrong
 * option is chosen ≥ MIN_OCCURRENCES times on the same skill, it's a
 * misconception worth surfacing.
 */
export function detectMisconceptions(
  attempts: MisconceptionAttempt[]
): Misconception[] {
  // Group wrong attempts per skill
  const bySkill = new Map<string, MisconceptionAttempt[]>();
  for (const a of attempts) {
    if (a.correct) continue;
    if (!a.selectedOptionId) continue;
    const list = bySkill.get(a.skillId) ?? [];
    list.push(a);
    bySkill.set(a.skillId, list);
  }

  const results: Misconception[] = [];

  for (const [skillId, wrongs] of bySkill) {
    const totalWrong = wrongs.length;
    if (totalWrong < MIN_OCCURRENCES) continue;

    // Group by selected option
    const byOption = new Map<string, MisconceptionAttempt[]>();
    for (const w of wrongs) {
      const key = w.selectedOptionId!;
      const list = byOption.get(key) ?? [];
      list.push(w);
      byOption.set(key, list);
    }

    for (const [optionId, group] of byOption) {
      if (group.length < MIN_OCCURRENCES) continue;

      const first = group[0];
      const selectedText =
        first.options.find((o) => o.id === optionId)?.text ??
        `Option ${optionId.toUpperCase()}`;
      const correctText =
        first.options.find((o) => o.id === first.correctOptionId)?.text ??
        `Option ${first.correctOptionId.toUpperCase()}`;

      const lastSeenAt = group.reduce(
        (max, g) => (g.createdAt > max ? g.createdAt : max),
        group[0].createdAt
      );

      results.push({
        skillId,
        skillName: first.skillName,
        selectedOptionId: optionId,
        selectedOptionText: selectedText,
        correctOptionId: first.correctOptionId,
        correctOptionText: correctText,
        count: group.length,
        totalWrongOnSkill: totalWrong,
        repeatedRate: group.length / totalWrong,
        lastSeenAt,
        exampleQuestions: group.slice(0, 3).map((g) => g.questionPrompt),
      });
    }
  }

  // Sort: most repeated first, tie-break by recency
  results.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.lastSeenAt.getTime() - a.lastSeenAt.getTime();
  });

  return results;
}

/**
 * Score a misconception by severity (for display priority).
 * Combines count and repeat rate.
 */
export function misconceptionSeverity(m: Misconception): number {
  return m.count * (1 + m.repeatedRate);
}
