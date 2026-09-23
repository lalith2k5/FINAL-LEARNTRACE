import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { PracticeRunner } from "@/components/practice/PracticeRunner";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { requireActiveDomain } from "@/lib/domain";

export const dynamic = "force-dynamic";

type TestCase = { description: string; assertion: string };

export default async function PracticalTaskPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();
  const domain = await requireActiveDomain(user.id);

  const task = await prisma.practicalTask.findUnique({
    where: { domainId_slug: { domainId: domain.id, slug } },
    include: {
      skills: { include: { skill: true } },
      submissions: {
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!task) notFound();

  const testCases = (task.testCases as TestCase[]) ?? [];
  const priorCode = task.submissions[0]?.code ?? null;

  return (
    <>
      <div className="mb-4">
        <Link href="/practice" className="btn-ghost text-xs">
          ← All practice tasks
        </Link>
      </div>

      <PageHeader
        eyebrow="Practice"
        title={task.title}
        description={task.skills.map((ts) => ts.skill.name).join(" · ")}
      />

      <PracticeRunner
        taskId={task.id}
        taskTitle={task.title}
        description={task.description}
        difficulty={task.difficulty}
        starterCode={task.starterCode}
        solutionHint={task.solutionHint}
        testCases={testCases}
        priorCode={priorCode}
      />
    </>
  );
}
