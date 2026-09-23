import { describe, it, expect } from "vitest";
import {
  pickNextDifficulty,
  startingDifficulty,
  difficultyFitScore,
} from "../adaptive";

describe("startingDifficulty", () => {
  it("starts low for low mastery", () => {
    expect(startingDifficulty(0.1)).toBe(2);
    expect(startingDifficulty(0.35)).toBe(2);
  });

  it("starts medium for medium mastery", () => {
    expect(startingDifficulty(0.5)).toBe(3);
    expect(startingDifficulty(0.65)).toBe(3);
  });

  it("starts higher for high mastery", () => {
    expect(startingDifficulty(0.75)).toBe(4);
    expect(startingDifficulty(0.95)).toBe(4);
  });
});

describe("pickNextDifficulty", () => {
  it("returns current target on cold start", () => {
    const r = pickNextDifficulty([], 3);
    expect(r.targetDifficulty).toBe(3);
  });

  it("stays same when window incomplete", () => {
    const r = pickNextDifficulty(
      [{ correct: true, difficulty: 3 }],
      3
    );
    expect(r.targetDifficulty).toBe(3);
  });

  it("bumps up on 3/3 correct", () => {
    const recent = [
      { correct: true, difficulty: 3 },
      { correct: true, difficulty: 3 },
      { correct: true, difficulty: 3 },
    ];
    expect(pickNextDifficulty(recent, 3).targetDifficulty).toBe(4);
  });

  it("stays on 2/3 correct", () => {
    const recent = [
      { correct: true, difficulty: 3 },
      { correct: true, difficulty: 3 },
      { correct: false, difficulty: 3 },
    ];
    expect(pickNextDifficulty(recent, 3).targetDifficulty).toBe(3);
  });

  it("drops by 1 on 1/3 correct", () => {
    const recent = [
      { correct: true, difficulty: 3 },
      { correct: false, difficulty: 3 },
      { correct: false, difficulty: 3 },
    ];
    expect(pickNextDifficulty(recent, 3).targetDifficulty).toBe(2);
  });

  it("drops by 2 on 0/3 correct", () => {
    const recent = [
      { correct: false, difficulty: 4 },
      { correct: false, difficulty: 4 },
      { correct: false, difficulty: 4 },
    ];
    expect(pickNextDifficulty(recent, 4).targetDifficulty).toBe(2);
  });

  it("never exceeds 5", () => {
    const recent = [
      { correct: true, difficulty: 5 },
      { correct: true, difficulty: 5 },
      { correct: true, difficulty: 5 },
    ];
    expect(pickNextDifficulty(recent, 5).targetDifficulty).toBe(5);
  });

  it("never drops below 1", () => {
    const recent = [
      { correct: false, difficulty: 1 },
      { correct: false, difficulty: 1 },
      { correct: false, difficulty: 1 },
    ];
    expect(pickNextDifficulty(recent, 1).targetDifficulty).toBe(1);
  });

  it("only looks at the last 3 attempts", () => {
    // Earlier: 3 wrong. Recent: 3 right. Should bump up.
    const recent = [
      { correct: false, difficulty: 2 },
      { correct: false, difficulty: 2 },
      { correct: false, difficulty: 2 },
      { correct: true, difficulty: 2 },
      { correct: true, difficulty: 2 },
      { correct: true, difficulty: 2 },
    ];
    expect(pickNextDifficulty(recent, 2).targetDifficulty).toBe(3);
  });
});

describe("difficultyFitScore", () => {
  it("returns 0 for exact match", () => {
    expect(difficultyFitScore(3, 3)).toBe(0);
  });

  it("increases with distance", () => {
    expect(difficultyFitScore(2, 4)).toBe(2);
    expect(difficultyFitScore(1, 5)).toBe(4);
  });
});
