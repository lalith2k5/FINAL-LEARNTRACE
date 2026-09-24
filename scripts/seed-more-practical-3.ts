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
    slug: "binary-search",
    title: "Binary Search",
    description:
      "Write `binary_search(arr, target)` that returns the index of `target` in a sorted list, or -1 if not present. Use the classic divide-and-conquer approach: compare with the middle element, discard half the search space.",
    difficulty: 2,
    starterCode: `def binary_search(arr, target):
    # arr is sorted ascending
    # Return the index of target, or -1 if not found
    pass
`,
    solutionHint:
      "Keep two pointers (lo=0, hi=len(arr)-1). While lo <= hi, compute mid=(lo+hi)//2. Compare arr[mid] with target, narrow the range.",
    skillSlugs: ["data-structures-and-algorithms"],
    testCases: [
      { description: "Finds target in the middle", assertion: "assert binary_search([1, 2, 3, 4, 5], 3) == 2" },
      { description: "Returns -1 when target is absent", assertion: "assert binary_search([1, 2, 3, 4, 5], 6) == -1" },
      { description: "Empty list returns -1", assertion: "assert binary_search([], 1) == -1" },
      { description: "Single-element list", assertion: "assert binary_search([5], 5) == 0" },
    ],
  },
  {
    slug: "euclidean-distance",
    title: "Euclidean Distance",
    description:
      "Write `euclidean(a, b)` that returns the Euclidean distance between two equal-length numeric vectors: sqrt(Σ (a_i - b_i)²).",
    difficulty: 1,
    starterCode: `import math

def euclidean(a, b):
    # a, b: lists of numbers, same length
    pass
`,
    solutionHint:
      "Sum (a[i] - b[i]) ** 2 over all i, then take math.sqrt of the sum.",
    skillSlugs: ["clustering-algorithms"],
    testCases: [
      { description: "3-4-5 right triangle", assertion: "assert euclidean([0, 0], [3, 4]) == 5.0" },
      { description: "Same point → 0", assertion: "assert euclidean([1, 1], [1, 1]) == 0.0" },
      {
        description: "Diagonal in 3D",
        assertion:
          "assert abs(euclidean([0, 0, 0], [1, 1, 1]) - 1.7320508075688772) < 1e-9",
      },
      {
        description: "Handles negatives",
        assertion:
          "assert abs(euclidean([-1, -1], [1, 1]) - 2.8284271247461903) < 1e-9",
      },
    ],
  },
  {
    slug: "one-hot-encode",
    title: "One-Hot Encoding",
    description:
      "Write `one_hot(labels)` that returns a list of one-hot encoded rows for a list of string labels. Use the sorted set of unique categories to fix column order.",
    difficulty: 2,
    starterCode: `def one_hot(labels):
    # labels: list of strings
    # Return: list of lists, each row has 1 at its category's index, 0 elsewhere
    pass
`,
    solutionHint:
      "categories = sorted(set(labels)). For each label, build a row of len(categories) zeros and set position categories.index(label) to 1.",
    skillSlugs: ["feature-engineering"],
    testCases: [
      {
        description: "Three rows, two categories",
        assertion: 'assert one_hot(["a", "b", "a"]) == [[1, 0], [0, 1], [1, 0]]',
      },
      {
        description: "Single label, single category",
        assertion: 'assert one_hot(["x"]) == [[1]]',
      },
      { description: "Empty input → empty output", assertion: "assert one_hot([]) == []" },
      {
        description: "Sorted categories fix column order",
        assertion:
          'assert one_hot(["c", "a", "b"]) == [[0, 0, 1], [1, 0, 0], [0, 1, 0]]',
      },
    ],
  },
  {
    slug: "pearson-correlation",
    title: "Pearson Correlation",
    description:
      "Write `pearson(xs, ys)` that returns the Pearson correlation coefficient between two equal-length numeric lists. Return 0.0 if either list has zero variance (all values equal).",
    difficulty: 3,
    starterCode: `import math

def pearson(xs, ys):
    # Return Pearson correlation coefficient (-1 to 1)
    pass
`,
    solutionHint:
      "Compute means mx, my. Numerator = Σ(x - mx)(y - my). Denominator = sqrt(Σ(x - mx)²) * sqrt(Σ(y - my)²). Guard against zero denominator.",
    skillSlugs: ["exploratory-data-analysis"],
    testCases: [
      {
        description: "Perfect positive correlation → 1",
        assertion: "assert abs(pearson([1, 2, 3], [1, 2, 3]) - 1.0) < 1e-9",
      },
      {
        description: "Perfect negative correlation → -1",
        assertion: "assert abs(pearson([1, 2, 3], [3, 2, 1]) - (-1.0)) < 1e-9",
      },
      {
        description: "Scaled data → still 1",
        assertion: "assert abs(pearson([1, 2, 3], [2, 4, 6]) - 1.0) < 1e-9",
      },
      {
        description: "Zero variance → 0",
        assertion: "assert pearson([1, 1, 1], [1, 2, 3]) == 0.0",
      },
    ],
  },
  {
    slug: "linear-regression-fit",
    title: "Fit a Simple Linear Regression",
    description:
      "Write `fit_linear(xs, ys)` that returns `(slope, intercept)` for the line that minimizes mean squared error between `y` and `slope * x + intercept`. Use the closed-form least squares solution.",
    difficulty: 4,
    starterCode: `def fit_linear(xs, ys):
    # Return (slope, intercept) as a tuple of floats
    pass
`,
    solutionHint:
      "slope = Σ(x-mx)(y-my) / Σ(x-mx)², intercept = my - slope * mx. mx = mean(xs), my = mean(ys).",
    skillSlugs: ["linear-and-logistic-regression"],
    testCases: [
      {
        description: "y = 2x",
        assertion:
          "s, i = fit_linear([1, 2, 3], [2, 4, 6])\nassert abs(s - 2.0) < 1e-9 and abs(i - 0.0) < 1e-9",
      },
      {
        description: "y = 2x + 1",
        assertion:
          "s, i = fit_linear([0, 1, 2], [1, 3, 5])\nassert abs(s - 2.0) < 1e-9 and abs(i - 1.0) < 1e-9",
      },
      {
        description: "Flat y → slope 0",
        assertion:
          "s, i = fit_linear([1, 2, 3], [3, 3, 3])\nassert abs(s - 0.0) < 1e-9 and abs(i - 3.0) < 1e-9",
      },
      {
        description: "y = 2x + 3",
        assertion:
          "s, i = fit_linear([1, 2, 3], [5, 7, 9])\nassert abs(s - 2.0) < 1e-9 and abs(i - 3.0) < 1e-9",
      },
    ],
  },
  {
    slug: "gini-impurity",
    title: "Gini Impurity",
    description:
      "Write `gini(labels)` that returns the Gini impurity of a list of class labels: `1 - Σ p_i²`, where `p_i` is the fraction of items in class `i`.",
    difficulty: 3,
    starterCode: `def gini(labels):
    # Return the Gini impurity of the label distribution
    pass
`,
    solutionHint:
      "Count each unique label, compute proportions p = count/n, then return 1 - sum(p**2).",
    skillSlugs: ["decision-trees-and-ensembles"],
    testCases: [
      { description: "Pure node → 0", assertion: "assert gini([1, 1, 1, 1]) == 0.0" },
      { description: "Balanced binary → 0.5", assertion: "assert gini([1, 0]) == 0.5" },
      { description: "Two-two split → 0.5", assertion: "assert gini([1, 1, 0, 0]) == 0.5" },
      {
        description: "Three-one split → 0.375",
        assertion: "assert abs(gini([1, 1, 1, 0]) - 0.375) < 1e-9",
      },
    ],
  },
  {
    slug: "kfold-indices",
    title: "K-Fold Split Indices",
    description:
      "Write `kfold_indices(n, k)` that partitions indices `[0, n-1]` into `k` contiguous folds. Return a list of `(train_indices, val_indices)` tuples, one per fold. Assumes `n` is divisible by `k`.",
    difficulty: 3,
    starterCode: `def kfold_indices(n, k):
    # Return a list of k (train, val) tuples of index lists
    pass
`,
    solutionHint:
      "fold_size = n // k. For fold i, val = list(range(i*fold_size, (i+1)*fold_size)), train = everything else.",
    skillSlugs: ["cross-validation-and-hyperparameter-tuning"],
    testCases: [
      {
        description: "4 samples, 2 folds",
        assertion:
          "f = kfold_indices(4, 2)\nassert len(f) == 2\nassert f[0] == ([2, 3], [0, 1])\nassert f[1] == ([0, 1], [2, 3])",
      },
      {
        description: "6 samples, 3 folds",
        assertion:
          "f = kfold_indices(6, 3)\nassert len(f) == 3\nassert f[0][1] == [0, 1] and f[1][1] == [2, 3] and f[2][1] == [4, 5]",
      },
      {
        description: "All indices appear in exactly one val set",
        assertion:
          "f = kfold_indices(6, 3)\nall_val = sorted([i for _, v in f for i in v])\nassert all_val == [0, 1, 2, 3, 4, 5]",
      },
      {
        description: "Train and val are disjoint per fold",
        assertion:
          "f = kfold_indices(4, 2)\nfor train, val in f:\n    assert set(train).isdisjoint(set(val))",
      },
    ],
  },
  {
    slug: "dense-forward",
    title: "Dense Layer Forward Pass",
    description:
      "Write `dense(x, W, b)` that computes a fully-connected layer forward pass: `W @ x + b`. `x` is a length-`d_in` vector, `W` is a `d_out × d_in` matrix, `b` is a length-`d_out` bias vector. Return a length-`d_out` vector.",
    difficulty: 4,
    starterCode: `def dense(x, W, b):
    # x: list of length d_in
    # W: list of d_out lists, each of length d_in
    # b: list of length d_out
    # Return: list of length d_out
    pass
`,
    solutionHint:
      "For each row w in W: compute dot(w, x) + b[i]. Return the list of these values.",
    skillSlugs: ["neural-network-architectures"],
    testCases: [
      {
        description: "Identity weight → returns x + b (b=0)",
        assertion: "assert dense([1, 1], [[1, 0], [0, 1]], [0, 0]) == [1.0, 1.0]",
      },
      {
        description: "Single output neuron",
        assertion: "assert dense([2, 3], [[1, 2]], [0]) == [8.0]",
      },
      {
        description: "Bias is added per output",
        assertion: "assert dense([1], [[2], [3]], [1, -1]) == [3.0, 2.0]",
      },
      {
        description: "All-ones weight sums inputs",
        assertion: "assert dense([1, 1], [[1, 1], [1, 1]], [0, 0]) == [2.0, 2.0]",
      },
    ],
  },
  {
    slug: "attention-weights",
    title: "Scaled Dot-Product Attention Weights",
    description:
      "Write `attention_weights(Q, K)` that returns the softmax-normalized attention weight matrix `softmax(Q @ Kᵀ / √d)`. `Q` and `K` are lists of row vectors, all with the same length `d`. Subtract the row max before exponentiating for numerical stability.",
    difficulty: 5,
    starterCode: `import math

def attention_weights(Q, K):
    # Q: n_q rows × d, K: n_k rows × d
    # Return: n_q × n_k matrix of attention weights
    pass
`,
    solutionHint:
      "For each query row, compute dot products with every key row, divide by sqrt(d), subtract the max score, exponentiate, normalize by the sum.",
    skillSlugs: ["transformers-and-attention"],
    testCases: [
      {
        description: "Single query, single key → weight 1",
        assertion: "assert attention_weights([[1, 0]], [[1, 0]]) == [[1.0]]",
      },
      {
        description: "Identical keys split weight evenly",
        assertion:
          "w = attention_weights([[0, 0]], [[1, 1], [1, 1]])\nassert abs(w[0][0] - 0.5) < 1e-9 and abs(w[0][1] - 0.5) < 1e-9",
      },
      {
        description: "Weights sum to 1 per query row",
        assertion:
          "w = attention_weights([[1, 2], [3, 4]], [[1, 0], [0, 1]])\nfor row in w:\n    assert abs(sum(row) - 1.0) < 1e-9",
      },
      {
        description: "Large scores don't overflow",
        assertion:
          "w = attention_weights([[1000, 1000]], [[1, 0], [0, 1]])\nassert abs(sum(w[0]) - 1.0) < 1e-9",
      },
    ],
  },
  {
    slug: "conv2d",
    title: "2D Convolution (Single Channel)",
    description:
      "Write `conv2d(image, kernel)` that applies a 2D convolution with stride 1 and no padding. Both `image` and `kernel` are 2D lists of numbers. Return a 2D output of shape `(H - Kh + 1, W - Kw + 1)`.",
    difficulty: 4,
    starterCode: `def conv2d(image, kernel):
    # image: H × W 2D list
    # kernel: Kh × Kw 2D list (both odd and smaller than image)
    # Return: (H-Kh+1) × (W-Kw+1) 2D list
    pass
`,
    solutionHint:
      "For each output position (i, j), sum image[i+r][j+c] * kernel[r][c] over all r, c in the kernel.",
    skillSlugs: ["convolutional-neural-networks"],
    testCases: [
      {
        description: "1×1 identity kernel preserves the image",
        assertion:
          "assert conv2d([[1, 2], [3, 4]], [[1]]) == [[1.0, 2.0], [3.0, 4.0]]",
      },
      {
        description: "2×2 kernel on 2×2 image → 1×1 output",
        assertion: "assert conv2d([[1, 2], [3, 4]], [[1, 0], [0, 1]]) == [[5.0]]",
      },
      {
        description: "All-ones kernel sums each 2×2 patch",
        assertion:
          "assert conv2d([[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[1, 1], [1, 1]]) == [[4.0, 4.0], [4.0, 4.0]]",
      },
      {
        description: "Known 3×3 × 2×2 result",
        assertion:
          "assert conv2d([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, 1]]) == [[6.0, 8.0], [12.0, 14.0]]",
      },
    ],
  },
];

async function main() {
  console.log("🔧 Seeding practical tasks (batch 3)...\n");

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

  const total = await prisma.practicalTask.count({
    where: { domainId: domain.id },
  });
  const skillsCovered = await prisma.practicalTaskSkill.findMany({
    where: { task: { domainId: domain.id } },
    distinct: ["skillId"],
  });
  console.log(`   Total tasks:      ${total}`);
  console.log(`   Skills covered:   ${skillsCovered.length} / 30`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
