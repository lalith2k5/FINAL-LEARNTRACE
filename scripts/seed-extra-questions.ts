import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

type SeedQ = {
  skillSlug: string;
  difficulty: number;
  prompt: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
};

const EXTRA_DIR = "src/content/extra";

async function main() {
  console.log("📚 Loading extra question chunks...\n");

  // --- Load all chunks ---
  const files = readdirSync(EXTRA_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    console.error(`❌ No JSON files found in ${EXTRA_DIR}`);
    process.exit(1);
  }

  const allQuestions: SeedQ[] = [];
  for (const f of files) {
    const data = JSON.parse(readFileSync(join(EXTRA_DIR, f), "utf8"));
    const qs: SeedQ[] = data.questions ?? [];
    console.log(`   ${f}: ${qs.length} questions`);
    allQuestions.push(...qs);
  }

  console.log(`\n   Total loaded: ${allQuestions.length} questions\n`);

  // --- Find the ML Engineer domain ---
  const domain = await prisma.domain.findUnique({
    where: { slug: "ml-engineer" },
  });
  if (!domain) {
    console.error("❌ Domain 'ml-engineer' not found");
    process.exit(1);
  }

  // --- Build slug → skill map ---
  const skills = await prisma.skill.findMany({
    where: { domainId: domain.id },
  });
  const slugToSkill = new Map(skills.map((s) => [s.slug, s]));
  console.log(`   Found ${skills.length} skills in DB\n`);

  // --- Seed ---
  let created = 0;
  let skippedDuplicate = 0;
  let skippedMissingSkill = 0;
  let skippedInvalid = 0;
  const missingSlugs = new Set<string>();
  const perSkill: Record<string, number> = {};

  for (let i = 0; i < allQuestions.length; i++) {
    const q = allQuestions[i];

    // 1. Validate the question structure
    if (
      !q.skillSlug ||
      !q.prompt ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      !q.correctId ||
      !q.explanation
    ) {
      skippedInvalid++;
      continue;
    }

    // 2. Validate correctId is one of the option ids
    if (!q.options.some((o) => o.id === q.correctId)) {
      skippedInvalid++;
      continue;
    }

    // 3. Skill must exist
    const skill = slugToSkill.get(q.skillSlug);
    if (!skill) {
      skippedMissingSkill++;
      missingSlugs.add(q.skillSlug);
      continue;
    }

    // 4. Dedupe by exact prompt
    const existing = await prisma.question.findFirst({
      where: { domainId: domain.id, prompt: q.prompt },
    });
    if (existing) {
      skippedDuplicate++;
      continue;
    }

    // 5. Create question + link ONLY to its declared skill
    const createdQ = await prisma.question.create({
      data: {
        domainId: domain.id,
        prompt: q.prompt,
        options: q.options,
        correctId: q.correctId,
        explanation: q.explanation,
        difficulty: q.difficulty,
      },
    });

    await prisma.questionSkill.create({
      data: {
        questionId: createdQ.id,
        skillId: skill.id,
        weight: 1.0,
      },
    });

    created++;
    perSkill[q.skillSlug] = (perSkill[q.skillSlug] ?? 0) + 1;

    // Progress pulse
    if ((i + 1) % 50 === 0) {
      console.log(`   ...${i + 1}/${allQuestions.length} processed (${created} created)`);
    }
  }

  // --- Summary ---
  console.log(`\n📊 Summary:`);
  console.log(`   Created:              ${created}`);
  console.log(`   Skipped (duplicate):  ${skippedDuplicate}`);
  console.log(`   Skipped (invalid):    ${skippedInvalid}`);
  console.log(`   Skipped (missing):    ${skippedMissingSkill}`);
  if (missingSlugs.size > 0) {
    console.log(`   Missing slugs:        ${Array.from(missingSlugs).join(", ")}`);
  }

  console.log(`\n📈 Per-skill additions:`);
  const sortedSlugs = Object.keys(perSkill).sort();
  for (const slug of sortedSlugs) {
    console.log(`   ${slug}: +${perSkill[slug]}`);
  }

  // --- Final: verify every skill has 5+ questions ---
  console.log(`\n🔎 Verifying per-skill question counts...\n`);
  const finalCounts = await prisma.skill.findMany({
    where: { domainId: domain.id },
    select: {
      slug: true,
      _count: { select: { questions: true } },
    },
    orderBy: { slug: "asc" },
  });

  let allGood = true;
  for (const s of finalCounts) {
    const count = s._count.questions;
    const flag = count >= 5 ? "✓" : "✗";
    if (count < 5) allGood = false;
    console.log(`   ${flag} ${s.slug}: ${count}`);
  }

  const min = Math.min(...finalCounts.map((s) => s._count.questions));
  const max = Math.max(...finalCounts.map((s) => s._count.questions));
  console.log(`\n   Range: ${min}–${max} questions per skill`);

  if (allGood) {
    console.log(`\n🎉 All skills have at least 5 questions.`);
  } else {
    console.log(`\n⚠️  Some skills still have fewer than 5 questions.`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
