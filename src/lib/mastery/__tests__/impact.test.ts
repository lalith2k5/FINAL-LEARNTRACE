import { describe, it, expect } from "vitest";
import { dependencyImpactScore, rankGaps } from "../impact";
import type { Edge } from "@/lib/graph/dag";

describe("dependencyImpactScore — weight sensitivity", () => {
  it("returns 0 when mastery is already at target", () => {
    const score = dependencyImpactScore({
      skillId: "a",
      mastery: { a: 0.9, b: 0.4 },
      targetMastery: 0.75,
      goalSkillIds: new Set(["b"]),
      graph: {
        skillIds: ["a", "b"],
        edges: [{ parentId: "a", childId: "b", weight: 1.0 }],
      },
    });
    expect(score).toBe(0);
  });

  it("higher weight on the edge to a weak downstream node increases score", () => {
    const strong = dependencyImpactScore({
      skillId: "a",
      mastery: { a: 0.4, b: 0.4 },
      targetMastery: 0.75,
      goalSkillIds: new Set(["b"]),
      graph: {
        skillIds: ["a", "b"],
        edges: [{ parentId: "a", childId: "b", weight: 1.0 }],
      },
    });
    const weak = dependencyImpactScore({
      skillId: "a",
      mastery: { a: 0.4, b: 0.4 },
      targetMastery: 0.75,
      goalSkillIds: new Set(["b"]),
      graph: {
        skillIds: ["a", "b"],
        edges: [{ parentId: "a", childId: "b", weight: 0.3 }],
      },
    });
    expect(strong).toBeGreaterThan(weak);
  });

  it("goal-relevant skills get a boost", () => {
    const goal = dependencyImpactScore({
      skillId: "a",
      mastery: { a: 0.4, b: 0.4 },
      targetMastery: 0.75,
      goalSkillIds: new Set(["a"]),
      graph: {
        skillIds: ["a", "b"],
        edges: [{ parentId: "a", childId: "b", weight: 1.0 }],
      },
    });
    const nonGoal = dependencyImpactScore({
      skillId: "a",
      mastery: { a: 0.4, b: 0.4 },
      targetMastery: 0.75,
      goalSkillIds: new Set(["b"]),
      graph: {
        skillIds: ["a", "b"],
        edges: [{ parentId: "a", childId: "b", weight: 1.0 }],
      },
    });
    expect(goal).toBeGreaterThan(nonGoal);
  });
});

describe("rankGaps", () => {
  it("excludes mastered skills", () => {
    const ranked = rankGaps({
      mastery: { a: 0.9, b: 0.4 },
      targetMastery: 0.75,
      goalSkillIds: new Set(["b"]),
      graph: {
        skillIds: ["a", "b"],
        edges: [{ parentId: "a", childId: "b", weight: 1.0 }],
      },
    });
    expect(ranked.find((r) => r.skillId === "a")).toBeUndefined();
    expect(ranked.find((r) => r.skillId === "b")).toBeDefined();
  });

  it("returns sorted descending by score", () => {
    const ranked = rankGaps({
      mastery: { a: 0.4, b: 0.3, c: 0.2 },
      targetMastery: 0.75,
      goalSkillIds: new Set(["c"]),
      graph: {
        skillIds: ["a", "b", "c"],
        edges: [
          { parentId: "a", childId: "c", weight: 1.0 },
          { parentId: "b", childId: "c", weight: 0.5 },
        ],
      },
    });
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
    }
  });
});
