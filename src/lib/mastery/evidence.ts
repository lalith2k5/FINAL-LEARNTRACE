import { prisma } from "@/lib/db";
import { getMasteryView } from "./view";

export type SkillEvidence = {
  skillId: string;
  skillName: string;
  theory: number;
  practical: number;
  practicalAttempts: number;
  practicalPassed: number;
  hasPracticalTasks: boolean;
  combined: number;
  verified: boolean;
};

const THEORY_WEIGHT = 0.6;
const PRACTICAL_WEIGHT = 0.4;
const VERIFIED_THRESHOLD = 0.75;

/**
 * Compute a full evidence profile for a single skill.
 *
 * A skill is verified when:
 *   - theory >= threshold, AND
 *   - practical >= threshold OR the skill has no practical tasks mapped.
 *
 * The second clause keeps the completion gate reachable in domains where
 * coverage is sparse — a learner shouldn't be blocked from verifying a
 * skill that has no practical content.
 */
export async function getSkillEvidence(
  userId: string,
  skillId: string,
  extra?: { taskId: string; passed: number; total: number }
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
      hasPracticalTasks: false,
      combined: 0,
      verified: false,
    };
  }

  const view = await getMasteryView(userId);
  const theory = view.bySkillId.get(skillId)?.effective ?? 0;

  const tasks = await prisma.practicalTaskSkill.findMany({
    where: { skillId },
    select: { taskId: true },
  });
  const taskIds = tasks.map((t) => t.taskId);
  const hasPracticalTasks = taskIds.length > 0;

  let practical = 0;
  let practicalAttempts = 0;
  let practicalPassed = 0;

  if (hasPracticalTasks) {
    const subs = await prisma.practicalSubmission.findMany({
      where: { userId, taskId: { in: taskIds } },
      orderBy: { createdAt: "desc" },
    });

    const subsWithExtra: {
      taskId: string;
      passed: number;
      total: number;
      passedAll: boolean;
    }[] = subs.map((row) => ({
      taskId: row.taskId,
      passed: row.passed,
      total: row.total,
      passedAll: row.passedAll,
    }));
    if (extra && taskIds.includes(extra.taskId)) {
      subsWithExtra.push({
        taskId: extra.taskId,
        passed: extra.passed,
        total: extra.total,
        passedAll: extra.total > 0 && extra.passed === extra.total,
      });
    }

    practicalAttempts = subsWithExtra.length;

    const bestByTask = new Map<string, number>();
    for (const row of subsWithExtra) {
      const rate = row.total > 0 ? row.passed / row.total : 0;
      const existing = bestByTask.get(row.taskId) ?? 0;
      if (rate > existing) bestByTask.set(row.taskId, rate);
      if (row.passedAll) practicalPassed++;
    }

    if (bestByTask.size > 0) {
      const sum = Array.from(bestByTask.values()).reduce((a, b) => a + b, 0);
      practical = sum / bestByTask.size;
    }
  }

  const combined = theory * THEORY_WEIGHT + practical * PRACTICAL_WEIGHT;

  const theoryOk = theory >= VERIFIED_THRESHOLD;
  const practicalOk = practical >= VERIFIED_THRESHOLD;
  const verified = theoryOk && (practicalOk || !hasPracticalTasks);

  return {
    skillId,
    skillName: skill.name,
    theory,
    practical,
    practicalAttempts,
    practicalPassed,
    hasPracticalTasks,
    combined,
    verified,
  };
}

async function getBatchEvidence(
  userId: string,
  skillIds: string[]
): Promise<SkillEvidence[]> {
  const results = await Promise.all(
    skillIds.map((id) => getSkillEvidence(userId, id))
  );
  return results;
}

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
