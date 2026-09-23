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
    slug: "matrix-multiply",
    title: "Matrix Multiplication",
    description:
      "Write a function `matmul(A, B)` that returns the matrix product of two matrices represented as lists of lists. Assume A is m×n and B is n×p, and rows are equal length.",
    difficulty: 4,
    starterCode: `def matmul(A, B):
    # A: list of lists (m x n)
    # B: list of lists (n x p)
    # Return: list of lists (m x p)
    pass
`,
    solutionHint:
      "Triple loop. Result[i][j] = sum over k of A[i][k] * B[k][j]. Build the output with list comprehensions or nested loops.",
    skillSlugs: ["linear-algebra"],
    testCases: [
      {
        description: "2x2 · 2x2 identity returns the original matrix",
        assertion: `I = [[1, 0], [0, 1]]
M = [[3, 4], [5, 6]]
assert matmul(M, I) == M`,
      },
      {
        description: "2x2 · 2x2 known product",
        assertion: `A = [[1, 2], [3, 4]]
B = [[5, 6], [7, 8]]
assert matmul(A, B) == [[19, 22], [43, 50]]`,
      },
      {
        description: "2x3 · 3x2 gives 2x2",
        assertion: `A = [[1, 2, 3], [4, 5, 6]]
B = [[7, 8], [9, 10], [11, 12]]
assert matmul(A, B) == [[58, 64], [139, 154]]`,
      },
      {
        description: "Zero matrix multiplies to zero",
        assertion: `A = [[0, 0], [0, 0]]
B = [[1, 2], [3, 4]]
assert matmul(A, B) == [[0, 0], [0, 0]]`,
      },
    ],
  },
  {
    slug: "gradient-descent-step",
    title: "One Step of Gradient Descent",
    description:
      "Write a function `gd_step(w, X, y, lr)` that performs ONE step of gradient descent for linear regression (MSE loss). Return the updated `w`. Use the gradient of MSE: grad = (2/n) · Xᵀ·(X·w − y).",
    difficulty: 5,
    starterCode: `def gd_step(w, X, y, lr):
    # w: list of weights (length d)
    # X: list of lists (n x d), each row is a sample
    # y: list of targets (length n)
    # lr: learning rate
    # Return: updated weights as a new list
    pass
`,
    solutionHint:
      "For each feature j: grad_j = (2/n) · Σ_i X[i][j] · (X[i]·w − y[i]). Then w_new[j] = w[j] − lr · grad_j.",
    skillSlugs: ["linear-algebra", "supervised-learning-basics"],
    testCases: [
      {
        description: "Zero gradient when w is a perfect fit",
        assertion: `X = [[1, 0], [0, 1], [1, 1]]
y = [1, 1, 2]
w = [1, 1]
result = gd_step(w, X, y, 0.1)
assert all(abs(r - expected) < 1e-9 for r, expected in zip(result, [1, 1]))`,
      },
      {
        description: "Weights move in the gradient direction",
        assertion: `X = [[1], [1], [1]]
y = [3, 3, 3]
w = [0]
result = gd_step(w, X, y, 0.1)
# Gradient: 2 * (0 - 3) = -6 per sample, avg = -6
# w_new = 0 - 0.1 * (-6) = 0.6
assert abs(result[0] - 0.6) < 1e-9`,
      },
      {
        description: "Returns a new list (doesn't mutate input)",
        assertion: `X = [[1, 0], [0, 1]]
y = [1, 1]
w = [0, 0]
w_copy = list(w)
gd_step(w, X, y, 0.1)
assert w == w_copy`,
      },
      {
        description: "Learning rate of 0 leaves weights unchanged",
        assertion: `X = [[1, 2], [3, 4]]
y = [1, 1]
w = [0.5, 0.5]
result = gd_step(w, X, y, 0)
assert result == w`,
      },
    ],
  },
];

async function main() {
  console.log("🔧 Seeding advanced practical tasks...\n");

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
    // Resolve skill IDs
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
    console.log(
      `   Missing skills:   ${Array.from(missingSkills).join(", ")}`
    );
  }
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
