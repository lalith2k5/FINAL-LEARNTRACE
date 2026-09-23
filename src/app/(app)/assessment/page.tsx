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

      <div className="grid max-w-4xl gap-4">
        {/* Info panel */}
        <GlassPanel>
          <p className="label-mono">How it works</p>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li>• Each answer updates mastery via correctness, difficulty, response time, and confidence</li>
            <li>• Wrong answers generate AI tutor explanations</li>
            <li>• Mastery decays over time — reassess to keep it fresh</li>
            <li>• Choose a full diagnostic or focus on specific skills</li>
          </ul>
        </GlassPanel>

        {/* Mode 1: Full diagnostic */}
        <GlassPanel glow>
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="label-mono text-accent">Mode 1</span>
                <span className="h-1 w-1 rounded-full bg-accent" />
              </div>
              <p className="mt-2 text-base font-medium text-text-primary">
                Full diagnostic
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                15 questions balanced across all difficulty levels. Best for a
                fresh baseline.
              </p>
              <p className="mt-3 text-xs text-text-tertiary">
                Question bank: <span className="num text-text-secondary">{qCount}</span>{" "}
                across <span className="num text-text-secondary">{skills.length}</span> skills
              </p>
            </div>
            <form action={startAssessment as () => Promise<void>}>
              <button type="submit" className="btn-primary text-xs">
                Begin diagnostic →
              </button>
            </form>
          </div>
        </GlassPanel>

        {/* Mode 2: Focused quiz */}
        <FocusedQuizPicker skills={skills} />
      </div>
    </>
  );
}
