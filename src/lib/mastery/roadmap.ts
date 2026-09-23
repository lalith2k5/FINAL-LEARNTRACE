import { parentsOf, type Edge } from "@/lib/graph/dag";
import { rankGaps, type Graph } from "./impact";

export type RoadmapStep = {
  skillId: string;
  order: number;
  priority: number;
  reason: string;
  estimatedMinutes: number;
};

export type BuildRoadmapArgs = {
  mastery: Record<string, number>;
  graph: Graph;
  goalSkillIds: Set<string>;
  targetMastery?: number;
};

export function buildRoadmap(args: BuildRoadmapArgs): RoadmapStep[] {
  const targetMastery = args.targetMastery ?? 0.75;

  const ranked = rankGaps({
    mastery: args.mastery,
    graph: args.graph,
    goalSkillIds: args.goalSkillIds,
    targetMastery,
  });

  const rankedIds = new Set(ranked.map((r) => r.skillId));

  // Respect prerequisite ordering: a skill appears only after its
  // parents that are also in the roadmap.
  const ordered: typeof ranked = [];
  const placed = new Set<string>();
  const remaining = [...ranked];

  while (remaining.length) {
    let progressed = false;
    for (let i = 0; i < remaining.length; i++) {
      const r = remaining[i];
      const parents = parentsOf(r.skillId, args.graph.edges).filter((p) =>
        rankedIds.has(p)
      );
      if (parents.every((p) => placed.has(p))) {
        ordered.push(r);
        placed.add(r.skillId);
        remaining.splice(i, 1);
        progressed = true;
        break;
      }
    }
    if (!progressed) {
      // Cycle or unresolvable ordering — just append the rest
      ordered.push(...remaining);
      break;
    }
  }

  return ordered.map((r, i) => ({
    skillId: r.skillId,
    order: i + 1,
    priority: r.score,
    reason: buildReason(r.skillId, r.mastery, targetMastery, args.goalSkillIds),
    estimatedMinutes: estimateMinutes(r.score, r.mastery),
  }));
}

function estimateMinutes(score: number, mastery: number): number {
  const base = 45;
  const gap = Math.max(0, 0.75 - mastery);
  return Math.round(base + gap * 120 + Math.min(score, 3) * 15);
}

function buildReason(
  skillId: string,
  mastery: number,
  targetMastery: number,
  goalSkillIds: Set<string>
): string {
  const pct = Math.round(mastery * 100);
  const target = Math.round(targetMastery * 100);
  const goal = goalSkillIds.has(skillId) ? " It's a direct goal skill." : "";
  return `Current mastery ${pct}%, target ${target}%.${goal}`;
}
