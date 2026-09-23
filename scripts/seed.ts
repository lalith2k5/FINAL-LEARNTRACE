import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();

type Skill = {
  slug: string;
  name: string;
  description?: string;
  difficulty: number;
};

type Prereq = {
  parentSlug: string;
  childSlug: string;
  weight: number;
};

type Question = {
  prompt: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation?: string;
  difficulty: number;
  skillSlugs: string[];
};

type Material = {
  title: string;
  type: string;
  url?: string;
  skillSlugs: string[];
};

type ContentFile = {
  domain: { slug: string; name: string; description: string };
  skills: Skill[];
  prerequisites: Prereq[];
  questions: Question[];
  materials: Material[];
};

function hasCycle(skillSlugs: string[], edges: Prereq[]): boolean {
  const adj = new Map<string, string[]>();
  for (const s of skillSlugs) adj.set(s, []);
  for (const e of edges) adj.get(e.parentSlug)?.push(e.childSlug);

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  for (const s of skillSlugs) color.set(s, WHITE);

  function dfs(u: string): boolean {
    color.set(u, GRAY);
    for (const v of adj.get(u) ?? []) {
      if (color.get(v) === GRAY) return true;
      if (color.get(v) === WHITE && dfs(v)) return true;
    }
    color.set(u, BLACK);
    return false;
  }
  for (const s of skillSlugs) {
    if (color.get(s) === WHITE && dfs(s)) return true;
  }
  return false;
}

async function main() {
  const raw = readFileSync("src/content/domains/ml-engineer.json", "utf8");
  const content: ContentFile = JSON.parse(raw);

  console.log(`📖 Loaded ${content.skills.length} skills, ${content.prerequisites.length} prereqs, ${content.questions.length} questions, ${content.materials.length} materials`);

  // --- Validate DAG ---
  const skillSlugs = content.skills.map((s) => s.slug);
  if (hasCycle(skillSlugs, content.prerequisites)) {
    console.error("❌ Prerequisite graph has a cycle. Fix the content file first.");
    process.exit(1);
  }
  console.log("✓ Prerequisite graph is a valid DAG");

  // --- Domain ---
  const domain = await prisma.domain.upsert({
    where: { slug: content.domain.slug },
    update: {
      name: content.domain.name,
      description: content.domain.description,
    },
    create: {
      slug: content.domain.slug,
      name: content.domain.name,
      description: content.domain.description,
    },
  });
  console.log(`✓ Domain: ${domain.name} (${domain.id})`);

  // --- Skills ---
  const slugToId = new Map<string, string>();
  for (const s of content.skills) {
    const skill = await prisma.skill.upsert({
      where: { domainId_slug: { domainId: domain.id, slug: s.slug } },
      update: {
        name: s.name,
        description: s.description ?? null,
        difficulty: s.difficulty,
      },
      create: {
        domainId: domain.id,
        slug: s.slug,
        name: s.name,
        description: s.description ?? null,
        difficulty: s.difficulty,
      },
    });
    slugToId.set(s.slug, skill.id);
  }
  console.log(`✓ Inserted ${slugToId.size} skills`);

  // --- Prerequisites ---
  let prereqCount = 0;
  let missingPrereqs = 0;
  for (const p of content.prerequisites) {
    const parentId = slugToId.get(p.parentSlug);
    const childId = slugToId.get(p.childSlug);
    if (!parentId || !childId) {
      missingPrereqs++;
      continue;
    }
    await prisma.prerequisite.upsert({
      where: { parentId_childId: { parentId, childId } },
      update: { weight: p.weight },
      create: { parentId, childId, weight: p.weight },
    });
    prereqCount++;
  }
  console.log(`✓ Inserted ${prereqCount} prerequisites${missingPrereqs ? ` (skipped ${missingPrereqs} with unknown slugs)` : ""}`);

  // --- Questions ---
  // Wipe existing questions for this domain to avoid duplicates on re-seed
  await prisma.questionSkill.deleteMany({
    where: { question: { domainId: domain.id } },
  });
  await prisma.question.deleteMany({ where: { domainId: domain.id } });

  let qCount = 0;
  let qSkipped = 0;
  for (const q of content.questions) {
    const validSkillSlugs = q.skillSlugs.filter((s) => slugToId.has(s));
    if (validSkillSlugs.length === 0) {
      qSkipped++;
      continue;
    }
    const created = await prisma.question.create({
      data: {
        domainId: domain.id,
        prompt: q.prompt,
        options: q.options,
        correctId: q.correctId,
        explanation: q.explanation ?? null,
        difficulty: q.difficulty,
      },
    });
    for (const slug of validSkillSlugs) {
      await prisma.questionSkill.create({
        data: { questionId: created.id, skillId: slugToId.get(slug)! },
      });
    }
    qCount++;
  }
  console.log(`✓ Inserted ${qCount} questions${qSkipped ? ` (skipped ${qSkipped})` : ""}`);

  // --- Materials ---
  await prisma.materialSkill.deleteMany({
    where: { material: { domainId: domain.id } },
  });
  await prisma.material.deleteMany({ where: { domainId: domain.id } });

  let mCount = 0;
  let mSkipped = 0;
  for (const m of content.materials) {
    const validSkillSlugs = m.skillSlugs.filter((s) => slugToId.has(s));
    if (validSkillSlugs.length === 0) {
      mSkipped++;
      continue;
    }
    const created = await prisma.material.create({
      data: {
        domainId: domain.id,
        title: m.title,
        type: m.type,
        url: m.url ?? null,
      },
    });
    for (const slug of validSkillSlugs) {
      await prisma.materialSkill.create({
        data: { materialId: created.id, skillId: slugToId.get(slug)! },
      });
    }
    mCount++;
  }
  console.log(`✓ Inserted ${mCount} materials${mSkipped ? ` (skipped ${mSkipped})` : ""}`);

  // --- Summary ---
  const [skillTotal, prereqTotal, qTotal, mTotal] = await Promise.all([
    prisma.skill.count({ where: { domainId: domain.id } }),
    prisma.prerequisite.count({
      where: { parent: { domainId: domain.id } },
    }),
    prisma.question.count({ where: { domainId: domain.id } }),
    prisma.material.count({ where: { domainId: domain.id } }),
  ]);

  console.log("\n🎉 Seed complete:");
  console.log(`   Skills:        ${skillTotal}`);
  console.log(`   Prereqs:       ${prereqTotal}`);
  console.log(`   Questions:     ${qTotal}`);
  console.log(`   Materials:     ${mTotal}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
