import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { callJson } from "../src/lib/ai/gemini";

const prisma = new PrismaClient();
const CACHE_DIR = "src/content/generated-questions";
const TARGET_PER_SKILL = 8;
const SKILL_DELAY_MS = 4000;
const DOMAINS = [
  "backend-engineer",
  "frontend-engineer",
  "data-analyst",
  "data-scientist",
];

type GeneratedQ = {
  prompt: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  difficulty: number;
};

function cachePath(domain: string, skillSlug: string): string {
  return join(CACHE_DIR, `${domain}__${skillSlug}.json`);
}

function loadCache(domain: string, skillSlug: string): GeneratedQ[] | null {
  const p = cachePath(domain, skillSlug);
  if (!existsSync(p)) return null;
  try {
    const data = JSON.parse(readFileSync(p, "utf8"));
    return Array.isArray(data.questions) ? data.questions : null;
  } catch {
    return null;
  }
}

function saveCache(domain: string, skillSlug: string, questions: GeneratedQ[]) {
  writeFileSync(
    cachePath(domain, skillSlug),
    JSON.stringify({ questions }, null, 2)
  );
}

function isValidQ(q: unknown): q is GeneratedQ {
  if (!q || typeof q !== "object") return false;
  const x = q as any;
  return (
    typeof x.prompt === "string" &&
    x.prompt.length > 10 &&
    Array.isArray(x.options) &&
    x.options.length === 4 &&
    x.options.every(
      (o: any) => typeof o?.id === "string" && typeof o?.text === "string"
    ) &&
    typeof x.correctId === "string" &&
    x.options.some((o: any) => o.id === x.correctId) &&
    typeof x.explanation === "string" &&
    typeof x.difficulty === "number" &&
    x.difficulty >= 1 &&
    x.difficulty <= 5
  );
}

async function generateForSkill(args: {
  skillName: string;
  skillDescription: string | null;
  skillDifficulty: number;
  existingPrompts: string[];
  need: number;
}): Promise<GeneratedQ[]> {
  const { skillName, skillDescription, skillDifficulty, existingPrompts, need } = args;
  const existingList =
    existingPrompts.length > 0
      ? existingPrompts
          .slice(0, 20)
          .map((p) => `- ${p.slice(0, 120)}`)
          .join("\n")
      : "";

  const prompt = `Generate ${need} multiple-choice questions for this skill.

Skill: ${skillName}
Description: ${skillDescription ?? "N/A"}
Skill difficulty: ${skillDifficulty}/5

${existingList ? `Existing questions (DO NOT duplicate these):\n${existingList}\n` : ""}

Return ONLY valid JSON:
{
  "questions": [
    {
      "prompt": "Question text?",
      "options": [
        { "id": "a", "text": "Option A" },
        { "id": "b", "text": "Option B" },
        { "id": "c", "text": "Option C" },
        { "id": "d", "text": "Option D" }
      ],
      "correctId": "b",
      "explanation": "1-2 sentence explanation of why the correct answer is correct.",
      "difficulty": 3
    }
  ]
}

Rules:
- Exactly ${need} questions.
- Every question has exactly 4 options with ids "a", "b", "c", "d".
- correctId must be one of those ids.
- Vary difficulty from 1 to 5, appropriate to the skill.
- Test understanding, not trivia or memorization.
- No duplicate questions.
- Return JSON only, no markdown fences.`;

  const res = await callJson<{ questions: GeneratedQ[] }>(prompt, {
    temperature: 0.75,
  });
  const raw = Array.isArray(res?.questions) ? res.questions : [];
  return raw.filter(isValidQ);
}

async function main() {
  const t0 = Date.now();
  console.log(`\nContent depth pass — target ${TARGET_PER_SKILL} questions per skill\n`);

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const domainSlug of DOMAINS) {
    const domain = await prisma.domain.findUnique({ where: { slug: domainSlug } });
    if (!domain) {
      console.log(`  ✗ domain ${domainSlug} not found — skipping`);
      continue;
    }

    const skills = await prisma.skill.findMany({
      where: { domainId: domain.id },
      orderBy: { slug: "asc" },
      include: { _count: { select: { questions: true } } },
    });

    console.log(`\n━━━━ ${domainSlug} (${skills.length} skills) ━━━━`);

    for (const skill of skills) {
      const have = skill._count.questions;
      if (have >= TARGET_PER_SKILL) {
        console.log(`  ✓ ${skill.slug.padEnd(40)} ${have} Q (done)`);
        totalSkipped++;
        continue;
      }

      const need = TARGET_PER_SKILL - have;

      // Cache hit — reuse generated questions from a prior run
      const cached = loadCache(domainSlug, skill.slug);
      let generated: GeneratedQ[];

      if (cached && cached.length >= need) {
        console.log(`  ♻️  ${skill.slug.padEnd(40)} ${have} Q → cache (${cached.length})`);
        generated = cached.slice(0, need);
      } else {
        try {
          console.log(`  ⏳ ${skill.slug.padEnd(40)} ${have} Q, need ${need}...`);
          generated = await generateForSkill({
            skillName: skill.name,
            skillDescription: skill.description,
            skillDifficulty: skill.difficulty,
            existingPrompts: [],
            need,
          });
          if (generated.length === 0) {
            console.log(`     ✗ generated 0 valid — skipping`);
            totalFailed++;
            continue;
          }
          saveCache(domainSlug, skill.slug, generated);
          console.log(`     ✓ generated ${generated.length}`);
          await new Promise((r) => setTimeout(r, SKILL_DELAY_MS));
        } catch (err) {
          console.log(
            `     ✗ generation failed: ${err instanceof Error ? err.message : err}`
          );
          totalFailed++;
          continue;
        }
      }

      // Insert into DB with dedup on exact prompt
      let created = 0;
      for (const q of generated) {
        const existing = await prisma.question.findFirst({
          where: { domainId: domain.id, prompt: q.prompt },
        });
        if (existing) continue;

        const newQ = await prisma.question.create({
          data: {
            domainId: domain.id,
            prompt: q.prompt,
            options: q.options as never,
            correctId: q.correctId,
            explanation: q.explanation,
            difficulty: q.difficulty,
          },
        });
        await prisma.questionSkill.create({
          data: { questionId: newQ.id, skillId: skill.id, weight: 1.0 },
        });
        created++;
      }

      totalCreated += created;
      console.log(`     + inserted ${created} question(s)`);
    }
  }

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n══════ Done in ${secs}s ══════`);
  console.log(`  Created:       ${totalCreated}`);
  console.log(`  Skills done:   ${totalSkipped}`);
  console.log(`  Skills failed: ${totalFailed}`);
  console.log(`  Cache dir:     ${CACHE_DIR}\n`);
}

main()
  .catch((e) => {
    console.error("Fatal:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
