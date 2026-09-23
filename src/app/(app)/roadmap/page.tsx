import { PageHeader } from "@/components/shared/PageHeader";
import { GlassPanel } from "@/components/shared/GlassPanel";
import {
  RoadmapStepCard,
  type RoadmapStepData,
} from "@/components/viz/RoadmapStep";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { requireActiveDomain } from "@/lib/domain";
import { getMasteryView } from "@/lib/mastery/view";
import { buildRoadmap } from "@/lib/mastery/roadmap";
import { parentsOf, type Edge } from "@/lib/graph/dag";

export const dynamic = "force-dynamic";

function formatTotalMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default async function RoadmapPage() {
  const user = await requireUser();
  const domain = await requireActiveDomain(user.id);

  const skills = await prisma.skill.findMany({
    where: { domainId: domain.id },
  });
  const prereqs = await prisma.prerequisite.findMany({
    where: { parent: { domainId: domain.id } },
  });

  const view = await getMasteryView(user.id);

  const domainSkillIds = new Set(skills.map((s) => s.id));
  const masteryMap: Record<string, number> = {};
  for (const v of view.list) {
    if (domainSkillIds.has(v.skillId)) masteryMap[v.skillId] = v.effective;
  }
  const domainAttemptedCount = view.list.filter((v) =>
    domainSkillIds.has(v.skillId)
  ).length;
  const domainDecayingCount = view.revisionQueue.filter((v) =>
    domainSkillIds.has(v.skillId)
  ).length;

  const skillById = new Map(skills.map((s) => [s.id, s]));
  const edges: Edge[] = prereqs.map((p) => ({
    parentId: p.parentId,
    childId: p.childId,
  }));

  const targetMastery = 0.75;

  const goalSkills = [...skills]
    .sort((a, b) => b.difficulty - a.difficulty)
    .slice(0, 3);
  const goalSkillIds = new Set(goalSkills.map((s) => s.id));

  const steps = buildRoadmap({
    mastery: masteryMap,
    graph: { skillIds: skills.map((s) => s.id), edges },
    goalSkillIds,
    targetMastery,
  });

  if (domainAttemptedCount === 0 || steps.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Roadmap"
          title={domain.name}
          description="Topologically ordered, prioritized by impact."
        />
        <GlassPanel className="p-8 text-center text-sm text-text-tertiary">
          {domainAttemptedCount === 0
            ? "Take the diagnostic to generate your personalized roadmap."
            : "You're on track — no gaps detected."}
        </GlassPanel>
      </>
    );
  }

  const enriched: RoadmapStepData[] = steps.map((s) => {
    const skill = skillById.get(s.skillId);
    const parents = parentsOf(s.skillId, edges);
    const prereqsSatisfied = parents.every(
      (p) => (masteryMap[p] ?? 0) >= targetMastery
    );
    return {
      order: s.order,
      skillId: s.skillId,
      skillName: skill?.name ?? s.skillId,
      difficulty: skill?.difficulty ?? 3,
      description: skill?.description ?? null,
      mastery: masteryMap[s.skillId] ?? 0,
      targetMastery,
      priority: s.priority,
      reason: s.reason,
      estimatedMinutes: s.estimatedMinutes,
      prereqsSatisfied,
      goalRelevant: goalSkillIds.has(s.skillId),
    };
  });

  const totalMinutes = enriched.reduce((a, s) => a + s.estimatedMinutes, 0);
  const readyCount = enriched.filter((s) => s.prereqsSatisfied).length;
  const blockedCount = enriched.filter((s) => !s.prereqsSatisfied).length;

  return (
    <>
      <PageHeader
        eyebrow="Roadmap"
        title={domain.name}
        description={`${enriched.length} steps ordered by prerequisite dependency and impact.`}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <GlassPanel>
          <p className="label-mono">Total steps</p>
          <p className="num mt-2 text-3xl font-semibold text-text-primary">
            {enriched.length}
          </p>
        </GlassPanel>
        <GlassPanel>
          <p className="label-mono">Estimated time</p>
          <p className="num mt-2 text-3xl font-semibold text-text-primary">
            {formatTotalMinutes(totalMinutes)}
          </p>
        </GlassPanel>
        <GlassPanel>
          <p className="label-mono">Ready now</p>
          <p className="num mt-2 text-3xl font-semibold text-text-primary">
            {readyCount}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">prereqs satisfied</p>
        </GlassPanel>
        <GlassPanel
          className={
            domainDecayingCount > 0
              ? "border-white/[0.10]/40 "
              : undefined
          }
        >
          <p className="label-mono">Decaying</p>
          <p
            className={`num mt-2 text-3xl font-semibold ${
              domainDecayingCount > 0 ? "text-text-secondary" : "text-text-primary"
            }`}
          >
            {domainDecayingCount}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">in revision queue</p>
        </GlassPanel>
      </div>

      <div className="max-w-4xl">
        {enriched.map((step, i) => (
          <RoadmapStepCard
            key={step.skillId}
            step={step}
            index={i}
            isFirst={i === 0}
            isLast={i === enriched.length - 1}
          />
        ))}
      </div>
    </>
  );
}
