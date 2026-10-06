import { describe, it, expect } from "vitest";
import {
  detectMisconceptions,
  misconceptionSeverity,
  type MisconceptionAttempt,
} from "../misconceptions";

const OPTIONS = [
  { id: "a", text: "Answer A" },
  { id: "b", text: "Answer B" },
];

function mk(overrides: Partial<MisconceptionAttempt> = {}): MisconceptionAttempt {
  return {
    skillId: "sk1",
    skillName: "Skill 1",
    questionId: "q1",
    questionPrompt: "Q?",
    correct: false,
    selectedOptionId: "a",
    correctOptionId: "b",
    options: OPTIONS,
    confidence: 2,
    createdAt: new Date("2025-01-01"),
    ...overrides,
  };
}

describe("semantic signal", () => {
  it("groups by category and requires 2+", () => {
    const attempts = [
      mk({
        selectedOptionId: "a",
        misconceptionJson: {
          category: "formula-confusion",
          misconception: "You swapped A and B.",
          corrective: "Use A for X, B for Y.",
          confidence: 0.8,
        },
      }),
    ];
    expect(detectMisconceptions(attempts)).toEqual([]);
  });

  it("detects a repeated semantic category", () => {
    const attempts = [
      mk({
        questionId: "q1",
        selectedOptionId: "a",
        misconceptionJson: {
          category: "formula-confusion",
          misconception: "Swapped A and B.",
          corrective: "Use A for X, B for Y.",
          confidence: 0.8,
        },
      }),
      mk({
        questionId: "q2",
        selectedOptionId: "b",
        misconceptionJson: {
          category: "formula-confusion",
          misconception: "Swapped A and B again.",
          corrective: "Use A for X, B for Y.",
          confidence: 0.7,
        },
      }),
    ];
    const result = detectMisconceptions(attempts);
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("semantic");
    if (result[0].kind === "semantic") {
      expect(result[0].category).toBe("formula-confusion");
      expect(result[0].count).toBe(2);
      expect(result[0].belief).toBe("Swapped A and B.");
      expect(result[0].avgConfidence).toBeCloseTo(0.75);
    }
  });

  it("prefers semantic over option-repeat", () => {
    const attempts = [
      mk({
        selectedOptionId: "a",
        misconceptionJson: {
          category: "unit-error",
          misconception: "Wrong units.",
          corrective: "Convert first.",
          confidence: 0.9,
        },
      }),
      mk({
        selectedOptionId: "a",
        misconceptionJson: {
          category: "unit-error",
          misconception: "Wrong units.",
          corrective: "Convert first.",
          confidence: 0.8,
        },
      }),
    ];
    const result = detectMisconceptions(attempts);
    expect(result[0].kind).toBe("semantic");
  });

  it("ignores 'unclear' category and does not fire any signal", () => {
    const attempts = [
      mk({
        selectedOptionId: "a",
        misconceptionJson: { category: "unclear", confidence: 0.1 },
      }),
      mk({
        selectedOptionId: "b",
        misconceptionJson: { category: "unclear", confidence: 0.1 },
      }),
    ];
    expect(detectMisconceptions(attempts)).toEqual([]);
  });

  it("falls through to option-repeat when only one semantic hit", () => {
    const attempts = [
      mk({
        selectedOptionId: "a",
        misconceptionJson: {
          category: "formula-confusion",
          misconception: "x",
          corrective: "y",
          confidence: 0.9,
        },
      }),
      mk({
        selectedOptionId: "a",
      }),
    ];
    const result = detectMisconceptions(attempts);
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("option-repeat");
  });

  it("severity weights semantic higher per count", () => {
    const s = misconceptionSeverity({
      kind: "semantic",
      skillId: "s",
      skillName: "S",
      category: "formula-confusion",
      count: 3,
      belief: "x",
      corrective: "y",
      avgConfidence: 0.8,
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
    expect(s).toBeGreaterThan(weak);
  });
});
