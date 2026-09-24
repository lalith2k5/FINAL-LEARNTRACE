import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const TOPUP = [
  {
    skillSlug: "deep-learning-fundamentals",
    difficulty: 4,
    prompt: "What is the main purpose of a loss function in neural network training?",
    options: [
      { id: "a", text: "Initialize weights" },
      { id: "b", text: "Quantify how far predictions are from targets so gradients can be computed" },
      { id: "c", text: "Select the optimizer" },
      { id: "d", text: "Reduce overfitting directly" },
    ],
    correctId: "b",
    explanation: "The loss is the scalar objective backprop differentiates. Its choice (MSE, cross-entropy) shapes what the model optimizes.",
  },
  {
    skillSlug: "model-optimization-and-quantization",
    difficulty: 5,
    prompt: "What does INT8 quantization reduce?",
    options: [
      { id: "a", text: "The number of layers" },
      { id: "b", text: "The bit-width of weights and activations, shrinking memory and speeding inference" },
      { id: "c", text: "The learning rate" },
      { id: "d", text: "The batch size" },
    ],
    correctId: "b",
    explanation: "INT8 uses 8 bits per value vs 32 for FP32 — 4× less memory and faster integer math on most hardware.",
  },
  {
    skillSlug: "transformers-and-attention",
    difficulty: 4,
    prompt: "Why does the Transformer need positional encodings?",
    options: [
      { id: "a", text: "To normalize activations" },
      { id: "b", text: "Self-attention is permutation-invariant, so token order isn't captured otherwise" },
      { id: "c", text: "To reduce parameters" },
      { id: "d", text: "To speed up training" },
    ],
    correctId: "b",
    explanation: "Without positional info, the model sees an unordered bag of tokens. Positional encodings inject order awareness.",
  },
];

async function main() {
  console.log("🔧 ML Engineer question top-up\n");

  const domain = await prisma.domain.findUnique({
    where: { slug: "ml-engineer" },
  });
  if (!domain) {
    console.error("❌ ml-engineer domain not found");
    process.exit(1);
  }

  let created = 0;
  for (const t of TOPUP) {
    const skill = await prisma.skill.findUnique({
      where: { domainId_slug: { domainId: domain.id, slug: t.skillSlug } },
    });
    if (!skill) {
      console.log(`   ⚠️  Skill not found: ${t.skillSlug}`);
      continue;
    }

    const existing = await prisma.question.findFirst({
      where: { domainId: domain.id, prompt: t.prompt },
    });
    if (existing) {
      console.log(`   ♻️  Already exists: ${t.skillSlug}`);
      continue;
    }

    const q = await prisma.question.create({
      data: {
        domainId: domain.id,
        prompt: t.prompt,
        options: t.options,
        correctId: t.correctId,
        explanation: t.explanation,
        difficulty: t.difficulty,
      },
    });
    await prisma.questionSkill.create({
      data: { questionId: q.id, skillId: skill.id, weight: 1.0 },
    });
    console.log(`   ✅ ${t.skillSlug}`);
    created++;
  }
  console.log(`\n📊 Created ${created}`);
}

main()
  .catch((e) => { console.error("❌", e?.message ?? e); process.exit(1); })
  .finally(() => prisma.$disconnect());
