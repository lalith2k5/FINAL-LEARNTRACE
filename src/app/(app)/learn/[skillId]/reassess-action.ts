"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { requireActiveDomain } from "@/lib/domain";
import { getMasteryView } from "@/lib/mastery/view";
import { shuffle } from "@/lib/utils";

const REASSESS_QUESTIONS = 5;
const COLD_START_PRIOR = 0.5;

/**
 * Start a reassessment session for a single skill.
 * Only uses questions mapped directly to that skill.
 * If the skill has fewer than 5 questions, the session uses all available.
 * No cross-topic mixing.
 */
export async function startReassessment(skillId: string) {
  const user = await requireUser();
  const domain = await requireActiveDomain(user.id);

  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    include: {
      questions: { include: { question: true } },
    },
  });

  if (!skill || skill.domainId !== domain.id) {
    throw new Error("Skill not found in active domain");
  }

  // Ensure a mastery row exists so "before" is meaningful
  const existing = await prisma.mastery.findUnique({
    where: { userId_skillId: { userId: user.id, skillId } },
  });
  if (!existing) {
    await prisma.mastery.create({
      data: {
        userId: user.id,
        skillId,
        value: COLD_START_PRIOR,
        confidence: 0,
        history: [],
      },
    });
  }

  // Snapshot prior effective mastery
  const view = await getMasteryView(user.id);
  const prior = view.bySkillId.get(skillId)?.effective ?? COLD_START_PRIOR;

  // --- Question pool: only this skill's questions ---
  const allForSkill = skill.questions.map((qs) => qs.question);

  if (allForSkill.length === 0) {
    throw new Error("No questions available for this skill yet");
  }

  const picked = shuffle(allForSkill).slice(
    0,
    Math.min(REASSESS_QUESTIONS, allForSkill.length)
  );

  const session = await prisma.assessmentSession.create({
    data: {
      userId: user.id,
      domainId: domain.id,
      kind: `reassessment:${skillId}:${prior.toFixed(4)}`,
      questionIds: picked.map((q) => q.id),
    },
  });

  redirect(`/assessment/${session.id}`);
}
