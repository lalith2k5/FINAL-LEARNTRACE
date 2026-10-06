import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserApi } from "@/lib/user";
import { prisma } from "@/lib/db";
import { analyzeMisconception } from "@/lib/ai/misconception";

const Schema = z.object({
  attemptId: z.string(),
  justification: z.string().min(1).max(600),
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

  const { attemptId, justification } = parsed.data;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      question: {
        include: { skills: { include: { skill: true } } },
      },
    },
  });

  if (!attempt || attempt.userId !== user.id) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  if (attempt.correct) {
    return NextResponse.json(
      { error: "Attempt was correct — nothing to analyze" },
      { status: 400 }
    );
  }

  const q = attempt.question;
  const options = q.options as { id: string; text: string }[];
  const selected = options.find((o) => o.id === attempt.selectedOptionId);
  const correct = options.find((o) => o.id === q.correctId);
  const skillName = q.skills[0]?.skill.name ?? "Unknown skill";

  try {
    const analysis = await analyzeMisconception({
      question: q.prompt,
      selectedOptionText: selected?.text ?? "?",
      correctOptionText: correct?.text ?? "?",
      skillName,
      justification,
    });

    await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        justification,
        misconceptionJson: analysis as never,
      },
    });

    return NextResponse.json({ ok: true, analysis });
  } catch (err) {
    console.error(
      "Misconception analysis failed:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Analysis failed — try again later." },
      { status: 500 }
    );
  }
}
