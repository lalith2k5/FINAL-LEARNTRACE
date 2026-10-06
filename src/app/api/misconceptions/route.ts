import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/user";
import {
  detectMisconceptions,
  type MisconceptionAttempt,
} from "@/lib/mastery/misconceptions";

/**
 * GET /api/misconceptions?domainId=...
 * Returns recurring misconception patterns for the signed-in user.
 */
export async function GET(req: Request) {
  const user = await requireUserApi();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const domainId = searchParams.get("domainId");

  // Load wrong attempts with their question + option data
  const recentAttempts = await prisma.attempt.findMany({
    where: {
      userId: user.id,
      selectedOptionId: { not: null },
      question: domainId ? { domainId } : undefined,
    },
    include: {
      question: {
        include: {
          skills: { include: { skill: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  // Flatten to the engine's input shape — one attempt per question, using
  // the *first* skill of each question for grouping.
  const flattened: MisconceptionAttempt[] = [];
  for (const a of recentAttempts) {
    const primarySkill = a.question.skills[0]?.skill;
    if (!primarySkill) continue;

    flattened.push({
      skillId: primarySkill.id,
      skillName: primarySkill.name,
      questionId: a.question.id,
      questionPrompt: a.question.prompt,
      correct: a.correct,
      selectedOptionId: a.selectedOptionId,
      correctOptionId: a.question.correctId,
      options: a.question.options as { id: string; text: string }[],
      confidence: a.confidence,
      justification: a.justification,
      misconceptionJson: a.misconceptionJson as
        | {
            category?: string;
            misconception?: string;
            corrective?: string;
            confidence?: number;
          }
        | null
        | undefined,
      createdAt: a.createdAt,
    });
  }

  const misconceptions = detectMisconceptions(flattened);

  return NextResponse.json({
    count: misconceptions.length,
    misconceptions,
  });
}
