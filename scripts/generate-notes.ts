import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY missing");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const MODEL = "gemini-2.5-flash";

const CACHE_DIR = "src/content/notes/.cache";
mkdirSync(CACHE_DIR, { recursive: true });

function safeCacheKey(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
}

async function callWithRetry(prompt: string, attempt = 1): Promise<string> {
  const MAX = 6;
  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { temperature: 0.7 },
    });
    return res.text ?? "";
  } catch (err: any) {
    const status = err?.status ?? 0;
    const retryable = status === 503 || status === 429 || status === 500;
    if (!retryable || attempt >= MAX) throw err;
    const wait = Math.min(60, 5 * 2 ** (attempt - 1));
    console.log(`   ⏳ Retry ${attempt}/${MAX} after ${wait}s (status ${status})`);
    await new Promise((r) => setTimeout(r, wait * 1000));
    return callWithRetry(prompt, attempt + 1);
  }
}

async function generateNote(
  skillName: string,
  skillDescription: string | null,
  difficulty: number,
  materialTitle: string
): Promise<string> {
  const cacheFile = join(CACHE_DIR, `${safeCacheKey(skillName)}.md`);
  if (existsSync(cacheFile)) {
    console.log(`   ♻️  Cached: ${skillName}`);
    return readFileSync(cacheFile, "utf8");
  }

  const prompt = `Write a concise, high-quality learning note in **Markdown** for this skill.

Skill: ${skillName}
Difficulty: ${difficulty}/5
Context: ${skillDescription ?? "Part of an ML Engineer learning track."}
Material title: ${materialTitle}

Structure the note with these sections:
1. A one-paragraph **Overview** — what this is and why it matters
2. **Key concepts** — a bulleted list of 3-5 core ideas
3. **Example** — one concrete example, code snippet (if applicable), or worked case
4. **Common mistakes** — 2-3 bullet points
5. **Next step** — one sentence on what to learn after this

Rules:
- Length: 250–400 words total.
- Use Markdown headings (##), bold (**), bullets (-), and fenced code blocks where relevant.
- Be specific to the actual topic — do not be generic.
- No preamble, no "Sure, here's...". Output Markdown directly.
- Do not include a top-level # title (the skill name is already shown in the UI).`;

  const text = await callWithRetry(prompt);
  writeFileSync(cacheFile, text);
  return text;
}

async function main() {
  console.log("📚 Finding note materials without a body...");

  const notes = await prisma.material.findMany({
    where: { type: "note" },
    include: { skills: { include: { skill: true } } },
    orderBy: { title: "asc" },
  });

  console.log(`   Found ${notes.length} note materials`);

  const targets = notes.filter((n) => !n.body || n.body.trim().length === 0);
  console.log(`   ${targets.length} need bodies\n`);

  if (targets.length === 0) {
    console.log("✅ Nothing to do — all notes already have bodies.");
    return;
  }

  let done = 0;
  let failed = 0;
  const t0 = Date.now();

  for (const material of targets) {
    const skill = material.skills[0]?.skill;
    if (!skill) {
      console.log(`   ⚠️  ${material.title} — no skill linked, skipping`);
      failed++;
      continue;
    }

    try {
      console.log(`📝 [${done + 1}/${targets.length}] ${skill.name}`);
      const body = await generateNote(
        skill.name,
        skill.description,
        skill.difficulty,
        material.title
      );

      await prisma.material.update({
        where: { id: material.id },
        data: { body },
      });

      done++;
    } catch (err: any) {
      console.error(`   ❌ ${skill.name}: ${err?.message ?? err}`);
      failed++;
    }
  }

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n✅ Complete in ${secs}s`);
  console.log(`   Generated: ${done}`);
  console.log(`   Failed:    ${failed}`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
