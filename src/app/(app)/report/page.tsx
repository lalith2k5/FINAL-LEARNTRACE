import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { MasteryRing } from "@/components/viz/MasteryRing";
import { CertificatePanel } from "@/components/viz/CertificatePanel";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { requireActiveDomain } from "@/lib/domain";
import { getMasteryView } from "@/lib/mastery/view";
import { getVerifiedSkills } from "@/lib/mastery/evidence";

export const dynamic = "force-dynamic";

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default async function ReportPage() {
  const user = await requireUser();
  const domain = await requireActiveDomain(user.id);

  const skills = await prisma.skill.findMany({
    where: { domainId: domain.id },
    orderBy: [{ difficulty: "asc" }, { name: "asc" }],
  });
  const skillById = new Map(skills.map((s) => [s.id, s]));

  const view = await getMasteryView(user.id);
  const verifiedSkills = await getVerifiedSkills(user.id, domain.id);

  const domainSkillIds = new Set(skills.map((s) => s.id));
  const domainViewList = view.list.filter((v) => domainSkillIds.has(v.skillId));

  if (domainViewList.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Report"
          title={domain.name}
          description="Take the diagnostic first to generate your report."
        />
        <GlassPanel className="p-8 text-center text-sm text-text-tertiary">
          No assessment data yet for this domain.{" "}
          <Link href="/assessment" className="text-accent underline">
            Start the diagnostic →
          </Link>
        </GlassPanel>
      </>
    );
  }

  const attempts = await prisma.attempt.findMany({
    where: {
      userId: user.id,
      question: {
        skills: {
          some: { skillId: { in: skills.map((s) => s.id) } },
        },
      },
    },
  });

  const avgMastery =
    domainViewList.reduce((a, v) => a + v.effective, 0) / domainViewList.length;

  const withSkill = domainViewList
    .map((v) => ({ ...v, skill: skillById.get(v.skillId)! }))
    .filter((v) => v.skill)
    .sort((a, b) => b.effective - a.effective);

  const strong = withSkill.filter((v) => v.effective >= 0.75);
  const developing = withSkill.filter(
    (v) => v.effective >= 0.5 && v.effective < 0.75
  );
  const weak = withSkill.filter((v) => v.effective < 0.5);

  const correctAttempts = attempts.filter((a) => a.correct).length;
  const accuracy =
    attempts.length > 0 ? correctAttempts / attempts.length : 0;
  const totalTimeMs = attempts.reduce((a, x) => a + x.timeTakenMs, 0);
  const totalTimeMin = Math.round(totalTimeMs / 60_000);
  const avgConfidence =
    attempts.length > 0
      ? attempts.reduce((a, x) => a + (x.confidence ?? 0), 0) / attempts.length
      : 0;

  return (
    <>
      <PageHeader
        eyebrow="Report"
        title={`${domain.name} — Report`}
        description={`${domainViewList.length} of ${skills.length} skills attempted`}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <GlassPanel>
          <p className="label-mono">Overall mastery</p>
          <p className="num mt-2 text-3xl font-semibold text-text-primary">
            {Math.round(avgMastery * 100)}%
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            effective · {domainViewList.length} attempted
          </p>
        </GlassPanel>
        <GlassPanel>
          <p className="label-mono">Accuracy</p>
          <p className="num mt-2 text-3xl font-semibold text-text-primary">
            {Math.round(accuracy * 100)}%
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {correctAttempts} of {attempts.length} correct
          </p>
        </GlassPanel>
        <GlassPanel>
          <p className="label-mono">Time invested</p>
          <p className="num mt-2 text-3xl font-semibold text-text-primary">
            {formatMinutes(totalTimeMin)}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">across all attempts</p>
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
          <p className="mt-1 text-xs text-text-tertiary">
            theory + practical passed
          </p>
        </GlassPanel>
      </div>

      <section className="mb-8">
        <p className="label-mono mb-4">Strengths & gaps</p>
        <div className="grid gap-4 md:grid-cols-3">
          <GlassPanel className="border-l-2 border-l-white/[0.35]">
            <p className="label-mono text-text-primary">Strong ({strong.length})</p>
            <ul className="mt-3 space-y-1.5">
              {strong.length === 0 && (
                <li className="text-xs text-text-tertiary">None yet</li>
              )}
              {strong.slice(0, 6).map((v) => (
                <li
                  key={v.skillId}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="truncate text-text-secondary">
                    {v.skill.name}
                  </span>
                  <span className="num text-text-primary">
                    {Math.round(v.effective * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </GlassPanel>

          <GlassPanel className="border-l-2 border-l-white/[0.20]">
            <p className="label-mono text-text-secondary">
              Developing ({developing.length})
            </p>
            <ul className="mt-3 space-y-1.5">
              {developing.length === 0 && (
                <li className="text-xs text-text-tertiary">None yet</li>
              )}
              {developing.slice(0, 6).map((v) => (
                <li
                  key={v.skillId}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="truncate text-text-secondary">
                    {v.skill.name}
                  </span>
                  <span className="num text-text-secondary">
                    {Math.round(v.effective * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </GlassPanel>

          <GlassPanel className="border-l-2 border-l-white/[0.20]">
            <p className="label-mono text-text-tertiary">Weak ({weak.length})</p>
            <ul className="mt-3 space-y-1.5">
              {weak.length === 0 && (
                <li className="text-xs text-text-tertiary">None yet</li>
              )}
              {weak.slice(0, 6).map((v) => (
                <li
                  key={v.skillId}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="truncate text-text-secondary">
                    {v.skill.name}
                  </span>
                  <span className="num text-text-tertiary">
                    {Math.round(v.effective * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>
      </section>

      <section className="mb-8">
        <p className="label-mono mb-4">
          All attempted skills · effective mastery
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {withSkill.map((v) => (
            <GlassPanel key={v.skillId} glow>
              <p className="label-mono truncate" title={v.skill.name}>
                {v.skill.name}
              </p>
              <div className="mt-2 flex justify-center">
                <MasteryRing value={v.effective} size={72} stroke={6} />
              </div>
            </GlassPanel>
          ))}
        </div>
      </section>

      <CertificatePanel
        domainName={domain.name}
        strongSkills={strong.map((v) => v.skill.name)}
        weakSkills={weak.map((v) => v.skill.name)}
        attemptedCount={domainViewList.length}
        avgMastery={avgMastery}
      />
    </>
  );
}
