import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { QuizRunner } from "@/components/assessment/QuizRunner";
import { requireUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function AssessmentSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const user = await requireUser();

  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
  });
  if (!session || session.userId !== user.id) notFound();

  return <QuizRunner sessionId={session.id} sessionKind={session.kind} />;
}
