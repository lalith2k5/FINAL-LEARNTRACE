import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { HistoryTimeline, type HistoryEvent } from "@/components/profile/HistoryTimeline";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await requireUser();

  // Fetch attempts
  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id },
    include: {
      question: {
        include: {
          skills: { include: { skill: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Fetch practical submissions
  const submissions = await prisma.practicalSubmission.findMany({
    where: { userId: user.id },
    include: { task: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Merge into events
  const events: HistoryEvent[] = [
    ...attempts.map<HistoryEvent>((a) => ({
      id: a.id,
      kind: "attempt",
      title: a.question.skills[0]?.skill.name ?? "Unknown skill",
      subtitle: a.question.prompt.slice(0, 80),
      correct: a.correct,
      timeTakenMs: a.timeTakenMs,
      confidence: a.confidence ?? undefined,
      createdAt: a.createdAt.toISOString(),
    })),
    ...submissions.map<HistoryEvent>((s) => ({
      id: s.id,
      kind: "submission",
      title: s.task.title,
      subtitle: `${s.passed}/${s.total} tests passed`,
      correct: s.passedAll,
      passed: s.passed,
      total: s.total,
      createdAt: s.createdAt.toISOString(),
    })),
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <>
      <div className="mb-4">
        <Link href="/profile" className="btn-ghost text-xs">
          ← Profile
        </Link>
      </div>

      <PageHeader
        eyebrow="History"
        title="Your activity"
        description={`${events.length} events from quizzes and code submissions.`}
      />

      {events.length === 0 ? (
        <GlassPanel className="p-8 text-center text-sm text-text-tertiary">
          No activity yet. Take a diagnostic or try a practice task.
        </GlassPanel>
      ) : (
        <HistoryTimeline events={events} />
      )}
    </>
  );
}
