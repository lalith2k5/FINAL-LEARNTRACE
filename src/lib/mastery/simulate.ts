import {
  downstreamClosure,
  weightedParentsOf,
  type Edge,
} from "@/lib/graph/dag";

export type SimulateInput = {
  skillId: string;
  mode: "skip" | "improve";
  targetValue?: number;
  mastery: Record<string, number>;
  graph: { skillIds: string[]; edges: Edge[] };
  goalSkillIds: Set<string>;
  targetMastery: number;
};

type AffectedSkill = {
  id: string;
  before: number;
  after: number;
  delta: number;
};

export type SimulateResult = {
  affected: AffectedSkill[];
  goalReadinessBefore: number;
  goalReadinessAfter: number;
  readinessDelta: number;
  summary: {
    skillsAffected: number;
    skillsRegressed: number;
    skillsImproved: number;
    goalSkillsAffected: number;
  };
};

function goalReadiness(
  mastery: Record<string, number>,
  goalSkillIds: Set<string>,
  targetMastery: number
): number {
  if (goalSkillIds.size === 0) return 0;
  let total = 0;
  for (const id of goalSkillIds) {
    const m = mastery[id] ?? 0;
    total += Math.min(m, targetMastery);
  }
  return total / goalSkillIds.size / targetMastery;
}

/**
 * Simulate changing mastery of a skill and propagate the effect down
 * through downstream skills.
 *
 * - skip: sets the skill to 0, drags each downstream node down by
 *   `avgParentDrop * DRAG`, where the parent average is weighted by
 *   edge weight. A node with a single 1.0-weight parent loses 50% of
 *   that parent's drop; a node with two parents at 0.9 and 0.5 loses
 *   50% of the weighted average.
 * - improve: sets the skill to `max(before, targetValue)`, lifts each
 *   downstream node toward the weighted parent average, capped at
 *   targetMastery. Never lowers a downstream node.
 */
export function simulate(input: SimulateInput): SimulateResult {
  const {
    skillId,
    mode,
    targetValue = input.targetMastery,
    mastery,
    graph,
    goalSkillIds,
    targetMastery,
  } = input;

  const next: Record<string, number> = { ...mastery };
  const before = mastery[skillId] ?? 0;

  if (mode === "skip") {
    next[skillId] = 0;
  } else {
    const target = Math.min(1, Math.max(0, targetValue));
    next[skillId] = Math.max(before, target);
  }

  const downstream = downstreamClosure(skillId, graph.edges);

  const adj = new Map<string, string[]>();
  for (const e of graph.edges) {
    if (!adj.has(e.parentId)) adj.set(e.parentId, []);
    adj.get(e.parentId)!.push(e.childId);
  }
  const depth = new Map<string, number>();
  const queue: [string, number][] = [[skillId, 0]];
  while (queue.length) {
    const [u, d] = queue.shift()!;
    if (depth.has(u) && depth.get(u)! <= d) continue;
    depth.set(u, d);
    for (const v of adj.get(u) ?? []) queue.push([v, d + 1]);
  }

  const orderedDownstream = [...downstream].sort(
    (a, b) => (depth.get(a) ?? 99) - (depth.get(b) ?? 99)
  );

  for (const id of orderedDownstream) {
    const parents = weightedParentsOf(id, graph.edges);
    if (parents.length === 0) continue;

    if (mode === "skip") {
      const DRAG = 0.5;
      let dropSum = 0;
      for (const { parentId: p, weight: w } of parents) {
        const beforeParent = mastery[p] ?? 0;
        const afterParent = next[p] ?? 0;
        dropSum += Math.max(0, beforeParent - afterParent) * w;
      }
      const avgDrop = parents.length > 0 ? dropSum / parents.length : 0;
      const current = next[id] ?? 0;
      next[id] = Math.max(0, current - avgDrop * DRAG);
    } else {
      let parentSum = 0;
      for (const { parentId: p, weight: w } of parents) {
        parentSum += (next[p] ?? 0) * w;
      }
      const parentAvg = parents.length > 0 ? parentSum / parents.length : 0;
      const lifted = Math.min(targetMastery, parentAvg);
      next[id] = Math.max(next[id] ?? 0, lifted);
    }
  }

  const affected: AffectedSkill[] = [];
  const allIds = new Set([skillId, ...downstream]);
  for (const id of allIds) {
    const b = mastery[id] ?? 0;
    const a = next[id] ?? 0;
    const d = a - b;
    if (Math.abs(d) > 1e-4) {
      affected.push({ id, before: b, after: a, delta: d });
    }
  }
  affected.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const readinessBefore = goalReadiness(mastery, goalSkillIds, targetMastery);
  const readinessAfter = goalReadiness(next, goalSkillIds, targetMastery);

  return {
    affected,
    goalReadinessBefore: readinessBefore,
    goalReadinessAfter: readinessAfter,
    readinessDelta: readinessAfter - readinessBefore,
    summary: {
      skillsAffected: affected.length,
      skillsRegressed: affected.filter((a) => a.delta < 0).length,
      skillsImproved: affected.filter((a) => a.delta > 0).length,
      goalSkillsAffected: affected.filter((a) => goalSkillIds.has(a.id)).length,
    },
  };
}
