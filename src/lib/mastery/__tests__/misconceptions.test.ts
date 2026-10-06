import { describe, it, expect } from "vitest";
import {
  detectMisconceptions,
  misconceptionSeverity,
  type MisconceptionAttempt,
} from "../misconceptions";

const OPTIONS = [
  { id: "a", text: "Answer A" },
  { id: "b", text: "Answer B" },
  { id: "c", text: "Answer C" },
  { id: "d", text: "Answer D" },
];

function mkAttempt(
  overrides: Partial<MisconceptionAttempt> = {}
): MisconceptionAttempt {
  return {
    skillId: "sk1",
    skillName: "Skill 1",
    questionId: "q1",
    questionPrompt: "Question 1",
    correct: false,
    selectedOptionId: "a",
    correctOptionId: "b",
    options: OPTIONS,
    confidence: 2,
    createdAt: new Date("2025-01-01"),
    ...overrides,
  };
}

describe("detectMisconceptions", () => {
  it("returns empty for no attempts", () => {
    expect(detectMisconceptions([])).toEqual([]);
  });

  it("ignores skills with only correct attempts", () => {
    const attempts = [
      mkAttempt({ correct: true }),
      mkAttempt({ correct: true }),
    ];
    expect(detectMisconceptions(attempts)).toEqual([]);
  });

  it("does not flag a single wrong option (option-repeat needs 2+)", () => {
    const attempts = [mkAttempt({ selectedOptionId: "a", confidence: 2 })];
    expect(detectMisconceptions(attempts)).toEqual([]);
  });

  it("detects option-repeat when same wrong option picked twice", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: "a", confidence: 2 }),
      mkAttempt({ selectedOptionId: "a", confidence: 2 }),
    ];
    const result = detectMisconceptions(attempts);
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("option-repeat");
    if (result[0].kind === "option-repeat") {
      expect(result[0].selectedOptionId).toBe("a");
      expect(result[0].count).toBe(2);
    }
  });

  it("does not flag mixed wrong options on the same skill", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: "a", confidence: 2 }),
      mkAttempt({ selectedOptionId: "b", confidence: 2 }),
    ];
    const result = detectMisconceptions(attempts);
    // No option-repeat (both unique) and no overconfident (conf=2) and
    // no skill-weak (only 2 wrongs, need 3+)
    expect(result).toEqual([]);
  });

  it("prefers option-repeat over skill-weak when both trigger", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: "a", confidence: 2 }),
      mkAttempt({ selectedOptionId: "a", confidence: 2 }),
      mkAttempt({ selectedOptionId: "a", confidence: 2 }),
      mkAttempt({ selectedOptionId: "a", confidence: 2 }),
    ];
    const result = detectMisconceptions(attempts);
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("option-repeat");
  });

  it("detects overconfident when wrong with confidence >= 4 twice", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: "a", confidence: 5 }),
      mkAttempt({ selectedOptionId: "b", confidence: 4 }),
    ];
    const result = detectMisconceptions(attempts);
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("overconfident");
    if (result[0].kind === "overconfident") {
      expect(result[0].wrongCount).toBe(2);
      expect(result[0].avgConfidence).toBeCloseTo(4.5);
    }
  });

  it("overconfident requires confidence >= 4", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: "a", confidence: 3 }),
      mkAttempt({ selectedOptionId: "b", confidence: 3 }),
    ];
    expect(detectMisconceptions(attempts)).toEqual([]);
  });

  it("detects skill-weak when 3+ wrongs at 50%+ rate", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: "a", confidence: 2 }),
      mkAttempt({ selectedOptionId: "b", confidence: 2 }),
      mkAttempt({ selectedOptionId: "c", confidence: 2 }),
      mkAttempt({ correct: true, selectedOptionId: "d", confidence: 2 }),
    ];
    const result = detectMisconceptions(attempts);
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("skill-weak");
    if (result[0].kind === "skill-weak") {
      expect(result[0].wrongCount).toBe(3);
      expect(result[0].totalCount).toBe(4);
      expect(result[0].wrongRate).toBeCloseTo(0.75);
    }
  });

  it("skill-weak needs at least 3 wrongs", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: "a", confidence: 2 }),
      mkAttempt({ selectedOptionId: "b", confidence: 2 }),
    ];
    expect(detectMisconceptions(attempts)).toEqual([]);
  });

  it("returns one signal per skill, ranked option-repeat first", () => {
    const attempts = [
      // Skill 1: option-repeat
      mkAttempt({ skillId: "sk1", skillName: "S1", selectedOptionId: "a", confidence: 2 }),
      mkAttempt({ skillId: "sk1", skillName: "S1", selectedOptionId: "a", confidence: 2 }),
      // Skill 2: overconfident
      mkAttempt({ skillId: "sk2", skillName: "S2", selectedOptionId: "a", confidence: 5 }),
      mkAttempt({ skillId: "sk2", skillName: "S2", selectedOptionId: "b", confidence: 5 }),
      // Skill 3: skill-weak
      mkAttempt({ skillId: "sk3", skillName: "S3", selectedOptionId: "a", confidence: 2 }),
      mkAttempt({ skillId: "sk3", skillName: "S3", selectedOptionId: "b", confidence: 2 }),
      mkAttempt({ skillId: "sk3", skillName: "S3", selectedOptionId: "c", confidence: 2 }),
    ];
    const result = detectMisconceptions(attempts);
    expect(result).toHaveLength(3);
    expect(result[0].kind).toBe("option-repeat");
    expect(result[1].kind).toBe("overconfident");
    expect(result[2].kind).toBe("skill-weak");
  });

  it("captures example question prompts", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: "a", questionPrompt: "Q-A", confidence: 2 }),
      mkAttempt({ selectedOptionId: "a", questionPrompt: "Q-B", confidence: 2 }),
    ];
    const result = detectMisconceptions(attempts);
    expect(result[0].exampleQuestions).toContain("Q-A");
    expect(result[0].exampleQuestions).toContain("Q-B");
  });

  it("ignores attempts with null selectedOptionId", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: null, confidence: 5 }),
      mkAttempt({ selectedOptionId: null, confidence: 5 }),
    ];
    expect(detectMisconceptions(attempts)).toEqual([]);
  });
});

describe("misconceptionSeverity", () => {
  it("option-repeat severity scales with count and repeat rate", () => {
    const high = misconceptionSeverity({
      kind: "option-repeat",
      skillId: "s",
      skillName: "S",
      selectedOptionId: "a",
      selectedOptionText: "A",
      correctOptionId: "b",
      correctOptionText: "B",
      count: 5,
      totalWrongOnSkill: 5,
      repeatedRate: 1,
      lastSeenAt: new Date(),
      exampleQuestions: [],
    });
    const low = misconceptionSeverity({
      kind: "option-repeat",
      skillId: "s",
      skillName: "S",
      selectedOptionId: "a",
      selectedOptionText: "A",
      correctOptionId: "b",
      correctOptionText: "B",
      count: 2,
      totalWrongOnSkill: 5,
      repeatedRate: 0.4,
      lastSeenAt: new Date(),
      exampleQuestions: [],
    });
    expect(high).toBeGreaterThan(low);
  });

  it("overconfident severity weights higher than skill-weak per count", () => {
    const over = misconceptionSeverity({
      kind: "overconfident",
      skillId: "s",
      skillName: "S",
      wrongCount: 3,
      confidentAttempts: 3,
      avgConfidence: 4.5,
      lastSeenAt: new Date(),
      exampleQuestions: [],
    });
    const weak = misconceptionSeverity({
      kind: "skill-weak",
      skillId: "s",
      skillName: "S",
      wrongCount: 3,
      totalCount: 5,
      wrongRate: 0.6,
      lastSeenAt: new Date(),
      exampleQuestions: [],
    });
    expect(over).toBeGreaterThan(weak);
  });
});
