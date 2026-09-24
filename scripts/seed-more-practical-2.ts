import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type TestCase = { description: string; assertion: string };

type PracticalSeed = {
  slug: string;
  title: string;
  description: string;
  difficulty: number;
  starterCode: string;
  solutionHint: string;
  skillSlugs: string[];
  testCases: TestCase[];
};

const TASKS: PracticalSeed[] = [
  {
    slug: "sigmoid",
    title: "Sigmoid Function",
    description:
      "Write `sigmoid(x)` that returns 1 / (1 + e^(-x)). Handle large negative inputs without overflowing — use math.exp carefully or clip.",
    difficulty: 2,
    starterCode: `import math

def sigmoid(x):
    # Return 1 / (1 + e^(-x))
    pass
`,
    solutionHint:
      "The trick: if x >= 0, compute 1 / (1 + math.exp(-x)). If x < 0, compute math.exp(x) / (1 + math.exp(x)). This avoids overflow for large |x|.",
    skillSlugs: ["deep-learning-fundamentals"],
    testCases: [
      { description: "sigmoid(0) returns 0.5", assertion: "assert abs(sigmoid(0) - 0.5) < 1e-9" },
      { description: "sigmoid(large positive) ≈ 1", assertion: "assert abs(sigmoid(50) - 1.0) < 1e-9" },
      { description: "sigmoid(large negative) ≈ 0", assertion: "assert abs(sigmoid(-50) - 0.0) < 1e-9" },
      { description: "sigmoid(2) ≈ 0.8808", assertion: "assert abs(sigmoid(2) - 0.8807970779) < 1e-6" },
    ],
  },
  {
    slug: "softmax",
    title: "Softmax Function",
    description:
      "Write `softmax(xs)` that converts a list of scores into a probability distribution that sums to 1. Subtract the max for numerical stability.",
    difficulty: 3,
    starterCode: `import math

def softmax(xs):
    # Return a list of probabilities summing to 1
    pass
`,
    solutionHint:
      "Subtract max(xs) before exponentiating — it prevents overflow and doesn't change the result mathematically: softmax(x) = softmax(x - c) for any constant c.",
    skillSlugs: ["deep-learning-fundamentals"],
    testCases: [
      {
        description: "softmax([1, 1, 1]) returns a uniform distribution",
        assertion: "r = softmax([1, 1, 1])\nassert all(abs(v - 1/3) < 1e-9 for v in r)",
      },
      {
        description: "softmax output sums to 1",
        assertion: "r = softmax([1, 2, 3])\nassert abs(sum(r) - 1.0) < 1e-9",
      },
      {
        description: "softmax is monotonic — larger input → larger output",
        assertion: "r = softmax([1, 2, 3])\nassert r[0] < r[1] < r[2]",
      },
      {
        description: "softmax handles large values without overflow",
        assertion: "r = softmax([1000, 1001, 1002])\nassert abs(sum(r) - 1.0) < 1e-9",
      },
    ],
  },
  {
    slug: "min-max-normalize",
    title: "Min-Max Normalization",
    description:
      "Write `normalize(xs)` that scales every value into the range [0, 1]. If all values are equal, return a list of zeros.",
    difficulty: 2,
    starterCode: `def normalize(xs):
    # Return a new list with values in [0, 1]
    pass
`,
    solutionHint:
      "lo = min(xs), hi = max(xs). Each output is (x - lo) / (hi - lo). Handle hi == lo by returning zeros.",
    skillSlugs: ["data-preprocessing"],
    testCases: [
      {
        description: "normalize([0, 5, 10]) → [0, 0.5, 1]",
        assertion: "assert normalize([0, 5, 10]) == [0.0, 0.5, 1.0]",
      },
      {
        description: "All-equal input returns zeros",
        assertion: "assert normalize([3, 3, 3]) == [0.0, 0.0, 0.0]",
      },
      {
        description: "Result always in [0, 1]",
        assertion: "r = normalize([-10, 0, 100])\nassert all(0 <= v <= 1 for v in r)",
      },
      {
        description: "Does not mutate the input list",
        assertion: "xs = [1, 2, 3]\nn = normalize(xs)\nassert xs == [1, 2, 3]",
      },
    ],
  },
  {
    slug: "standardize",
    title: "Standardization (Z-Score)",
    description:
      "Write `standardize(xs)` that returns each value transformed to (x - mean) / std. Use population std (divide by n, not n-1). If std is 0, return zeros.",
    difficulty: 3,
    starterCode: `def standardize(xs):
    # Return a list of z-scores
    pass
`,
    solutionHint:
      "mean = sum(xs) / n. variance = sum((x - mean)**2) / n. std = variance ** 0.5. Then (x - mean) / std per element.",
    skillSlugs: ["data-preprocessing"],
    testCases: [
      {
        description: "Standardized data has mean ≈ 0",
        assertion: "r = standardize([1, 2, 3, 4, 5])\nassert abs(sum(r) / len(r)) < 1e-9",
      },
      {
        description: "Standardized data has std ≈ 1",
        assertion: "r = standardize([1, 2, 3, 4, 5])\nn = len(r)\nm = sum(r) / n\nvar = sum((v - m) ** 2 for v in r) / n\nassert abs(var ** 0.5 - 1.0) < 1e-9",
      },
      {
        description: "Constant input returns zeros",
        assertion: "assert standardize([5, 5, 5]) == [0.0, 0.0, 0.0]",
      },
      {
        description: "Order is preserved",
        assertion: "r = standardize([10, 20, 30])\nassert r[0] < r[1] < r[2]",
      },
    ],
  },
  {
    slug: "accuracy",
    title: "Classification Accuracy",
    description:
      "Write `accuracy(y_true, y_pred)` that returns the fraction of predictions matching the true labels. Return 0.0 for empty input.",
    difficulty: 2,
    starterCode: `def accuracy(y_true, y_pred):
    # Return a float between 0 and 1
    pass
`,
    solutionHint:
      "Zip the two lists, count matching pairs, divide by length. Handle the empty case first.",
    skillSlugs: ["model-evaluation-metrics"],
    testCases: [
      {
        description: "Perfect predictions → 1.0",
        assertion: "assert accuracy([1, 0, 1], [1, 0, 1]) == 1.0",
      },
      {
        description: "All wrong → 0.0",
        assertion: "assert accuracy([1, 0, 1], [0, 1, 0]) == 0.0",
      },
      {
        description: "Half right → 0.5",
        assertion: "assert accuracy([1, 0, 1, 0], [1, 0, 0, 1]) == 0.5",
      },
      {
        description: "Empty input → 0.0",
        assertion: "assert accuracy([], []) == 0.0",
      },
    ],
  },
  {
    slug: "cosine-similarity",
    title: "Cosine Similarity",
    description:
      "Write `cosine_similarity(a, b)` that returns the cosine of the angle between two vectors. Return 0.0 if either vector has zero magnitude.",
    difficulty: 3,
    starterCode: `def cosine_similarity(a, b):
    # Return a float between -1 and 1
    pass
`,
    solutionHint:
      "dot = sum(x*y), norm_a = sqrt(sum(x*x)), norm_b = sqrt(sum(y*y)). Return dot / (norm_a * norm_b), guarding against zero norms.",
    skillSlugs: ["linear-algebra"],
    testCases: [
      {
        description: "Identical vectors → 1.0",
        assertion: "assert abs(cosine_similarity([1, 2, 3], [1, 2, 3]) - 1.0) < 1e-9",
      },
      {
        description: "Orthogonal vectors → 0.0",
        assertion: "assert abs(cosine_similarity([1, 0], [0, 1]) - 0.0) < 1e-9",
      },
      {
        description: "Opposite vectors → -1.0",
        assertion: "assert abs(cosine_similarity([1, 2], [-1, -2]) - (-1.0)) < 1e-9",
      },
      {
        description: "Zero vector → 0.0 (no crash)",
        assertion: "assert cosine_similarity([0, 0], [1, 2]) == 0.0",
      },
    ],
  },
];

async function main() {
  console.log("🔧 Seeding additional practical tasks...\n");

  const domain = await prisma.domain.findUnique({
    where: { slug: "ml-engineer" },
  });
  if (!domain) {
    console.error("❌ Domain 'ml-engineer' not found.");
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;
  const missingSkills = new Set<string>();

  for (const task of TASKS) {
    const skillIds: string[] = [];
    let missing = false;
    for (const slug of task.skillSlugs) {
      const skill = await prisma.skill.findUnique({
        where: { domainId_slug: { domainId: domain.id, slug } },
      });
      if (!skill) {
        missingSkills.add(slug);
        missing = true;
        break;
      }
      skillIds.push(skill.id);
    }
    if (missing) {
      skipped++;
      continue;
    }

    const existing = await prisma.practicalTask.findUnique({
      where: { domainId_slug: { domainId: domain.id, slug: task.slug } },
    });
    if (existing) {
      console.log(`   ♻️  Already exists: ${task.slug}`);
      skipped++;
      continue;
    }

    const createdTask = await prisma.practicalTask.create({
      data: {
        domainId: domain.id,
        slug: task.slug,
        title: task.title,
        description: task.description,
        language: "python",
        difficulty: task.difficulty,
        starterCode: task.starterCode,
        solutionHint: task.solutionHint,
        testCases: task.testCases as never,
      },
    });

    for (const skillId of skillIds) {
      await prisma.practicalTaskSkill.create({
        data: { taskId: createdTask.id, skillId },
      });
    }

    console.log(`   ✅ Created: ${task.title}`);
    created++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created:          ${created}`);
  console.log(`   Skipped:          ${skipped}`);
  if (missingSkills.size > 0) {
    console.log(`   Missing skills:   ${Array.from(missingSkills).join(", ")}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
