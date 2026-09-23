import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Each test case is a Python snippet with an `assert`.
 * The runner executes: starterCode + "\n" + assertion
 * If no exception → test passes.
 */
type TestCase = {
  description: string;
  assertion: string;
};

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
    slug: "sum-list",
    title: "Sum a List of Numbers",
    description:
      "Write a function `sum_list(nums)` that returns the sum of all numbers in a list. Return 0 for an empty list.",
    difficulty: 1,
    starterCode: `def sum_list(nums):
    # Your code here
    pass
`,
    solutionHint:
      "You can loop over the list and add each item to an accumulator, or use Python's built-in `sum()`.",
    skillSlugs: ["python-programming"],
    testCases: [
      {
        description: "sum_list([]) should return 0",
        assertion: "assert sum_list([]) == 0",
      },
      {
        description: "sum_list([1, 2, 3]) should return 6",
        assertion: "assert sum_list([1, 2, 3]) == 6",
      },
      {
        description: "sum_list([-1, 1, 5]) should return 5",
        assertion: "assert sum_list([-1, 1, 5]) == 5",
      },
      {
        description: "sum_list([10, 20, 30, 40]) should return 100",
        assertion: "assert sum_list([10, 20, 30, 40]) == 100",
      },
    ],
  },
  {
    slug: "dot-product",
    title: "Vector Dot Product",
    description:
      "Write a function `dot_product(a, b)` that returns the dot product of two equal-length lists. Assume both inputs have the same length.",
    difficulty: 3,
    starterCode: `def dot_product(a, b):
    # Your code here
    pass
`,
    solutionHint:
      "Iterate over indices, multiply a[i] * b[i], and sum the results.",
    skillSlugs: ["linear-algebra"],
    testCases: [
      {
        description: "dot_product([1, 2], [3, 4]) should return 11",
        assertion: "assert dot_product([1, 2], [3, 4]) == 11",
      },
      {
        description: "dot_product([0, 0], [5, 5]) should return 0",
        assertion: "assert dot_product([0, 0], [5, 5]) == 0",
      },
      {
        description: "dot_product([2, -1, 3], [4, 5, -2]) should return 1",
        assertion: "assert dot_product([2, -1, 3], [4, 5, -2]) == 1",
      },
      {
        description: "dot_product([1], [10]) should return 10",
        assertion: "assert dot_product([1], [10]) == 10",
      },
    ],
  },
  {
    slug: "mean",
    title: "Compute the Mean",
    description:
      "Write a function `mean(nums)` that returns the arithmetic mean of a list of numbers. Return 0 for an empty list.",
    difficulty: 2,
    starterCode: `def mean(nums):
    # Your code here
    pass
`,
    solutionHint:
      "Sum the numbers and divide by the count. Handle the empty-list case first.",
    skillSlugs: ["probability-and-statistics"],
    testCases: [
      {
        description: "mean([]) should return 0",
        assertion: "assert mean([]) == 0",
      },
      {
        description: "mean([5]) should return 5",
        assertion: "assert mean([5]) == 5",
      },
      {
        description: "mean([1, 2, 3, 4, 5]) should return 3",
        assertion: "assert abs(mean([1, 2, 3, 4, 5]) - 3) < 1e-9",
      },
      {
        description: "mean([2.5, 7.5]) should return 5",
        assertion: "assert abs(mean([2.5, 7.5]) - 5) < 1e-9",
      },
    ],
  },
];

async function main() {
  console.log("🔧 Seeding practical tasks...\n");

  const domain = await prisma.domain.findUnique({
    where: { slug: "ml-engineer" },
  });
  if (!domain) {
    console.error("❌ Domain 'ml-engineer' not found. Run pnpm db:seed first.");
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;
  let missingSkills = 0;

  for (const task of TASKS) {
    // Resolve skill ids
    const skillIds: string[] = [];
    for (const slug of task.skillSlugs) {
      const skill = await prisma.skill.findUnique({
        where: { domainId_slug: { domainId: domain.id, slug } },
      });
      if (!skill) {
        console.log(`   ⚠️  Skill "${slug}" not found — skipping task`);
        missingSkills++;
        break;
      }
      skillIds.push(skill.id);
    }
    if (skillIds.length !== task.skillSlugs.length) continue;

    // Upsert the task
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
  console.log(`   Created:        ${created}`);
  console.log(`   Skipped:        ${skipped}`);
  console.log(`   Missing skills: ${missingSkills}`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
