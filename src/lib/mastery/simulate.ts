import { downstreamClosure, parentsOf, type Edge } from "@/lib/graph/dag";

export type SimulateInput = {
  skillId: string;
  mode: "skip" | "improve";
  targetValue?: number;        // for improve mode, 0..1
  mastery: Record<string, number>;
  graph: { skillIds: string[]; edges: Edge[] };
  goalSkillIds: Set<string>;
  targetMastery: number;       // e.g. 0.75
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

/**
 * Goal readiness = average mastery over goal skills (capped at target).
 */
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
  return total / goalSkillIds.size / targetMastery; // 0..1
}

/**
 * Simulate changing mastery of a skill and propagate the effect
 * down through downstream skills (dependents) using a simple
 * proportional model.
 *
 * - skip mode: sets the skill to 0 and drags down downstream skills
 *   proportionally to how much of their mastery could be attributed
 *   to this prerequisite.
 * - improve mode: sets the skill to `targetValue` and lifts downstream
 *   skills toward the target, capped at the target mastery.
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

  // Clone mastery
  const next: Record<string, number> = { ...mastery };

  const before = mastery[skillId] ?? 0;

  if (mode === "skip") {
    next[skillId] = 0;
  } else {
    next[skillId] = Math.min(1, Math.max(0, targetValue));
  }

  const directDelta = next[skillId] - before;

  // Propagate to downstream skills (transitively)
  const downstream = downstreamClosure(skillId, graph.edges);

  // Sort downstream by depth from root so effects cascade correctly.
  // We compute depth via BFS.
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
    const parents = parentsOf(id, graph.edges);
    if (parents.length === 0) continue;

    // Weighted average of parents after the change (only those we know)
    let parentSum = 0;
    let parentCount = 0;
    for (const p of parents) {
      parentSum += next[p] ?? 0;
      parentCount++;
    }
    const parentAvg = parentCount > 0 ? parentSum / parentCount : 0;

    // Downstream skill shouldn't exceed target mastery just because
    // a parent improved — assume learner still has to do the work.
    const cap = targetMastery;

    if (mode === "skip") {
      // Drag down: new value = min(current, parentAvg), but not below 0
      const dragged = Math.min(next[id] ?? 0, parentAvg);
      next[id] = Math.max(0, dragged);
    } else {
      // Lift up: new value = max(current, min(parentAvg, cap))
      const lifted = Math.min(cap, parentAvg);
      next[id] = Math.max(next[id] ?? 0, lifted);
    }
  }

  // Collect affected (any non-zero delta)
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
