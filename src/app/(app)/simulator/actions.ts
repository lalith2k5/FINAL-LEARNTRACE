"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { requireActiveDomain } from "@/lib/domain";
import { getMasteryView } from "@/lib/mastery/view";
import { simulate, type SimulateResult } from "@/lib/mastery/simulate";
import type { Edge } from "@/lib/graph/dag";

export type SimulateActionInput = {
  skillId: string;
  mode: "skip" | "improve";
  targetValue?: number;
};

export async function runSimulation(
  input: SimulateActionInput
): Promise<
  | { ok: true; result: SimulateResult; skillNames: Record<string, string> }
  | { ok: false; error: string }
> {
  const user = await requireUser();
  const domain = await requireActiveDomain(user.id);

  const skills = await prisma.skill.findMany({
    where: { domainId: domain.id },
  });
  const prereqs = await prisma.prerequisite.findMany({
    where: { parent: { domainId: domain.id } },
  });

  const view = await getMasteryView(user.id);

  // Filter to this domain's skills
  const domainSkillIds = new Set(skills.map((s) => s.id));
  const mastery: Record<string, number> = {};
  for (const v of view.list) {
    if (domainSkillIds.has(v.skillId)) mastery[v.skillId] = v.effective;
  }

  const edges: Edge[] = prereqs.map((p) => ({
    parentId: p.parentId,
    childId: p.childId,
  }));

  const targetMastery = 0.75;

  const goalSkills = [...skills]
    .sort((a, b) => b.difficulty - a.difficulty)
    .slice(0, 3);
  const goalSkillIds = new Set(goalSkills.map((s) => s.id));

  const result = simulate({
    skillId: input.skillId,
    mode: input.mode,
    targetValue: input.targetValue,
    mastery,
    graph: { skillIds: skills.map((s) => s.id), edges },
    goalSkillIds,
    targetMastery,
  });

  const skillNames: Record<string, string> = {};
  for (const s of skills) skillNames[s.id] = s.name;

  return { ok: true, result, skillNames };
}
