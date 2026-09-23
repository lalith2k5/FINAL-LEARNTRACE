import { prisma } from "@/lib/db";
import { effectiveMastery } from "./decay";

type MasteryTier = "fresh" | "decaying" | "stale" | "untouched";

export type MasteryView = {
  skillId: string;
  raw: number;
  effective: number;
  lastPracticedAt: Date;
  decayRatio: number;   // 0 = no decay, 1 = fully decayed
  daysSince: number;
  tier: MasteryTier;
};

const HALF_LIFE_DAYS = 21;

// Thresholds on decayRatio (how much of the raw mastery has been lost)
const FRESH_BELOW = 0.15;      // <15% lost → Fresh
const DECAYING_BELOW = 0.4;    // 15–40% lost → Decaying; >=40% → Stale

// Only show a decay flag if the learner had actually learned the skill
const MIN_RAW_FOR_FLAG = 0.4;

function tierFor(raw: number, ratio: number): MasteryTier {
  if (raw < MIN_RAW_FOR_FLAG) return "fresh"; // not enough mastery to worry about decay
  if (ratio < FRESH_BELOW) return "fresh";
  if (ratio < DECAYING_BELOW) return "decaying";
  return "stale";
}

export type MasteryViewBundle = {
  list: MasteryView[];
  bySkillId: Map<string, MasteryView>;
  effective: (skillId: string) => number;
  raw: (skillId: string) => number;
  asEffectiveRecord: () => Record<string, number>;
  revisionQueue: MasteryView[];
};

/**
 * Load the learner's mastery in decay-aware form.
 *
 * - `effective`   = mastery after applying decay (what UI should display)
 * - `raw`         = stored value (kept in DB)
 * - `tier`        = fresh | decaying | stale | untouched
 * - `revisionQueue` = decayed skills sorted by severity (for the dashboard)
 */
export async function getMasteryView(userId: string): Promise<MasteryViewBundle> {
  const rows = await prisma.mastery.findMany({ where: { userId } });

  const list: MasteryView[] = rows.map((m) => {
    const eff = effectiveMastery(m.value, m.updatedAt, HALF_LIFE_DAYS);
    const ratio = m.value > 0 ? Math.max(0, Math.min(1, 1 - eff / m.value)) : 0;
    const days = Math.max(
      0,
      (Date.now() - m.updatedAt.getTime()) / 86_400_000
    );

    return {
      skillId: m.skillId,
      raw: m.value,
      effective: eff,
      lastPracticedAt: m.updatedAt,
      decayRatio: ratio,
      daysSince: days,
      tier: tierFor(m.value, ratio),
    };
  });

  const bySkillId = new Map(list.map((v) => [v.skillId, v]));

  function effective(skillId: string): number {
    return bySkillId.get(skillId)?.effective ?? 0;
  }

  function raw(skillId: string): number {
    return bySkillId.get(skillId)?.raw ?? 0;
  }

  function asEffectiveRecord(): Record<string, number> {
    const record: Record<string, number> = {};
    for (const v of list) record[v.skillId] = v.effective;
    return record;
  }

  const revisionQueue = list
    .filter((v) => v.tier === "decaying" || v.tier === "stale")
    .sort((a, b) => b.decayRatio - a.decayRatio);

  return { list, bySkillId, effective, raw, asEffectiveRecord, revisionQueue };
}
