import { weightedDownstreamClosure, type Edge } from "@/lib/graph/dag";

export type Graph = {
  skillIds: string[];
  edges: Edge[];
};

export type ImpactInput = {
  skillId: string;
  mastery: Record<string, number>;
  targetMastery: number;
  goalSkillIds: Set<string>;
  graph: Graph;
};

/**
 * Dependency Impact Score:
 *   Gap × (1 + DownstreamImpact) × GoalRelevance / DepthPenalty
 *
 * Where:
 *   Gap              = how far the skill is from target mastery
 *   DownstreamImpact = sum over downstream nodes of
 *                      (their gap) × (goal weight) × (path weight)
 *   GoalRelevance    = 1.5 if the skill is a goal skill, else 1.0
 *   DepthPenalty     = mild penalty for skills with huge downstream sets
 *
 * Path weights come from `weightedDownstreamClosure`, so an edge with
 * weight 0.5 contributes half as much as one with 1.0, and transitive
 * dependencies compound multiplicatively.
 */
export function dependencyImpactScore(input: ImpactInput): number {
  const { skillId, mastery, targetMastery, goalSkillIds, graph } = input;

  const m = mastery[skillId] ?? 0;
  const gap = Math.max(0, targetMastery - m);
  if (gap === 0) return 0;

  const downstream = weightedDownstreamClosure(skillId, graph.edges);

  let downstreamImpact = 0;
  for (const [id, w] of downstream) {
    const dm = mastery[id] ?? 0;
    const dGap = Math.max(0, targetMastery - dm);
    const goalWeight = goalSkillIds.has(id) ? 1.5 : 1.0;
    downstreamImpact += dGap * goalWeight * w;
  }

  const goalRelevance = goalSkillIds.has(skillId) ? 1.5 : 1.0;
  const depthPenalty = 1 + 0.1 * Math.max(0, downstream.size - 5);

  return (gap * (1 + downstreamImpact) * goalRelevance) / depthPenalty;
}

/**
 * Rank all skills by impact.
 */
export function rankGaps(
  input: Omit<ImpactInput, "skillId">
): { skillId: string; score: number; mastery: number }[] {
  return input.graph.skillIds
    .map((skillId) => ({
      skillId,
      score: dependencyImpactScore({ ...input, skillId }),
      mastery: input.mastery[skillId] ?? 0,
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
