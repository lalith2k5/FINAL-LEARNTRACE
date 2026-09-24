import { PageHeader } from "@/components/shared/PageHeader";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { FocusedQuizPicker } from "@/components/assessment/FocusedQuizPicker";
import { startAssessment } from "./actions";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { requireActiveDomain } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function AssessmentPage() {
  const user = await requireUser();
  const domain = await requireActiveDomain(user.id);

  const [qCount, skills] = await Promise.all([
    prisma.question.count({ where: { domainId: domain.id } }),
    prisma.skill.findMany({
      where: { domainId: domain.id },
      orderBy: [{ difficulty: "asc" }, { name: "asc" }],
      select: { id: true, name: true, difficulty: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Assessment"
        title="Test your knowledge"
        description={`Two modes to estimate and refine mastery across ${domain.name}.`}
      />

      <div className="max-w-5xl">
        {/* Two modes side-by-side */}
        <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
          {/* Mode 1 — Full diagnostic */}
          <GlassPanel glow className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="label-mono text-accent">Mode 1</span>
              <span className="h-1 w-1 rounded-full bg-accent" />
              <span className="label-mono text-text-tertiary">
                Recommended
              </span>
            </div>

            <p className="mt-3 text-lg font-medium text-text-primary">
              Full diagnostic
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              15 questions balanced across all difficulty levels. Best for a
              fresh baseline.
            </p>

            <div className="mt-4 rounded-lg border border-border-subtle bg-bg-inset/40 px-3 py-2 text-xs text-text-tertiary">
              Question bank:{" "}
              <span className="num text-text-secondary">{qCount}</span>{" "}
              across{" "}
              <span className="num text-text-secondary">{skills.length}</span>{" "}
              skills
            </div>

            <div className="mt-auto pt-5">
              <form action={startAssessment as () => Promise<void>}>
                <button
                  type="submit"
                  className="btn-primary w-full justify-center text-xs"
                >
                  Begin diagnostic →
                </button>
              </form>
            </div>
          </GlassPanel>

          {/* Mode 2 — Focused quiz */}
          <FocusedQuizPicker skills={skills} />
        </div>

        {/* How it works — slim footer */}
        <GlassPanel className="mt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
            <p className="label-mono shrink-0 sm:pt-0.5">How it works</p>
            <ul className="grid gap-2 text-xs text-text-secondary sm:grid-cols-2">
              <li>
                • Each answer updates mastery via correctness, difficulty,
                response time, and confidence
              </li>
              <li>• Wrong answers generate AI tutor explanations</li>
              <li>• Mastery decays over time — reassess to keep it fresh</li>
              <li>
                • Choose a full diagnostic or focus on specific skills
              </li>
            </ul>
          </div>
        </GlassPanel>
      </div>
    </>
  );
}
