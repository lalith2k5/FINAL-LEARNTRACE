import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/user";
import {
  pickNextDifficulty,
  startingDifficulty,
  difficultyFitScore,
  type AdaptiveAttempt,
} from "@/lib/mastery/adaptive";

const Schema = z.object({
  sessionId: z.string(),
});

export async function POST(req: Request) {
  const user = await requireUserApi();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { sessionId } = parsed.data;

  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
  });
  if (!session || session.userId !== user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // All attempts already made in this session
  const attempts = await prisma.attempt.findMany({
    where: { sessionId },
    include: { question: true },
    orderBy: { createdAt: "asc" },
  });

  // Preloaded question IDs for this session
  const preloadedIds = Array.isArray(session.questionIds)
    ? (session.questionIds as string[])
    : [];

  // Questions already served (attempted)
  const servedIds = new Set(attempts.map((a) => a.questionId));

  // Remaining questions in the session
  const remainingIds = preloadedIds.filter((id) => !servedIds.has(id));

  // --- Adaptive difficulty logic ---
  const recent: AdaptiveAttempt[] = attempts.slice(-3).map((a) => ({
    correct: a.correct,
    difficulty: a.question.difficulty,
  }));

  // Current target: the difficulty of the last served question, or a
  // starting difficulty based on the learner's primary skill mastery.
  let currentTarget: number;
  if (attempts.length > 0) {
    currentTarget = attempts[attempts.length - 1].question.difficulty;
  } else {
    // Cold start — base on mastery of the first skill in this session
    const firstSkill = await prisma.questionSkill.findFirst({
      where: { questionId: preloadedIds[0] },
    });
    if (firstSkill) {
      const m = await prisma.mastery.findUnique({
        where: {
          userId_skillId: { userId: user.id, skillId: firstSkill.skillId },
        },
      });
      currentTarget = startingDifficulty(m?.value ?? 0.3);
    } else {
      currentTarget = 3;
    }
  }

  const adaptive = pickNextDifficulty(recent, currentTarget);

  // --- Pick best-fitting remaining question ---
  // Only consider questions in this session's remaining pool
  const candidates = await prisma.question.findMany({
    where: { id: { in: remainingIds } },
    include: { skills: { include: { skill: true } } },
  });

  if (candidates.length === 0) {
    return NextResponse.json({
      done: true,
      reason: "Session complete",
    });
  }

  // Sort by how close the question difficulty is to the target.
  // Tie-break randomly so the order isn't deterministic across runs.
  const scored = candidates
    .map((q) => ({
      q,
      score: difficultyFitScore(q.difficulty, adaptive.targetDifficulty),
      tie: Math.random(),
    }))
    .sort((a, b) => a.score - b.score || a.tie - b.tie);

  const chosen = scored[0].q;

  // Return a public view of the question
  return NextResponse.json({
    done: false,
    question: {
      id: chosen.id,
      prompt: chosen.prompt,
      options: chosen.options,
      difficulty: chosen.difficulty,
      skillNames: chosen.skills.map((s) => s.skill.name),
    },
    adaptive: {
      targetDifficulty: adaptive.targetDifficulty,
      reason: adaptive.reason,
    },
    progress: {
      served: attempts.length,
      total: preloadedIds.length,
    },
  });
}
