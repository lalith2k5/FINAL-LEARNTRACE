import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { GoogleGenAI } from "@google/genai";
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY missing");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const MODEL = "gemini-3.5-flash";

const CACHE_DIR = "src/content/domains/.cache";
mkdirSync(CACHE_DIR, { recursive: true });

// --- Retry with exponential backoff ---
async function callJson(prompt: string, attempt = 1): Promise<any> {
  const MAX = 6;
  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.7 },
    });
    const text = res.text ?? "";
    return JSON.parse(text);
  } catch (err: any) {
    const status = err?.status ?? 0;
    const isRetryable = status === 503 || status === 429 || status === 500;
    if (!isRetryable || attempt >= MAX) throw err;
    const wait = Math.min(60, 5 * 2 ** (attempt - 1)); // 5, 10, 20, 40, 60s
    console.log(`   ⏳ Retry ${attempt}/${MAX} after ${wait}s (status ${status})...`);
    await new Promise((r) => setTimeout(r, wait * 1000));
    return callJson(prompt, attempt + 1);
  }
}

// --- Cache helpers ---
function loadCache(name: string): any | null {
  const p = join(CACHE_DIR, `${name}.json`);
  if (!existsSync(p)) return null;
  try {
    const data = JSON.parse(readFileSync(p, "utf8"));
    console.log(`   ♻️  Loaded cached ${name}`);
    return data;
  } catch {
    return null;
  }
}

function saveCache(name: string, data: any) {
  writeFileSync(join(CACHE_DIR, `${name}.json`), JSON.stringify(data, null, 2));
}

// --- Stage 1: Skills + Prereqs ---
async function generateSkillsAndPrereqs() {
  const cached = loadCache("skills");
  if (cached) return cached;

  console.log("🧠 [1/3] Generating skills + prerequisites...");
  const prompt = `You are designing a knowledge graph for the learning domain "Machine Learning Engineer".

Return ONLY valid JSON with this exact shape:
{
  "skills": [
    { "slug": "python-basics", "name": "Python Basics", "description": "One sentence.", "difficulty": 1 }
  ],
  "prerequisites": [
    { "parentSlug": "python-basics", "childSlug": "python-functions", "weight": 0.8 }
  ]
}

Rules:
- Exactly 30 skills.
- Ordered from foundational to advanced: Python, math (Linear Algebra, Probability, Statistics, Calculus), data handling (NumPy, Pandas, Visualization), core ML (Regression, Classification, Trees, SVM, Clustering, PCA), evaluation, deep learning basics, deployment/MLOps.
- "difficulty" is 1 (easiest) to 5 (hardest).
- Slugs are lowercase-kebab-case, unique.
- Prerequisites MUST form a valid directed acyclic graph (no cycles).
- Every non-foundational skill should have at least one parent.
- Weight is 0.3 to 1.0.
- Total prerequisites: between 55 and 70 edges.

Return JSON only, no markdown fences.`;

  const data = await callJson(prompt);
  console.log(`   ✓ ${data.skills.length} skills, ${data.prerequisites.length} prerequisites`);
  saveCache("skills", data);
  return data;
}

// --- Stage 2: Questions ---
async function generateQuestions(skills: any[]) {
  const cached = loadCache("questions");
  if (cached) return cached;

  console.log("❓ [2/3] Generating questions...");
  const skillList = skills.map((s: any) => s.slug).join(", ");
  const prompt = `Generate 2 multiple-choice questions for EACH of these 30 ML Engineer skills:
${skillList}

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
      "explanation": "Why B is correct in one or two sentences.",
      "difficulty": 3,
      "skillSlugs": ["python-basics"]
    }
  ]
}

Rules:
- Exactly 60 questions total (2 per skill).
- Each question tests exactly one skill (use only that skill's slug in skillSlugs).
- "difficulty" is 1-5, varied per skill.
- correctId must be one of "a","b","c","d".
- Explanations must be concise and specific.
- No duplicate questions.
- Return JSON only, no markdown fences.`;

  const data = await callJson(prompt);
  console.log(`   ✓ ${data.questions.length} questions`);
  saveCache("questions", data);
  return data;
}

// --- Stage 3: Materials ---
async function generateMaterials(skills: any[]) {
  const cached = loadCache("materials");
  if (cached) return cached;

  console.log("📚 [3/3] Generating learning materials...");
  const skillList = skills.map((s: any) => s.slug).join(", ");
  const prompt = `Generate 1 learning material (note or link or video) for EACH of these 30 ML Engineer skills:
${skillList}

Return ONLY valid JSON:
{
  "materials": [
    {
      "title": "Short resource title",
      "type": "note" | "link" | "video",
      "url": "https://...",
      "skillSlugs": ["python-basics"]
    }
  ]
}

Rules:
- Exactly 30 materials (1 per skill).
- Use real, well-known, stable URLs (official docs, well-known tutorials, Wikipedia, YouTube channels like 3Blue1Brown, etc.).
- Prefer free resources.
- Return JSON only, no markdown fences.`;

  const data = await callJson(prompt);
  console.log(`   ✓ ${data.materials.length} materials`);
  saveCache("materials", data);
  return data;
}

async function main() {
  const t0 = Date.now();
  const skillsData = await generateSkillsAndPrereqs();
  const questionsData = await generateQuestions(skillsData.skills);
  const materialsData = await generateMaterials(skillsData.skills);

  const combined = {
    domain: {
      slug: "ml-engineer",
      name: "Machine Learning Engineer",
      description: "From Python fundamentals to production ML systems.",
    },
    ...skillsData,
    ...questionsData,
    ...materialsData,
  };

  const outPath = "src/content/domains/ml-engineer.json";
  writeFileSync(outPath, JSON.stringify(combined, null, 2));
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n✅ Wrote ${outPath} in ${secs}s`);
  console.log(`   Skills:        ${combined.skills.length}`);
  console.log(`   Prereqs:       ${combined.prerequisites.length}`);
  console.log(`   Questions:     ${combined.questions.length}`);
  console.log(`   Materials:     ${combined.materials.length}`);
}

main().catch((e) => {
  console.error("❌ Failed:", e.message ?? e);
  process.exit(1);
});
