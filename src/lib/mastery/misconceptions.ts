export type MisconceptionAttempt = {
  skillId: string;
  skillName: string;
  questionId: string;
  questionPrompt: string;
  correct: boolean;
  selectedOptionId: string | null;
  correctOptionId: string;
  options: { id: string; text: string }[];
  confidence?: number | null;
  createdAt: Date;
};

export type MisconceptionBase = {
  skillId: string;
  skillName: string;
  lastSeenAt: Date;
  exampleQuestions: string[];
};

export type OptionRepeatMisconception = MisconceptionBase & {
  kind: "option-repeat";
  selectedOptionId: string;
  selectedOptionText: string;
  correctOptionId: string;
  correctOptionText: string;
  count: number;
  totalWrongOnSkill: number;
  repeatedRate: number;
};

export type SkillWeakMisconception = MisconceptionBase & {
  kind: "skill-weak";
  wrongCount: number;
  totalCount: number;
  wrongRate: number;
};

export type OverconfidentMisconception = MisconceptionBase & {
  kind: "overconfident";
  wrongCount: number;
  confidentAttempts: number;
  avgConfidence: number;
};

export type Misconception =
  | OptionRepeatMisconception
  | SkillWeakMisconception
  | OverconfidentMisconception;

const MIN_OPTION_OCCURRENCES = 2;
const OVERCONFIDENT_MIN = 2;
const OVERCONFIDENT_MIN_CONF = 4;
const SKILL_WEAK_MIN_WRONG = 3;
const SKILL_WEAK_MIN_RATE = 0.5;

/**
 * Detect recurring misconception patterns from a learner's attempts.
 *
 * Signals, applied per skill (most specific wins):
 *   1. option-repeat   — same wrong option chosen ≥ 2×
 *   2. overconfident   — confidence ≥ 4 AND wrong, ≥ 2×
 *   3. skill-weak      — ≥ 3 wrongs AND wrong rate ≥ 50%
 *
 * Only one signal is emitted per skill — the most actionable one.
 */
export function detectMisconceptions(
  attempts: MisconceptionAttempt[]
): Misconception[] {
  const bySkill = new Map<string, MisconceptionAttempt[]>();
  for (const a of attempts) {
    const list = bySkill.get(a.skillId) ?? [];
    list.push(a);
    bySkill.set(a.skillId, list);
  }

  const results: Misconception[] = [];

  for (const [skillId, all] of bySkill) {
    const wrongs = all.filter((a) => !a.correct && a.selectedOptionId);
    if (wrongs.length === 0) continue;

    const skillName = wrongs[0].skillName;
    const lastSeenAt = wrongs.reduce(
      (max, w) => (w.createdAt > max ? w.createdAt : max),
      wrongs[0].createdAt
    );
    const exampleQuestions = wrongs.slice(0, 3).map((w) => w.questionPrompt);

    // --- Signal 1: option-repeat ---
    const byOption = new Map<string, MisconceptionAttempt[]>();
    for (const w of wrongs) {
      const key = w.selectedOptionId!;
      const list = byOption.get(key) ?? [];
      list.push(w);
      byOption.set(key, list);
    }

    let topOptionGroup: MisconceptionAttempt[] = [];
    for (const group of byOption.values()) {
      if (group.length > topOptionGroup.length) topOptionGroup = group;
    }

    if (topOptionGroup.length >= MIN_OPTION_OCCURRENCES) {
      const first = topOptionGroup[0];
      const optionId = first.selectedOptionId!;
      const selectedText =
        first.options.find((o) => o.id === optionId)?.text ??
        `Option ${optionId.toUpperCase()}`;
      const correctText =
        first.options.find((o) => o.id === first.correctOptionId)?.text ??
        `Option ${first.correctOptionId.toUpperCase()}`;

      results.push({
        kind: "option-repeat",
        skillId,
        skillName,
        selectedOptionId: optionId,
        selectedOptionText: selectedText,
        correctOptionId: first.correctOptionId,
        correctOptionText: correctText,
        count: topOptionGroup.length,
        totalWrongOnSkill: wrongs.length,
        repeatedRate: topOptionGroup.length / wrongs.length,
        lastSeenAt,
        exampleQuestions,
      });
      continue;
    }

    // --- Signal 2: overconfident (conf >= 4 AND wrong, >= 2x) ---
    const confidentWrongs = wrongs.filter(
      (w) => (w.confidence ?? 0) >= OVERCONFIDENT_MIN_CONF
    );
    if (confidentWrongs.length >= OVERCONFIDENT_MIN) {
      const avgConfidence =
        confidentWrongs.reduce((s, w) => s + (w.confidence ?? 0), 0) /
        confidentWrongs.length;
      results.push({
        kind: "overconfident",
        skillId,
        skillName,
        wrongCount: confidentWrongs.length,
        confidentAttempts: confidentWrongs.length,
        avgConfidence,
        lastSeenAt,
        exampleQuestions,
      });
      continue;
    }

    // --- Signal 3: skill-weak (many wrongs, high wrong rate) ---
    const totalCount = all.length;
    const wrongRate = totalCount > 0 ? wrongs.length / totalCount : 0;
    if (
      wrongs.length >= SKILL_WEAK_MIN_WRONG &&
      wrongRate >= SKILL_WEAK_MIN_RATE
    ) {
      results.push({
        kind: "skill-weak",
        skillId,
        skillName,
        wrongCount: wrongs.length,
        totalCount,
        wrongRate,
        lastSeenAt,
        exampleQuestions,
      });
    }
  }

  // Sort: most concrete first, then by severity count, then recency
  const rank = (m: Misconception) =>
    m.kind === "option-repeat" ? 0 : m.kind === "overconfident" ? 1 : 2;

  results.sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r !== 0) return r;
    const c = severityCount(b) - severityCount(a);
    if (c !== 0) return c;
    return b.lastSeenAt.getTime() - a.lastSeenAt.getTime();
  });

  return results;
}

function severityCount(m: Misconception): number {
  if (m.kind === "option-repeat") return m.count;
  return m.wrongCount;
}

/**
 * Score a misconception by severity (for display priority).
 */
export function misconceptionSeverity(m: Misconception): number {
  if (m.kind === "option-repeat") return m.count * (1 + m.repeatedRate);
  if (m.kind === "overconfident") return m.wrongCount * 1.5;
  return m.wrongCount;
}
