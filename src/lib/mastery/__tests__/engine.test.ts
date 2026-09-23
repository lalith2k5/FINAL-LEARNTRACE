import { describe, it, expect } from "vitest";
import { updateMastery } from "../engine";
import { dependencyImpactScore, rankGaps } from "../impact";
import { buildRoadmap } from "../roadmap";
import { hasCycle, topologicalSort, downstreamClosure } from "@/lib/graph/dag";

describe("updateMastery", () => {
  it("increases on correct hard answer", () => {
    const prior = 0.5;
    const next = updateMastery(prior, {
      correct: true,
      difficulty: 5,
      timeTakenMs: 30_000,
      expectedMs: 30_000,
      confidence: 4,
      attemptNo: 1,
      skillWeight: 1,
    });
    expect(next).toBeGreaterThan(prior);
  });

  it("decreases on wrong easy answer", () => {
    const prior = 0.7;
    const next = updateMastery(prior, {
      correct: false,
      difficulty: 1,
      timeTakenMs: 5_000,
      expectedMs: 30_000,
      confidence: 3,
      attemptNo: 1,
      skillWeight: 1,
    });
    expect(next).toBeLessThan(prior);
  });

  it("stays within [0.01, 0.99]", () => {
    for (let i = 0; i < 20; i++) {
      const next = updateMastery(0.5, {
        correct: true,
        difficulty: 3,
        timeTakenMs: 30_000,
        expectedMs: 30_000,
        attemptNo: 1,
        skillWeight: 1,
      });
      expect(next).toBeLessThanOrEqual(0.99);
      expect(next).toBeGreaterThanOrEqual(0.01);
    }
  });
});

describe("graph", () => {
  const ids = ["a", "b", "c", "d"];
  const edges = [
    { parentId: "a", childId: "b" },
    { parentId: "b", childId: "c" },
    { parentId: "a", childId: "d" },
  ];

  it("detects no cycle in a DAG", () => {
    expect(hasCycle(ids, edges)).toBe(false);
  });

  it("detects a cycle", () => {
    expect(
      hasCycle(ids, [...edges, { parentId: "c", childId: "a" }])
    ).toBe(true);
  });

  it("topologically sorts", () => {
    const sorted = topologicalSort(ids, edges);
    expect(sorted.indexOf("a")).toBeLessThan(sorted.indexOf("b"));
    expect(sorted.indexOf("b")).toBeLessThan(sorted.indexOf("c"));
    expect(sorted.indexOf("a")).toBeLessThan(sorted.indexOf("d"));
  });

  it("computes downstream closure", () => {
    const down = downstreamClosure("a", edges);
    expect(down.has("b")).toBe(true);
    expect(down.has("c")).toBe(true);
    expect(down.has("d")).toBe(true);
  });
});

describe("impact + roadmap", () => {
  const graph = {
    skillIds: ["py", "prob", "stats", "ml"],
    edges: [
      { parentId: "py", childId: "ml" },
      { parentId: "prob", childId: "stats" },
      { parentId: "stats", childId: "ml" },
    ],
  };
  const mastery = { py: 0.9, prob: 0.3, stats: 0.7, ml: 0.5 };
  const goals = new Set(["ml"]);

  it("excludes mastered skills from gaps", () => {
    const ranked = rankGaps({
      mastery,
      graph,
      goalSkillIds: goals,
      targetMastery: 0.75,
    });
    expect(ranked.find((r) => r.skillId === "py")).toBeUndefined();
  });

  it("ranks probability #1 (weak + blocks goal)", () => {
    const ranked = rankGaps({
      mastery,
      graph,
      goalSkillIds: goals,
      targetMastery: 0.75,
    });
    expect(ranked[0]?.skillId).toBe("prob");
  });

  it("probability has higher impact than statistics", () => {
    const goalSkillIds = goals;
    const graphArg = { skillIds: graph.skillIds, edges: graph.edges };
    const probScore = dependencyImpactScore({
      skillId: "prob",
      mastery,
      graph: graphArg,
      goalSkillIds,
      targetMastery: 0.75,
    });
    const statsScore = dependencyImpactScore({
      skillId: "stats",
      mastery,
      graph: graphArg,
      goalSkillIds,
      targetMastery: 0.75,
    });
    expect(probScore).toBeGreaterThan(statsScore);
  });

  it("places probability before ml in roadmap", () => {
    const roadmap = buildRoadmap({ mastery, graph, goalSkillIds: goals });
    const idxProb = roadmap.findIndex((s) => s.skillId === "prob");
    const idxMl = roadmap.findIndex((s) => s.skillId === "ml");
    expect(idxProb).toBeLessThan(idxMl);
  });
});
