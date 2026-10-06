import { describe, it, expect } from "vitest";
import { simulate } from "../simulate";
import type { Edge } from "@/lib/graph/dag";

describe("simulate — weight sensitivity", () => {
  it("skip: single parent at weight 1.0 drags child by 0.5 of the drop", () => {
    const edges: Edge[] = [
      { parentId: "a", childId: "b", weight: 1.0 },
    ];
    const result = simulate({
      skillId: "a",
      mode: "skip",
      mastery: { a: 0.8, b: 0.8 },
      graph: { skillIds: ["a", "b"], edges },
      goalSkillIds: new Set(["b"]),
      targetMastery: 0.75,
    });
    const b = result.affected.find((x) => x.id === "b")!;
    // parent drop = 0.8, drag = 0.5 * 0.8 * 1.0 = 0.4
    expect(b.after).toBeCloseTo(0.4);
  });

  it("skip: single parent at weight 0.5 drags child by half of that", () => {
    const edges: Edge[] = [
      { parentId: "a", childId: "b", weight: 0.5 },
    ];
    const result = simulate({
      skillId: "a",
      mode: "skip",
      mastery: { a: 0.8, b: 0.8 },
      graph: { skillIds: ["a", "b"], edges },
      goalSkillIds: new Set(["b"]),
      targetMastery: 0.75,
    });
    const b = result.affected.find((x) => x.id === "b")!;
    // parent drop = 0.8, drag = 0.5 * 0.8 * 0.5 = 0.2
    expect(b.after).toBeCloseTo(0.6);
  });

  it("skip: weight 0.5 edge drags less than weight 1.0 edge", () => {
    const strong = simulate({
      skillId: "a",
      mode: "skip",
      mastery: { a: 0.8, b: 0.8 },
      graph: {
        skillIds: ["a", "b"],
        edges: [{ parentId: "a", childId: "b", weight: 1.0 }],
      },
      goalSkillIds: new Set(["b"]),
      targetMastery: 0.75,
    });
    const weak = simulate({
      skillId: "a",
      mode: "skip",
      mastery: { a: 0.8, b: 0.8 },
      graph: {
        skillIds: ["a", "b"],
        edges: [{ parentId: "a", childId: "b", weight: 0.5 }],
      },
      goalSkillIds: new Set(["b"]),
      targetMastery: 0.75,
    });
    const strongDelta = strong.affected.find((x) => x.id === "b")!.delta;
    const weakDelta = weak.affected.find((x) => x.id === "b")!.delta;
    expect(strongDelta).toBeLessThan(weakDelta);
  });

  it("improve: never lowers a downstream node", () => {
    const result = simulate({
      skillId: "a",
      mode: "improve",
      targetValue: 0.9,
      mastery: { a: 0.4, b: 0.8 },
      graph: {
        skillIds: ["a", "b"],
        edges: [{ parentId: "a", childId: "b", weight: 1.0 }],
      },
      goalSkillIds: new Set(["b"]),
      targetMastery: 0.75,
    });
    const b = result.affected.find((x) => x.id === "b");
    // b was 0.8, parent becomes 0.9, lift to 0.9 but b's already 0.8 -> b moves up
    // Or if b stays at 0.8 that's also fine (never lowers). Assert delta >= 0.
    if (b) expect(b.delta).toBeGreaterThanOrEqual(0);
  });

  it("improve: weight 1.0 lifts child, weight 0.5 lifts less", () => {
    const strong = simulate({
      skillId: "a",
      mode: "improve",
      targetValue: 1.0,
      mastery: { a: 0.3, b: 0.3 },
      graph: {
        skillIds: ["a", "b"],
        edges: [{ parentId: "a", childId: "b", weight: 1.0 }],
      },
      goalSkillIds: new Set(["b"]),
      targetMastery: 0.75,
    });
    const weak = simulate({
      skillId: "a",
      mode: "improve",
      targetValue: 1.0,
      mastery: { a: 0.3, b: 0.3 },
      graph: {
        skillIds: ["a", "b"],
        edges: [{ parentId: "a", childId: "b", weight: 0.5 }],
      },
      goalSkillIds: new Set(["b"]),
      targetMastery: 0.75,
    });
    const strongAfter = strong.affected.find((x) => x.id === "b")?.after ?? 0.3;
    const weakAfter = weak.affected.find((x) => x.id === "b")?.after ?? 0.3;
    expect(strongAfter).toBeGreaterThan(weakAfter);
  });

  it("skip produces non-positive readiness delta", () => {
    const result = simulate({
      skillId: "a",
      mode: "skip",
      mastery: { a: 0.8, b: 0.7 },
      graph: {
        skillIds: ["a", "b"],
        edges: [{ parentId: "a", childId: "b", weight: 1.0 }],
      },
      goalSkillIds: new Set(["b"]),
      targetMastery: 0.75,
    });
    expect(result.readinessDelta).toBeLessThanOrEqual(0);
  });

  it("improve produces non-negative readiness delta", () => {
    const result = simulate({
      skillId: "a",
      mode: "improve",
      targetValue: 1.0,
      mastery: { a: 0.3, b: 0.3 },
      graph: {
        skillIds: ["a", "b"],
        edges: [{ parentId: "a", childId: "b", weight: 1.0 }],
      },
      goalSkillIds: new Set(["b"]),
      targetMastery: 0.75,
    });
    expect(result.readinessDelta).toBeGreaterThanOrEqual(0);
  });
});
