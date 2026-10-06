import { describe, it, expect } from "vitest";
import {
  weightedDownstreamClosure,
  weightedParentsOf,
  type Edge,
} from "../dag";

describe("weightedDownstreamClosure", () => {
  it("returns empty for a leaf", () => {
    const edges: Edge[] = [{ parentId: "a", childId: "b", weight: 1 }];
    expect(weightedDownstreamClosure("b", edges).size).toBe(0);
  });

  it("direct children carry their edge weight", () => {
    const edges: Edge[] = [
      { parentId: "a", childId: "b", weight: 0.8 },
      { parentId: "a", childId: "c", weight: 0.5 },
    ];
    const r = weightedDownstreamClosure("a", edges);
    expect(r.get("b")).toBe(0.8);
    expect(r.get("c")).toBe(0.5);
  });

  it("multiplies weights transitively", () => {
    const edges: Edge[] = [
      { parentId: "a", childId: "b", weight: 0.8 },
      { parentId: "b", childId: "c", weight: 0.5 },
    ];
    const r = weightedDownstreamClosure("a", edges);
    expect(r.get("b")).toBeCloseTo(0.8);
    expect(r.get("c")).toBeCloseTo(0.4);
  });

  it("picks the strongest path on a diamond", () => {
    const edges: Edge[] = [
      { parentId: "a", childId: "b", weight: 1.0 },
      { parentId: "b", childId: "d", weight: 0.9 },
      { parentId: "a", childId: "c", weight: 0.5 },
      { parentId: "c", childId: "d", weight: 0.5 },
    ];
    const r = weightedDownstreamClosure("a", edges);
    expect(r.get("d")).toBeCloseTo(0.9);
  });

  it("never includes the root even with a cycle", () => {
    const edges: Edge[] = [
      { parentId: "a", childId: "b", weight: 0.9 },
      { parentId: "b", childId: "c", weight: 0.9 },
      { parentId: "c", childId: "a", weight: 0.9 },
    ];
    const r = weightedDownstreamClosure("a", edges);
    expect(r.has("a")).toBe(false);
    expect(r.get("b")).toBeCloseTo(0.9);
    expect(r.get("c")).toBeCloseTo(0.81);
  });
});

describe("weightedParentsOf", () => {
  it("returns direct parents with their weights", () => {
    const edges: Edge[] = [
      { parentId: "a", childId: "c", weight: 0.8 },
      { parentId: "b", childId: "c", weight: 0.5 },
      { parentId: "c", childId: "d", weight: 1 },
    ];
    const parents = weightedParentsOf("c", edges);
    expect(parents).toHaveLength(2);
    expect(parents).toContainEqual({ parentId: "a", weight: 0.8 });
    expect(parents).toContainEqual({ parentId: "b", weight: 0.5 });
  });

  it("returns empty for a root", () => {
    const edges: Edge[] = [{ parentId: "a", childId: "b", weight: 1 }];
    expect(weightedParentsOf("a", edges)).toEqual([]);
  });
});
