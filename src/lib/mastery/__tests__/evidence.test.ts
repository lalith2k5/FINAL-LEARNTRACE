import { describe, it, expect } from "vitest";

const VERIFIED_THRESHOLD = 0.75;

type Evidence = {
  theory: number;
  practical: number;
  hasPracticalTasks: boolean;
};

function isVerified(e: Evidence): boolean {
  const theoryOk = e.theory >= VERIFIED_THRESHOLD;
  const practicalOk = e.practical >= VERIFIED_THRESHOLD;
  return theoryOk && (practicalOk || !e.hasPracticalTasks);
}

describe("verified rule", () => {
  it("requires theory >= 0.75 when a practical task exists", () => {
    expect(
      isVerified({ theory: 0.9, practical: 0.9, hasPracticalTasks: true })
    ).toBe(true);
    expect(
      isVerified({ theory: 0.7, practical: 0.9, hasPracticalTasks: true })
    ).toBe(false);
  });

  it("requires practical >= 0.75 when a practical task exists", () => {
    expect(
      isVerified({ theory: 0.9, practical: 0.7, hasPracticalTasks: true })
    ).toBe(false);
    expect(
      isVerified({ theory: 0.9, practical: 0.8, hasPracticalTasks: true })
    ).toBe(true);
  });

  it("waives practical when no task is mapped", () => {
    expect(
      isVerified({ theory: 0.9, practical: 0, hasPracticalTasks: false })
    ).toBe(true);
    expect(
      isVerified({ theory: 0.7, practical: 0, hasPracticalTasks: false })
    ).toBe(false);
  });

  it("exact threshold counts as passing", () => {
    expect(
      isVerified({ theory: 0.75, practical: 0.75, hasPracticalTasks: true })
    ).toBe(true);
    expect(
      isVerified({ theory: 0.75, practical: 0, hasPracticalTasks: false })
    ).toBe(true);
  });

  it("zero theory is never verified", () => {
    expect(
      isVerified({ theory: 0, practical: 1, hasPracticalTasks: true })
    ).toBe(false);
    expect(
      isVerified({ theory: 0, practical: 0, hasPracticalTasks: false })
    ).toBe(false);
  });
});
