import { PageHeader } from "@/components/shared/PageHeader";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { GapCard, type GapCardData } from "@/components/viz/GapCard";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { requireActiveDomain } from "@/lib/domain";
import { getMasteryView } from "@/lib/mastery/view";
import { dependencyImpactScore } from "@/lib/mastery/impact";
import { downstreamClosure, type Edge } from "@/lib/graph/dag";

export const dynamic = "force-dynamic";

export default async function GapsPage() {
  const user = await requireUser();
  const domain = await requireActiveDomain(user.id);

  const skills = await prisma.skill.findMany({
    where: { domainId: domain.id },
  });
  const prereqs = await prisma.prerequisite.findMany({
    where: { parent: { domainId: domain.id } },
  });

  const view = await getMasteryView(user.id);
  const effective = view.asEffectiveRecord();

  // Only skills from the active domain
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

  const allScored = skills
    .map((s) => {
      const score = dependencyImpactScore({
        skillId: s.id,
        mastery: masteryMap,
        graph: { skillIds: skills.map((x) => x.id), edges },
        goalSkillIds,
        targetMastery,
      });
      return { skill: s, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (domainAttemptedCount === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Skill Gaps"
          title={domain.name}
          description="Ranked by Dependency Impact Score."
        />
        <GlassPanel className="p-8 text-center text-sm text-text-tertiary">
          Take the diagnostic first to see your skill gaps ranked by impact.
        </GlassPanel>
      </>
    );
  }

  const gapData: GapCardData[] = allScored.slice(0, 20).map((r, i) => {
    const mastery = masteryMap[r.skill.id] ?? 0;
    const gap = Math.max(0, targetMastery - mastery);
    const down = downstreamClosure(r.skill.id, edges);
    const downstreamIds = Array.from(down);

    let downstreamImpact = 0;
    for (const id of downstreamIds) {
      const dm = masteryMap[id] ?? 0;
      const dGap = Math.max(0, targetMastery - dm);
      downstreamImpact += dGap * (goalSkillIds.has(id) ? 1.5 : 1.0);
    }

    return {
      rank: i + 1,
      skillId: r.skill.id,
      skillName: r.skill.name,
      difficulty: r.skill.difficulty,
      description: r.skill.description,
      mastery,
      gap,
      score: r.score,
      downstreamCount: down.size,
      downstreamImpact,
      goalRelevant: goalSkillIds.has(r.skill.id),
      downstream: downstreamIds.slice(0, 8).map((id) => {
        const s = skillById.get(id);
        return {
          id,
          name: s?.name ?? id,
          mastery: masteryMap[id] ?? 0,
        };
      }),
    };
  });

  const criticalCount = gapData.filter((g) => g.score >= 1.5).length;
  const goalBlocking = gapData.filter((g) => g.goalRelevant).length;
  const totalGaps = gapData.length;

  return (
    <>
      <PageHeader
        eyebrow="Skill Gaps"
        title={domain.name}
        description="Ranked by Dependency Impact Score — how much each weak skill blocks your target."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <GlassPanel>
          <p className="label-mono">Total gaps</p>
          <p className="num mt-2 text-3xl font-semibold text-text-primary">
            {totalGaps}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            skills below {Math.round(targetMastery * 100)}%
          </p>
        </GlassPanel>
        <GlassPanel>
          <p className="label-mono">Critical</p>
          <p className="num mt-2 text-3xl font-semibold text-text-tertiary">
            {criticalCount}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">high impact</p>
        </GlassPanel>
        <GlassPanel>
          <p className="label-mono">Goal-blocking</p>
          <p className="num mt-2 text-3xl font-semibold text-accent">
            {goalBlocking}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            directly affect your goal
          </p>
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
          <p className="mt-1 text-xs text-text-tertiary">
            skills losing mastery
          </p>
        </GlassPanel>
      </div>

      <div className="space-y-4">
        {gapData.map((data) => (
          <GapCard key={data.skillId} data={data} />
        ))}
      </div>

      {gapData.length === 0 && (
        <GlassPanel className="p-8 text-center text-sm text-text-tertiary">
          No gaps detected. You&apos;re on track.
        </GlassPanel>
      )}
    </>
  );
}
