import { prisma } from "@/lib/db";
import { getMasteryView } from "./view";

export type SkillEvidence = {
  skillId: string;
  skillName: string;
  theory: number;          // 0..1 — from quiz attempts
  practical: number;       // 0..1 — from code submissions
  practicalAttempts: number;
  practicalPassed: number;
  combined: number;        // 0..1 — weighted merge
  verified: boolean;       // both ≥ threshold
};

const THEORY_WEIGHT = 0.6;
const PRACTICAL_WEIGHT = 0.4;
const VERIFIED_THRESHOLD = 0.75;

/**
 * Compute a full evidence profile for a single skill:
 * - Theory from effective mastery (decay-aware)
 * - Practical from the learner's best submission per task mapped to this skill
 */
export async function getSkillEvidence(
  userId: string,
  skillId: string
): Promise<SkillEvidence> {
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
  });

  if (!skill) {
    return {
      skillId,
      skillName: "Unknown skill",
      theory: 0,
      practical: 0,
      practicalAttempts: 0,
      practicalPassed: 0,
      combined: 0,
      verified: false,
    };
  }

  // Theory: current effective mastery
  const view = await getMasteryView(userId);
  const theory = view.bySkillId.get(skillId)?.effective ?? 0;

  // Practical: find tasks mapped to this skill, then best submission per task
  const tasks = await prisma.practicalTaskSkill.findMany({
    where: { skillId },
    select: { taskId: true },
  });
  const taskIds = tasks.map((t) => t.taskId);

  let practical = 0;
  let practicalAttempts = 0;
  let practicalPassed = 0;

  if (taskIds.length > 0) {
    const subs = await prisma.practicalSubmission.findMany({
      where: { userId, taskId: { in: taskIds } },
      orderBy: { createdAt: "desc" },
    });

    practicalAttempts = subs.length;

    // Best pass-rate per task (across all submissions)
    const bestByTask = new Map<string, number>();
    for (const s of subs) {
      const rate = s.total > 0 ? s.passed / s.total : 0;
      const existing = bestByTask.get(s.taskId) ?? 0;
      if (rate > existing) bestByTask.set(s.taskId, rate);
      if (s.passedAll) practicalPassed++;
    }

    if (bestByTask.size > 0) {
      const sum = Array.from(bestByTask.values()).reduce((a, b) => a + b, 0);
      practical = sum / bestByTask.size; // average across tasks
    }
  }

  // Combined: weighted merge
  const combined = theory * THEORY_WEIGHT + practical * PRACTICAL_WEIGHT;

  const verified =
    theory >= VERIFIED_THRESHOLD && practical >= VERIFIED_THRESHOLD;

  return {
    skillId,
    skillName: skill.name,
    theory,
    practical,
    practicalAttempts,
    practicalPassed,
    combined,
    verified,
  };
}

/**
 * Batch version — for a list of skills, compute evidence for each in parallel.
 */
async function getBatchEvidence(
  userId: string,
  skillIds: string[]
): Promise<SkillEvidence[]> {
  const results = await Promise.all(
    skillIds.map((id) => getSkillEvidence(userId, id))
  );
  return results;
}

/**
 * Get the set of skill IDs in a domain that are fully verified
 * (theory AND practical both ≥ threshold).
 */
export async function getVerifiedSkills(
  userId: string,
  domainId: string
): Promise<Set<string>> {
  const skills = await prisma.skill.findMany({
    where: { domainId },
    select: { id: true },
  });

  const evidences = await getBatchEvidence(
    userId,
    skills.map((s) => s.id)
  );

  return new Set(
    evidences.filter((e) => e.verified).map((e) => e.skillId)
  );
}

/**
 * Return a map: skillId → evidence. Useful for badges in list views.
 */
export async function getEvidenceMap(
  userId: string,
  domainId: string
): Promise<Map<string, SkillEvidence>> {
  const skills = await prisma.skill.findMany({
    where: { domainId },
    select: { id: true },
  });

  const evidences = await getBatchEvidence(
    userId,
    skills.map((s) => s.id)
  );

  return new Map(evidences.map((e) => [e.skillId, e]));
}
