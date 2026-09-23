"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { requireActiveDomain } from "@/lib/domain";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const QUESTIONS_PER_SKILL = 5;
const DIAGNOSTIC_TOTAL = 15;

/**
 * Start a new assessment session.
 * - No skills → balanced diagnostic (15 questions across all difficulties)
 * - skills[]  → focused quiz (up to 5 questions per selected skill)
 */
export async function startAssessment(skillIds?: string[]) {
  const user = await requireUser();
  const domain = await requireActiveDomain(user.id);

  const all = await prisma.question.findMany({
    where: { domainId: domain.id },
    include: { skills: true },
  });

  if (all.length === 0) {
    throw new Error("No questions in this domain yet");
  }

  let finalIds: string[];
  let kind: string;

  const focused = skillIds && skillIds.length > 0;

  if (focused) {
    kind = "focused";

    // For each selected skill, take up to 5 questions
    const picked: typeof all = [];
    const used = new Set<string>();

    for (const skillId of skillIds.slice(0, 3)) {
      const skillQuestions = all.filter((q) =>
        q.skills.some((qs) => qs.skillId === skillId)
      );
      const pool = shuffle(skillQuestions.filter((q) => !used.has(q.id)));
      const chosen = pool.slice(0, QUESTIONS_PER_SKILL);
      for (const q of chosen) {
        used.add(q.id);
        picked.push(q);
      }
    }

    finalIds = shuffle(picked).map((q) => q.id);
  } else {
    kind = "diagnostic";

    // Balance across difficulty levels: up to 3 per level
    const byDiff = new Map<number, typeof all>();
    for (const q of all) {
      const list = byDiff.get(q.difficulty) ?? [];
      list.push(q);
      byDiff.set(q.difficulty, list);
    }

    const picked: typeof all = [];
    for (let d = 1; d <= 5; d++) {
      const pool = shuffle(byDiff.get(d) ?? []);
      picked.push(...pool.slice(0, 3));
    }

    let finalList = picked;
    if (finalList.length < DIAGNOSTIC_TOTAL) {
      const usedIds = new Set(finalList.map((q) => q.id));
      const remaining = shuffle(
        all.filter((q) => !usedIds.has(q.id))
      ).slice(0, DIAGNOSTIC_TOTAL - finalList.length);
      finalList = [...finalList, ...remaining];
    }

    finalIds = shuffle(finalList.slice(0, DIAGNOSTIC_TOTAL)).map((q) => q.id);
  }

  const session = await prisma.assessmentSession.create({
    data: {
      userId: user.id,
      domainId: domain.id,
      kind,
      questionIds: finalIds,
    },
  });

  redirect(`/assessment/${session.id}`);
}
