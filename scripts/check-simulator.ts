import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { simulate } from "../src/lib/mastery/simulate";
import type { Edge } from "../src/lib/graph/dag";

const prisma = new PrismaClient();

async function main() {
  const domain = await prisma.domain.findUnique({
    where: { slug: "ml-engineer" },
  });
  if (!domain) { console.error("domain missing"); process.exit(1); }

  const skills = await prisma.skill.findMany({
    where: { domainId: domain.id },
  });
  const prereqs = await prisma.prerequisite.findMany({
    where: { parent: { domainId: domain.id } },
  });
  const edges: Edge[] = prereqs.map((p) => ({
    parentId: p.parentId,
    childId: p.childId,
  }));

  const byId = new Map(skills.map((s) => [s.id, s]));

  // Pick a skill with at least 2 downstream children
  const childCount = new Map<string, number>();
  for (const e of edges) {
    childCount.set(e.parentId, (childCount.get(e.parentId) ?? 0) + 1);
  }
  const target = skills
    .filter((s) => (childCount.get(s.id) ?? 0) >= 2)
    .sort((a, b) => (childCount.get(b.id) ?? 0) - (childCount.get(a.id) ?? 0))[0];

  if (!target) { console.error("no multi-child skill"); process.exit(1); }

  console.log(`\n🎯 Target skill: ${target.name} (${childCount.get(target.id)} direct children)\n`);

  const graph = { skillIds: skills.map((s) => s.id), edges };
  const goalIds = new Set(
    [...skills].sort((a, b) => b.difficulty - a.difficulty).slice(0, 3).map((s) => s.id)
  );

  // Baseline mastery: everything at 0.6 except the target at 0.6 too
  const mastery: Record<string, number> = {};
  for (const s of skills) mastery[s.id] = 0.6;

  // Scenario 1: SKIP
  const skip = simulate({
    skillId: target.id,
    mode: "skip",
    mastery,
    graph,
    goalSkillIds: goalIds,
    targetMastery: 0.75,
  });
  console.log("── SKIP ──");
  console.log(`   Affected skills:    ${skip.affected.length}`);
  console.log(`   Readiness before:   ${(skip.goalReadinessBefore * 100).toFixed(1)}%`);
  console.log(`   Readiness after:    ${(skip.goalReadinessAfter * 100).toFixed(1)}%`);
  console.log(`   Delta:              ${(skip.readinessDelta * 100).toFixed(1)} pts`);
  console.log(`   Summary:            ${skip.summary.skillsRegressed} regressed, ${skip.summary.skillsImproved} improved`);
  console.log(`   Top 3 affected:`);
  for (const a of skip.affected.slice(0, 3)) {
    console.log(`     ${byId.get(a.id)?.name ?? a.id}: ${(a.before*100).toFixed(0)}% → ${(a.after*100).toFixed(0)}% (${(a.delta*100).toFixed(1)})`);
  }

  // Scenario 2: IMPROVE
  const improve = simulate({
    skillId: target.id,
    mode: "improve",
    targetValue: 0.9,
    mastery,
    graph,
    goalSkillIds: goalIds,
    targetMastery: 0.75,
  });
  console.log("\n── IMPROVE to 90% ──");
  console.log(`   Affected skills:    ${improve.affected.length}`);
  console.log(`   Readiness before:   ${(improve.goalReadinessBefore * 100).toFixed(1)}%`);
  console.log(`   Readiness after:    ${(improve.goalReadinessAfter * 100).toFixed(1)}%`);
  console.log(`   Delta:              ${(improve.readinessDelta * 100).toFixed(1)} pts`);
  console.log(`   Summary:            ${improve.summary.skillsRegressed} regressed, ${improve.summary.skillsImproved} improved`);
  console.log(`   Top 3 affected:`);
  for (const a of improve.affected.slice(0, 3)) {
    console.log(`     ${byId.get(a.id)?.name ?? a.id}: ${(a.before*100).toFixed(0)}% → ${(a.after*100).toFixed(0)}% (${(a.delta*100).toFixed(1)})`);
  }

  // Sanity assertions
  console.log("\n── ASSERTIONS ──");
  const checks: [string, boolean][] = [
    ["skip produces negative delta", skip.readinessDelta <= 0],
    ["improve produces positive delta", improve.readinessDelta >= 0],
    ["skip regresses at least one skill", skip.summary.skillsRegressed >= 1],
    ["improve improves at least one skill", improve.summary.skillsImproved >= 1],
    ["skip affects target skill", skip.affected.some((a) => a.id === target.id)],
    ["improve affects target skill", improve.affected.some((a) => a.id === target.id)],
  ];
  let pass = 0;
  for (const [label, ok] of checks) {
    console.log(`   ${ok ? "✓" : "✗"} ${label}`);
    if (ok) pass++;
  }
  console.log(`\n   ${pass}/${checks.length} passed`);
}

main()
  .catch((e) => { console.error("❌", e?.message ?? e); process.exit(1); })
  .finally(() => prisma.$disconnect());
