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

function mkAttempt(overrides: Partial<MisconceptionAttempt> = {}): MisconceptionAttempt {
  return {
    skillId: "sk1",
    skillName: "Skill 1",
    questionId: "q1",
    questionPrompt: "Question 1",
    correct: false,
    selectedOptionId: "a",
    correctOptionId: "b",
    options: OPTIONS,
    createdAt: new Date("2025-01-01"),
    ...overrides,
  };
}

describe("detectMisconceptions", () => {
  it("returns empty for no attempts", () => {
    expect(detectMisconceptions([])).toEqual([]);
  });

  it("ignores correct attempts", () => {
    const attempts = [
      mkAttempt({ correct: true }),
      mkAttempt({ correct: true }),
    ];
    expect(detectMisconceptions(attempts)).toEqual([]);
  });

  it("ignores single-occurrence wrongs", () => {
    const attempts = [mkAttempt({ selectedOptionId: "a" })];
    expect(detectMisconceptions(attempts)).toEqual([]);
  });

  it("detects a repeated wrong option", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: "a" }),
      mkAttempt({ selectedOptionId: "a" }),
    ];
    const result = detectMisconceptions(attempts);
    expect(result).toHaveLength(1);
    expect(result[0].selectedOptionId).toBe("a");
    expect(result[0].count).toBe(2);
  });

  it("does not mix wrong options on the same skill", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: "a" }),
      mkAttempt({ selectedOptionId: "b" }),
    ];
    expect(detectMisconceptions(attempts)).toEqual([]);
  });

  it("detects multiple misconceptions across skills", () => {
    const attempts = [
      mkAttempt({ skillId: "sk1", skillName: "S1", selectedOptionId: "a" }),
      mkAttempt({ skillId: "sk1", skillName: "S1", selectedOptionId: "a" }),
      mkAttempt({ skillId: "sk2", skillName: "S2", selectedOptionId: "c" }),
      mkAttempt({ skillId: "sk2", skillName: "S2", selectedOptionId: "c" }),
      mkAttempt({ skillId: "sk2", skillName: "S2", selectedOptionId: "c" }),
    ];
    const result = detectMisconceptions(attempts);
    expect(result).toHaveLength(2);
    // Sk2 has 3 occurrences → ranked first
    expect(result[0].skillId).toBe("sk2");
    expect(result[0].count).toBe(3);
    expect(result[1].skillId).toBe("sk1");
    expect(result[1].count).toBe(2);
  });

  it("computes repeatedRate correctly", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: "a" }),
      mkAttempt({ selectedOptionId: "a" }),
      mkAttempt({ selectedOptionId: "b" }),
    ];
    const result = detectMisconceptions(attempts);
    expect(result[0].count).toBe(2);
    expect(result[0].totalWrongOnSkill).toBe(3);
    expect(result[0].repeatedRate).toBeCloseTo(2 / 3);
  });

  it("captures example question prompts", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: "a", questionPrompt: "Q-A" }),
      mkAttempt({ selectedOptionId: "a", questionPrompt: "Q-B" }),
    ];
    const result = detectMisconceptions(attempts);
    expect(result[0].exampleQuestions).toContain("Q-A");
    expect(result[0].exampleQuestions).toContain("Q-B");
  });

  it("ignores attempts with null selectedOptionId", () => {
    const attempts = [
      mkAttempt({ selectedOptionId: null }),
      mkAttempt({ selectedOptionId: null }),
    ];
    expect(detectMisconceptions(attempts)).toEqual([]);
  });
});

describe("misconceptionSeverity", () => {
  it("scales with count and repeat rate", () => {
    const high = misconceptionSeverity({
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
});
