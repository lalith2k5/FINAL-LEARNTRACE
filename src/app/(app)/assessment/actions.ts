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
const DIAGNOSTIC_MIN = 15;
const DIAGNOSTIC_MAX = 60;
const DIAGNOSTIC_PER_SKILL_TARGET = 2;

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

    // Group questions by primary skill (first linked skill)
    const bySkill = new Map<string, typeof all>();
    for (const q of all) {
      const primary = q.skills[0]?.skillId;
      if (!primary) continue;
      const list = bySkill.get(primary) ?? [];
      list.push(q);
      bySkill.set(primary, list);
    }

    const skillCount = bySkill.size;
    const target = Math.min(
      DIAGNOSTIC_MAX,
      Math.max(
        DIAGNOSTIC_MIN,
        skillCount * DIAGNOSTIC_PER_SKILL_TARGET
      )
    );

    const picked: typeof all = [];
    const used = new Set<string>();

    // Round 1: 1 question per skill (spread evenly)
    for (const [_, pool] of bySkill) {
      const s = shuffle(pool.filter((q) => !used.has(q.id)));
      if (s[0]) {
        used.add(s[0].id);
        picked.push(s[0]);
      }
    }

    // Round 2: 2nd question per skill (fills coverage up to target)
    if (picked.length < target) {
      for (const [_, pool] of bySkill) {
        if (picked.length >= target) break;
        const s = shuffle(pool.filter((q) => !used.has(q.id)));
        if (s[0]) {
          used.add(s[0].id);
          picked.push(s[0]);
        }
      }
    }

    // Round 3: fill the rest by difficulty balance if still under target
    if (picked.length < target) {
      const byDiff = new Map<number, typeof all>();
      for (const q of all) {
        if (used.has(q.id)) continue;
        const list = byDiff.get(q.difficulty) ?? [];
        list.push(q);
        byDiff.set(q.difficulty, list);
      }
      const order = [1, 2, 3, 4, 5];
      let cursor = 0;
      while (picked.length < target) {
        const d = order[cursor % order.length];
        const pool = byDiff.get(d) ?? [];
        const next = pool.shift();
        if (next) {
          used.add(next.id);
          picked.push(next);
        }
        cursor++;
        const exhausted = order.every((dd) => (byDiff.get(dd) ?? []).length === 0);
        if (exhausted) break;
      }
    }

    finalIds = shuffle(picked.slice(0, target)).map((q) => q.id);
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
