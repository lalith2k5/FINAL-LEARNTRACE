import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { MasteryBarList } from "@/components/viz/MasteryBarList";
import {
  MasterySparkline,
  type MasteryDataPoint,
} from "@/components/viz/MasterySparkline";
import { DecayBadge } from "@/components/viz/DecayBadge";
import { MisconceptionCard } from "@/components/viz/MisconceptionCard";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { requireActiveDomain } from "@/lib/domain";
import { rankGaps } from "@/lib/mastery/impact";
import { getMasteryView } from "@/lib/mastery/view";
import {
  detectMisconceptions,
  type MisconceptionAttempt,
} from "@/lib/mastery/misconceptions";
import { getVerifiedSkills, getEvidenceMap } from "@/lib/mastery/evidence";
import type { Edge } from "@/lib/graph/dag";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const domain = await requireActiveDomain(user.id);

  const skills = await prisma.skill.findMany({
    where: { domainId: domain.id },
    orderBy: { difficulty: "asc" },
  });
  const prereqs = await prisma.prerequisite.findMany({
    where: { parent: { domainId: domain.id } },
  });

  const view = await getMasteryView(user.id);
  const verifiedSkills = await getVerifiedSkills(user.id, domain.id);
  const evidenceMap = await getEvidenceMap(user.id, domain.id);

  const domainSkillIds = new Set(skills.map((s) => s.id));
  const domainMastery: Record<string, number> = {};
  for (const v of view.list) {
    if (domainSkillIds.has(v.skillId)) domainMastery[v.skillId] = v.effective;
  }
  const domainViewList = view.list.filter((v) => domainSkillIds.has(v.skillId));
  const domainRevisionQueue = view.revisionQueue.filter((v) =>
    domainSkillIds.has(v.skillId)
  );

  const wrongAttempts = await prisma.attempt.findMany({
    where: {
      userId: user.id,
      correct: false,
      selectedOptionId: { not: null },
      question: { domainId: domain.id },
    },
    include: {
      question: { include: { skills: { include: { skill: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const misconceptionAttempts: MisconceptionAttempt[] = [];
  for (const a of wrongAttempts) {
    const ps = a.question.skills[0]?.skill;
    if (!ps) continue;
    misconceptionAttempts.push({
      skillId: ps.id,
      skillName: ps.name,
      questionId: a.question.id,
      questionPrompt: a.question.prompt,
      correct: a.correct,
      selectedOptionId: a.selectedOptionId,
      correctOptionId: a.question.correctId,
      options: a.question.options as { id: string; text: string }[],
      createdAt: a.createdAt,
    });
  }
  const misconceptions = detectMisconceptions(misconceptionAttempts);

  const edges: Edge[] = prereqs.map((p) => ({
    parentId: p.parentId,
    childId: p.childId,
  }));
  const skillById = new Map(skills.map((s) => [s.id, s]));

  const attemptedCount = domainViewList.length;
  const isFreshUser = attemptedCount === 0;
  const strongCount = domainViewList.filter((v) => v.effective >= 0.75).length;
  const weakCount = domainViewList.filter((v) => v.effective < 0.5).length;
  const decayingCount = domainRevisionQueue.length;

  const avgMastery =
    attemptedCount > 0
      ? domainViewList.reduce((a, v) => a + v.effective, 0) / attemptedCount
      : 0;

  const goalSkills = [...skills]
    .sort((a, b) => b.difficulty - a.difficulty)
    .slice(0, 3);
  const goalSkillIds = new Set(goalSkills.map((s) => s.id));

  const ranked = rankGaps({
    mastery: domainMastery,
    graph: { skillIds: skills.map((s) => s.id), edges },
    goalSkillIds,
    targetMastery: 0.75,
  }).slice(0, 3);

  const topMastery = [...domainViewList].sort(
    (a, b) => b.effective - a.effective
  );

  const masteryRows = await prisma.mastery.findMany({
    where: { userId: user.id, skillId: { in: skills.map((s) => s.id) } },
    include: { skill: true },
  });

  type HistoryEntry = { t: string; v: number };
  const sparkData: MasteryDataPoint[] = [];
  for (const row of masteryRows) {
    const hist = Array.isArray(row.history)
      ? (row.history as unknown as HistoryEntry[])
      : [];
    for (const h of hist) {
      if (typeof h?.t === "string" && typeof h?.v === "number") {
        sparkData.push({ t: h.t, v: h.v, skillName: row.skill.name });
      }
    }
  }
  sparkData.sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());
  const recentHistory = sparkData.slice(-60);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Your learning state"
        description={`A live view of mastery across ${domain.name}.`}
      />

      {isFreshUser && (
        <section className="mb-8 space-y-4">
          <GlassPanel glow className="border-l-2 border-l-accent">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <p className="label-mono text-accent">Get started</p>
                <p className="mt-2 text-lg font-medium text-text-primary">
                  Take your first diagnostic
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  15 adaptive questions across {domain.name}. We&apos;ll
                  estimate your mastery, find your highest-impact gaps, and
                  build your roadmap.
                </p>
              </div>
              <Link href="/assessment" className="btn-primary shrink-0">
                Begin diagnostic →
              </Link>
            </div>
          </GlassPanel>

          <GlassPanel className="p-8 text-center text-sm text-text-tertiary">
            Your mastery, gaps, and roadmap will appear here after your first
            diagnostic.
          </GlassPanel>
        </section>
      )}

      {!isFreshUser && (
        <>
      {/* KPI Row */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <GlassPanel>
          <p className="label-mono">Overall mastery</p>
          <p className="num mt-2 text-3xl font-semibold text-text-primary">
            {Math.round(avgMastery * 100)}%
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            effective · {attemptedCount} attempted
          </p>
        </GlassPanel>

        <GlassPanel>
          <p className="label-mono">Strong skills</p>
          <p className="num mt-2 text-3xl font-semibold text-text-primary">
            {strongCount}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">≥ 75% mastery</p>
        </GlassPanel>

        <GlassPanel>
          <p className="label-mono">Weak skills</p>
          <p className="num mt-2 text-3xl font-semibold text-text-tertiary">
            {weakCount}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">&lt; 50% mastery</p>
        </GlassPanel>

        <GlassPanel
          className={
            decayingCount > 0
              ? "border-white/[0.10]/40 "
              : undefined
          }
        >
          <p className="label-mono">Needs revision</p>
          <p
            className={`num mt-2 text-3xl font-semibold ${
              decayingCount > 0 ? "text-text-secondary" : "text-text-primary"
            }`}
          >
            {decayingCount}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">decaying or stale</p>
        </GlassPanel>

        <GlassPanel
          className={
            verifiedSkills.size > 0
              ? "border-white/[0.12]/40 "
              : undefined
          }
        >
          <p className="label-mono">Verified skills</p>
          <p
            className={`num mt-2 text-3xl font-semibold ${
              verifiedSkills.size > 0 ? "text-text-primary" : "text-text-primary"
            }`}
          >
            {verifiedSkills.size}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">theory + practical</p>
        </GlassPanel>
      </div>

      {/* Mastery over time */}
      <section className="mb-8">
        <GlassPanel>
          <div className="flex items-center justify-between">
            <div>
              <p className="label-mono">Mastery over time</p>
              <p className="mt-1 text-xs text-text-tertiary">
                Every mastery update across {domain.name}, last 60 events
              </p>
            </div>
            <span className="label-mono">
              {recentHistory.length}{" "}
              {recentHistory.length === 1 ? "point" : "points"}
            </span>
          </div>
          <div className="mt-4">
            <MasterySparkline data={recentHistory} targetMastery={0.75} />
          </div>
        </GlassPanel>
      </section>

      {/* Revision Queue */}
      {domainRevisionQueue.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="label-mono text-text-secondary">
              Revision queue · {domainRevisionQueue.length}{" "}
              {domainRevisionQueue.length === 1 ? "skill" : "skills"}
            </p>
            <span className="label-mono">least recently practiced first</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {domainRevisionQueue.slice(0, 3).map((v) => {
              const skill = skillById.get(v.skillId);
              if (!skill) return null;
              return (
                <GlassPanel
                  key={v.skillId}
                  glow
                  className={
                    v.tier === "stale" ? "border-white/[0.08]/40" : "border-white/[0.10]/40"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {skill.name}
                      </p>
                      <div className="mt-2">
                        <DecayBadge view={v} />
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="num text-xs text-text-tertiary">
                        {Math.round(v.raw * 100)}%
                      </p>
                      <p className="num text-sm font-medium text-text-secondary">
                        {Math.round(v.effective * 100)}%
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-text-tertiary">
                    −{Math.round(v.decayRatio * 100)}% lost since last practice
                  </p>
                  <Link
                    href={`/learn/${skill.id}`}
                    className="btn-primary mt-3 w-full justify-center text-xs"
                  >
                    Revise now →
                  </Link>
                </GlassPanel>
              );
            })}
          </div>
        </section>
      )}

      {/* Top mastery */}
      {topMastery.length > 0 && (
        <section className="mb-8">
          <MasteryBarList
            label="Your strongest areas"
            defaultValue={3}
            options={[3, 5, 10, 0]}
            items={topMastery.flatMap((v) => {
              const skill = skillById.get(v.skillId);
              if (!skill) return [];
              return [
                {
                  skillId: v.skillId,
                  name: skill.name,
                  value: v.effective,
                  view: v,
                },
              ];
            })}
          />
        </section>
      )}

      {/* Misconceptions */}
      {misconceptions.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="label-mono text-text-tertiary">
              Misconceptions · {misconceptions.length} recurring{" "}
              {misconceptions.length === 1 ? "pattern" : "patterns"}
            </p>
            <span className="label-mono">same wrong answer repeated</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {misconceptions.slice(0, 4).map((m, i) => (
              <MisconceptionCard
                key={`${m.skillId}-${m.selectedOptionId}`}
                misconception={m}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* Verified skills */}
      {verifiedSkills.size > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="label-mono text-text-primary">
              Verified skills · {verifiedSkills.size} total
            </p>
            <span className="label-mono">theory + practical demonstrated</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from(verifiedSkills)
              .slice(0, 6)
              .map((skillId) => {
                const skill = skillById.get(skillId);
                const ev = evidenceMap.get(skillId);
                if (!skill || !ev) return null;
                return (
                  <GlassPanel
                    key={skillId}
                    glow
                    className="border-white/[0.12]/30 "
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {skill.name}
                      </p>
                      <span className="label-mono shrink-0 text-text-primary">
                        ✓ Verified
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className="text-text-tertiary">
                        Theory{" "}
                        <span className="num text-text-primary">
                          {Math.round(ev.theory * 100)}%
                        </span>
                      </span>
                      <span className="text-text-tertiary">
                        Practical{" "}
                        <span className="num text-text-primary">
                          {Math.round(ev.practical * 100)}%
                        </span>
                      </span>
                    </div>
                  </GlassPanel>
                );
              })}
          </div>
        </section>
      )}

      {/* Top 3 gaps */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <p className="label-mono">Top 3 skill gaps — ranked by impact</p>
          <Link href="/gaps" className="btn-ghost text-xs">
            See all gaps →
          </Link>
        </div>

        {ranked.length === 0 ? (
          <GlassPanel className="p-6 text-sm text-text-tertiary">
            No gaps detected. Take the diagnostic to get started.
          </GlassPanel>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {ranked.map((r, i) => {
              const skill = skillById.get(r.skillId);
              if (!skill) return null;
              const pct = Math.round(r.mastery * 100);
              return (
                <GlassPanel key={r.skillId} glow>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="label-mono">
                        #{i + 1} · Impact {r.score.toFixed(2)}
                      </p>
                      <p className="mt-1 truncate text-base font-medium text-text-primary">
                        {skill.name}
                      </p>
                    </div>
                    <span className="num shrink-0 rounded-md border border-border-default bg-bg-inset px-2 py-0.5 text-xs text-text-secondary">
                      {pct}%
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs text-text-tertiary">
                    {skill.description ?? "No description."}
                  </p>
                  <Link
                    href={`/learn/${skill.id}`}
                    className="btn-primary mt-4 w-full justify-center"
                  >
                    Learn this →
                  </Link>
                </GlassPanel>
              );
            })}
          </div>
        )}
      </section>
        </>
      )}
    </>
  );
}
