import { startReassessment } from "./reassess-action";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { MasteryRing } from "@/components/viz/MasteryRing";
import { DecayBadge } from "@/components/viz/DecayBadge";
import { EvidencePanel } from "@/components/learn/EvidencePanel";
import { MaterialCard } from "@/components/learn/MaterialCard";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { getMasteryView } from "@/lib/mastery/view";
import { getSkillEvidence } from "@/lib/mastery/evidence";

export const dynamic = "force-dynamic";

export default async function LearnSkillPage({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const { skillId } = await params;
  const user = await requireUser();

  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    include: {
      materials: {
        include: { material: true },
      },
    },
  });
  if (!skill) notFound();

  const view = await getMasteryView(user.id);
  const masteryView = view.bySkillId.get(skillId);
  const evidence = await getSkillEvidence(user.id, skillId);

  // Load progress rows for this user's materials
  const materialIds = skill.materials.map((ms) => ms.material.id);
  const progressRows = await prisma.materialProgress.findMany({
    where: {
      userId: user.id,
      materialId: { in: materialIds },
    },
  });
  const completedSet = new Set(
    progressRows.filter((p) => p.completed).map((p) => p.materialId)
  );

  // Stats
  const totalMaterials = skill.materials.length;
  const completedCount = skill.materials.filter((ms) =>
    completedSet.has(ms.material.id)
  ).length;
  const progressPct =
    totalMaterials > 0 ? (completedCount / totalMaterials) * 100 : 0;

  return (
    <>
      <PageHeader
        eyebrow={`Learn · Difficulty ${skill.difficulty}/5`}
        title={skill.name}
        description={skill.description ?? undefined}
      />

      {/* Evidence panel */}
      <div className="mb-6">
        <EvidencePanel evidence={evidence} />
      </div>

      {/* Top row: mastery + progress */}
      <div className="mb-8 grid gap-4 md:grid-cols-[200px_1fr]">
        <GlassPanel glow className="flex flex-col items-center justify-center">
          <MasteryRing
            value={masteryView?.effective ?? 0}
            size={120}
            stroke={9}
            label="MASTERY"
          />
          {masteryView && (
            <div className="mt-3">
              <DecayBadge view={masteryView} />
            </div>
          )}
          {!masteryView && (
            <p className="mt-3 text-xs text-text-tertiary">
              No data yet — take the diagnostic.
            </p>
          )}
        </GlassPanel>

        <GlassPanel className="flex flex-col justify-center">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-mono">Learning progress</p>
              <p className="mt-1 text-sm text-text-secondary">
                {completedCount} of {totalMaterials}{" "}
                {totalMaterials === 1 ? "material" : "materials"} completed
              </p>
            </div>
            <div className="text-right">
              <p className="num text-2xl font-semibold text-text-primary">
                {Math.round(progressPct)}%
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-bg-inset">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-cyan transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {progressPct === 100 && totalMaterials > 0 && (
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-xs text-text-primary">
                ✓ All materials completed. Ready to reassess?
              </p>
              <form action={startReassessment.bind(null, skill.id)}>
                <button type="submit" className="btn-primary text-xs">
                  Take reassessment →
                </button>
              </form>
            </div>
          )}

          {progressPct < 100 && totalMaterials > 0 && (
            <p className="mt-3 text-xs text-text-tertiary">
              Complete all materials to unlock reassessment.
            </p>
          )}
        </GlassPanel>
      </div>

      {/* Materials */}
      {totalMaterials === 0 ? (
        <GlassPanel className="p-8 text-center text-sm text-text-tertiary">
          No materials mapped to this skill yet.
        </GlassPanel>
      ) : (
        <>
          <p className="label-mono mb-4">
            Materials · {totalMaterials} total
          </p>
          <div className="space-y-3">
            {skill.materials.map((ms, i) => (
              <MaterialCard
                key={ms.material.id}
                material={{
                  id: ms.material.id,
                  title: ms.material.title,
                  type: ms.material.type,
                  url: ms.material.url,
                  body: ms.material.body,
                }}
                skillId={skill.id}
                completed={completedSet.has(ms.material.id)}
                index={i}
              />
            ))}
          </div>
        </>
      )}

      {/* Back link */}
      <div className="mt-8 flex justify-center">
        <Link href="/roadmap" className="btn-ghost text-xs">
          ← Back to roadmap
        </Link>
      </div>
    </>
  );
}
