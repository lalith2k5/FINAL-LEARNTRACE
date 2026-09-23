import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/user";
import { updateMastery } from "@/lib/mastery/engine";

const Schema = z.object({
  sessionId: z.string(),
  questionId: z.string(),
  selectedOptionId: z.string(),
  timeTakenMs: z.number().int().nonnegative(),
  confidence: z.number().int().min(1).max(5),
});

const EXPECTED_MS = 30_000;

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { sessionId, questionId, selectedOptionId, timeTakenMs, confidence } =
    parsed.data;

  const user = await requireUserApi();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
  });
  if (!session || session.userId !== user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { skills: { include: { skill: true } } },
  });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const correct = question.correctId === selectedOptionId;

    // Save attempt
  await prisma.attempt.create({
    data: {
      userId: user.id,
      questionId: question.id,
      sessionId: session.id,
      correct,
      selectedOptionId,
      timeTakenMs,
      confidence,
      attemptNo: 1,
    },
  });

  // Update mastery for each linked skill
  for (const qs of question.skills) {
    const current = await prisma.mastery.findUnique({
      where: {
        userId_skillId: { userId: user.id, skillId: qs.skillId },
      },
    });
        const prior = current?.value ?? 0.5; // cold-start prior (neutral)

    const next = updateMastery(prior, {
      correct,
      difficulty: question.difficulty,
      timeTakenMs,
      expectedMs: EXPECTED_MS,
      confidence,
      attemptNo: 1,
      skillWeight: qs.weight,
    });

    const historyEntry = { t: new Date().toISOString(), v: next };
    const existingHistory = Array.isArray(current?.history)
      ? (current!.history as unknown as unknown[])
      : [];

    await prisma.mastery.upsert({
      where: {
        userId_skillId: { userId: user.id, skillId: qs.skillId },
      },
      update: {
        value: next,
        confidence: (current?.confidence ?? 0) + 1,
        history: [...existingHistory, historyEntry] as never,
      },
      create: {
        userId: user.id,
        skillId: qs.skillId,
        value: next,
        confidence: 1,
        history: [historyEntry] as never,
      },
    });
  }

  const primarySkill = question.skills[0]?.skill;
  const masteryAfter = primarySkill
    ? await prisma.mastery.findUnique({
        where: {
          userId_skillId: { userId: user.id, skillId: primarySkill.id },
        },
      })
    : null;

  return NextResponse.json({
    correct,
    correctId: question.correctId,
    explanation: question.explanation,
    skillName: primarySkill?.name ?? "Unknown skill",
    currentMastery: masteryAfter?.value ?? 0.3,
    difficulty: question.difficulty,
    userAnswer: selectedOptionId,
    correctAnswer: question.correctId,
    questionText: question.prompt,
  });
}
