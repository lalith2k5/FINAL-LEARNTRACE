import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedQ = {
  skillSlug: string;
  prompt: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  difficulty: number;
};

const QUESTIONS: SeedQ[] = [
  // ----- python-programming -----
  {
    skillSlug: "python-programming",
    prompt: "What is the output of `len({1, 2, 2, 3, 3, 3})`?",
    options: [
      { id: "a", text: "6" },
      { id: "b", text: "3" },
      { id: "c", text: "2" },
      { id: "d", text: "1" },
    ],
    correctId: "b",
    explanation:
      "A set stores unique values, so {1, 2, 2, 3, 3, 3} collapses to {1, 2, 3} with length 3.",
    difficulty: 2,
  },
  {
    skillSlug: "python-programming",
    prompt:
      "Which of these creates a shallow copy of a list `a = [1, 2, 3]`?",
    options: [
      { id: "a", text: "b = a" },
      { id: "b", text: "b = a.copy()" },
      { id: "c", text: "b = a.link()" },
      { id: "d", text: "b = &a" },
    ],
    correctId: "b",
    explanation:
      "`a.copy()` (or `list(a)` or `a[:]`) creates a new list. `b = a` just aliases the same object.",
    difficulty: 3,
  },
  {
    skillSlug: "python-programming",
    prompt:
      "What does `[x * 2 for x in range(3)]` produce?",
    options: [
      { id: "a", text: "[0, 2, 4]" },
      { id: "b", text: "[2, 4, 6]" },
      { id: "c", text: "[0, 1, 2]" },
      { id: "d", text: "[1, 2, 3]" },
    ],
    correctId: "a",
    explanation:
      "`range(3)` yields 0, 1, 2. Multiplying each by 2 gives [0, 2, 4].",
    difficulty: 2,
  },

  // ----- linear-algebra -----
  {
    skillSlug: "linear-algebra",
    prompt:
      "If A is a 3×4 matrix and B is a 4×2 matrix, what is the shape of A·B?",
    options: [
      { id: "a", text: "4×4" },
      { id: "b", text: "3×2" },
      { id: "c", text: "2×3" },
      { id: "d", text: "Not defined" },
    ],
    correctId: "b",
    explanation:
      "Matrix multiplication (m×n)·(n×p) yields shape m×p. Here 3×4 · 4×2 = 3×2.",
    difficulty: 3,
  },
  {
    skillSlug: "linear-algebra",
    prompt:
      "The determinant of a 2×2 matrix [[a, b], [c, d]] is:",
    options: [
      { id: "a", text: "a + b + c + d" },
      { id: "b", text: "ad − bc" },
      { id: "c", text: "ac − bd" },
      { id: "d", text: "ab − cd" },
    ],
    correctId: "b",
    explanation:
      "The determinant is ad − bc. If it's 0, the matrix is singular (non-invertible).",
    difficulty: 2,
  },
  {
    skillSlug: "linear-algebra",
    prompt:
      "If A and B are both invertible n×n matrices, (A·B)⁻¹ equals:",
    options: [
      { id: "a", text: "A⁻¹ · B⁻¹" },
      { id: "b", text: "B⁻¹ · A⁻¹" },
      { id: "c", text: "A · B" },
      { id: "d", text: "(A·B)ᵀ" },
    ],
    correctId: "b",
    explanation:
      "The inverse of a product reverses order: (A·B)⁻¹ = B⁻¹ · A⁻¹.",
    difficulty: 4,
  },

  // ----- probability-and-statistics -----
  {
    skillSlug: "probability-and-statistics",
    prompt:
      "A fair coin is flipped twice. What is the probability of getting heads both times?",
    options: [
      { id: "a", text: "1/2" },
      { id: "b", text: "1/3" },
      { id: "c", text: "1/4" },
      { id: "d", text: "1/8" },
    ],
    correctId: "c",
    explanation:
      "Independent events multiply: (1/2) × (1/2) = 1/4.",
    difficulty: 2,
  },
  {
    skillSlug: "probability-and-statistics",
    prompt:
      "Bayes' theorem states P(A|B) = ?",
    options: [
      { id: "a", text: "P(B|A) · P(A) / P(B)" },
      { id: "b", text: "P(A) · P(B)" },
      { id: "c", text: "P(B|A) + P(A)" },
      { id: "d", text: "P(A) / P(B)" },
    ],
    correctId: "a",
    explanation:
      "Bayes' theorem: P(A|B) = P(B|A) · P(A) / P(B). It updates a prior belief given new evidence.",
    difficulty: 3,
  },
  {
    skillSlug: "probability-and-statistics",
    prompt:
      "Which measure is most sensitive to extreme outliers?",
    options: [
      { id: "a", text: "Median" },
      { id: "b", text: "Mode" },
      { id: "c", text: "Mean" },
      { id: "d", text: "Interquartile range" },
    ],
    correctId: "c",
    explanation:
      "The mean uses every value in its calculation, so a single extreme value can shift it significantly.",
    difficulty: 2,
  },

  // ----- data-preprocessing -----
  {
    skillSlug: "data-preprocessing",
    prompt:
      "Why is feature scaling often important before training a model?",
    options: [
      { id: "a", text: "It reduces the number of rows" },
      { id: "b", text: "It makes gradient-based methods converge faster" },
      { id: "c", text: "It removes outliers automatically" },
      { id: "d", text: "It always increases accuracy" },
    ],
    correctId: "b",
    explanation:
      "Algorithms that use distance or gradients (KNN, SVM, neural nets) treat all features equally — scaling prevents large-range features from dominating.",
    difficulty: 3,
  },
  {
    skillSlug: "data-preprocessing",
    prompt:
      "What is the main difference between standardization and min-max normalization?",
    options: [
      { id: "a", text: "Standardization uses median; min-max uses mode" },
      { id: "b", text: "Standardization gives mean 0, std 1; min-max scales to [0,1]" },
      { id: "c", text: "They are identical" },
      { id: "d", text: "Only min-max works for categorical data" },
    ],
    correctId: "b",
    explanation:
      "Standardization (z-score) centers around 0 with unit variance. Min-max squeezes values into the [0,1] range.",
    difficulty: 3,
  },
  {
    skillSlug: "data-preprocessing",
    prompt:
      "Which is the safest default strategy for missing numerical values?",
    options: [
      { id: "a", text: "Drop every row that has any missing value" },
      { id: "b", text: "Replace with mean or median" },
      { id: "c", text: "Replace with 0" },
      { id: "d", text: "Replace with random values" },
    ],
    correctId: "b",
    explanation:
      "Mean/median imputation preserves the sample size and roughly maintains the distribution. Dropping rows loses information; 0 can distort scales.",
    difficulty: 3,
  },

  // ----- exploratory-data-analysis -----
  {
    skillSlug: "exploratory-data-analysis",
    prompt:
      "You see a correlation of −0.85 between two variables. What does it mean?",
    options: [
      { id: "a", text: "One causes the other" },
      { id: "b", text: "Strong negative linear relationship" },
      { id: "c", text: "Weak relationship" },
      { id: "d", text: "No relationship" },
    ],
    correctId: "b",
    explanation:
      "|r| close to 1 means a strong linear relationship. The negative sign means as one increases, the other tends to decrease. Correlation ≠ causation.",
    difficulty: 3,
  },
  {
    skillSlug: "exploratory-data-analysis",
    prompt:
      "The IQR of a dataset is:",
    options: [
      { id: "a", text: "Q3 − Q1" },
      { id: "b", text: "max − min" },
      { id: "c", text: "mean − median" },
      { id: "d", text: "Q2 − Q1" },
    ],
    correctId: "a",
    explanation:
      "Interquartile range = Q3 (75th percentile) − Q1 (25th percentile). It measures spread and is robust to outliers.",
    difficulty: 2,
  },
  {
    skillSlug: "exploratory-data-analysis",
    prompt:
      "A histogram is best used for:",
    options: [
      { id: "a", text: "Showing relationships between two categorical variables" },
      { id: "b", text: "Visualizing the distribution of a single numeric variable" },
      { id: "c", text: "Displaying exact values of every data point" },
      { id: "d", text: "Finding correlation" },
    ],
    correctId: "b",
    explanation:
      "Histograms bin a single numeric variable and show how many observations fall into each bin — the shape of its distribution.",
    difficulty: 2,
  },

  // ----- supervised-learning -----
  {
    skillSlug: "supervised-learning",
    prompt:
      "What distinguishes supervised learning from unsupervised learning?",
    options: [
      { id: "a", text: "Supervised uses neural networks only" },
      { id: "b", text: "Supervised has labeled training data; unsupervised does not" },
      { id: "c", text: "Unsupervised is always more accurate" },
      { id: "d", text: "They are the same thing" },
    ],
    correctId: "b",
    explanation:
      "Supervised learning trains on input→output pairs (labels). Unsupervised learning finds structure without labels.",
    difficulty: 2,
  },
  {
    skillSlug: "supervised-learning",
    prompt:
      "You're predicting house prices. Which task is this?",
    options: [
      { id: "a", text: "Classification" },
      { id: "b", text: "Regression" },
      { id: "c", text: "Clustering" },
      { id: "d", text: "Dimensionality reduction" },
    ],
    correctId: "b",
    explanation:
      "Predicting a continuous numeric value (price) is regression. Classification predicts discrete categories.",
    difficulty: 1,
  },
  {
    skillSlug: "supervised-learning",
    prompt:
      "Overfitting means:",
    options: [
      { id: "a", text: "The model performs well on training data but poorly on new data" },
      { id: "b", text: "The model is too simple" },
      { id: "c", text: "The model has too few parameters" },
      { id: "d", text: "The model runs too slowly" },
    ],
    correctId: "a",
    explanation:
      "An overfit model memorizes training noise instead of learning the underlying pattern, so it generalizes poorly.",
    difficulty: 3,
  },

  // ----- model-evaluation -----
  {
    skillSlug: "model-evaluation",
    prompt:
      "What is the main difference between accuracy and F1 score?",
    options: [
      { id: "a", text: "F1 balances precision and recall; accuracy counts all correct" },
      { id: "b", text: "They are identical" },
      { id: "c", text: "F1 only works for regression" },
      { id: "d", text: "Accuracy ignores true negatives" },
    ],
    correctId: "a",
    explanation:
      "Accuracy can be misleading on imbalanced data. F1 is the harmonic mean of precision and recall, giving a more balanced view.",
    difficulty: 3,
  },
  {
    skillSlug: "model-evaluation",
    prompt:
      "A confusion matrix has TP=40, FP=10, FN=5, TN=45. What is precision?",
    options: [
      { id: "a", text: "40/50" },
      { id: "b", text: "40/45" },
      { id: "c", text: "40/85" },
      { id: "d", text: "45/55" },
    ],
    correctId: "a",
    explanation:
      "Precision = TP / (TP + FP) = 40 / (40 + 10) = 40/50 = 0.8.",
    difficulty: 4,
  },
  {
    skillSlug: "model-evaluation",
    prompt:
      "Which metric is best for a heavily imbalanced binary classification problem?",
    options: [
      { id: "a", text: "Accuracy" },
      { id: "b", text: "AUC-ROC" },
      { id: "c", text: "Mean squared error" },
      { id: "d", text: "R²" },
    ],
    correctId: "b",
    explanation:
      "AUC-ROC is threshold-independent and robust to class imbalance. Accuracy is misleading when one class dominates.",
    difficulty: 4,
  },

  // ----- decision-trees-and-ensembles -----
  {
    skillSlug: "decision-trees-and-ensembles",
    prompt:
      "Random forests reduce overfitting compared to a single tree by:",
    options: [
      { id: "a", text: "Using deeper trees" },
      { id: "b", text: "Averaging many decorrelated trees trained on bootstrap samples" },
      { id: "c", text: "Removing all features" },
      { id: "d", text: "Using only one feature" },
    ],
    correctId: "b",
    explanation:
      "Random forests build many trees on random subsets of data and features, then average their predictions — reducing variance.",
    difficulty: 3,
  },
  {
    skillSlug: "decision-trees-and-ensembles",
    prompt:
      "What is the primary purpose of gradient boosting?",
    options: [
      { id: "a", text: "Reduce bias by sequentially fitting weak learners to residuals" },
      { id: "b", text: "Randomize feature selection" },
      { id: "c", text: "Replace neural networks" },
      { id: "d", text: "Perform clustering" },
    ],
    correctId: "a",
    explanation:
      "Boosting fits new trees to the errors (residuals) of previous trees, so the ensemble progressively reduces bias.",
    difficulty: 4,
  },
  {
    skillSlug: "decision-trees-and-ensembles",
    prompt:
      "Gini impurity in a decision tree measures:",
    options: [
      { id: "a", text: "Depth of the tree" },
      { id: "b", text: "How often a randomly chosen sample would be misclassified" },
      { id: "c", text: "Number of leaves" },
      { id: "d", text: "Training time" },
    ],
    correctId: "b",
    explanation:
      "Gini impurity is the probability of misclassifying a randomly chosen element if it were labeled by the node's class distribution.",
    difficulty: 4,
  },

  // ----- deep-learning-fundamentals -----
  {
    skillSlug: "deep-learning-fundamentals",
    prompt:
      "Why do deep networks use non-linear activation functions?",
    options: [
      { id: "a", text: "To speed up training only" },
      { id: "b", text: "Without them, stacking layers would be equivalent to one linear layer" },
      { id: "c", text: "Because Python requires them" },
      { id: "d", text: "To reduce the number of parameters" },
    ],
    correctId: "b",
    explanation:
      "A composition of linear functions is still linear. Non-linear activations (ReLU, sigmoid, tanh) let networks approximate complex functions.",
    difficulty: 3,
  },
  {
    skillSlug: "deep-learning-fundamentals",
    prompt:
      "The role of the learning rate in gradient descent is to:",
    options: [
      { id: "a", text: "Control how far the parameters move each step" },
      { id: "b", text: "Set the number of layers" },
      { id: "c", text: "Choose the activation function" },
      { id: "d", text: "Initialize weights" },
    ],
    correctId: "a",
    explanation:
      "Learning rate scales the gradient update. Too high → divergence; too low → slow convergence.",
    difficulty: 2,
  },
  {
    skillSlug: "deep-learning-fundamentals",
    prompt:
      "Dropout during training works by:",
    options: [
      { id: "a", text: "Deleting training data" },
      { id: "b", text: "Randomly setting a fraction of activations to zero each step" },
      { id: "c", text: "Removing the last layer" },
      { id: "d", text: "Lowering the learning rate" },
    ],
    correctId: "b",
    explanation:
      "Dropout randomly zeroes activations, forcing the network to learn robust features and reducing overfitting.",
    difficulty: 3,
  },

  // ----- transformers-and-attention -----
  {
    skillSlug: "transformers-and-attention",
    prompt:
      "In self-attention, what do Q, K, and V stand for?",
    options: [
      { id: "a", text: "Query, Key, Value" },
      { id: "b", text: "Quality, Kernel, Vector" },
      { id: "c", text: "Queue, Key, Velocity" },
      { id: "d", text: "Query, Kernel, Variable" },
    ],
    correctId: "a",
    explanation:
      "Each token projects to a Query, Key, and Value. Attention weights are computed from Q·Kᵀ, then applied to V.",
    difficulty: 3,
  },
  {
    skillSlug: "transformers-and-attention",
    prompt:
      "Why does the Transformer architecture need positional encodings?",
    options: [
      { id: "a", text: "To reduce parameters" },
      { id: "b", text: "Self-attention alone is permutation-invariant, so order isn't captured" },
      { id: "c", text: "To make training faster" },
      { id: "d", text: "To avoid the softmax" },
    ],
    correctId: "b",
    explanation:
      "Without positional information, a Transformer sees a sentence as an unordered bag of tokens. Positional encodings add order.",
    difficulty: 4,
  },
  {
    skillSlug: "transformers-and-attention",
    prompt:
      "Multi-head attention allows the model to:",
    options: [
      { id: "a", text: "Use more GPUs" },
      { id: "b", text: "Attend to information from different representation subspaces in parallel" },
      { id: "c", text: "Skip the feedforward layer" },
      { id: "d", text: "Remove the softmax" },
    ],
    correctId: "b",
    explanation:
      "Multiple heads run attention in parallel with different learned projections, capturing various relationships (syntactic, semantic, positional).",
    difficulty: 4,
  },
];

async function main() {
  console.log("📝 Seeding additional questions...\n");

  // Look up the domain
  const domain = await prisma.domain.findUnique({
    where: { slug: "ml-engineer" },
  });
  if (!domain) {
    console.error("❌ Domain 'ml-engineer' not found.");
    process.exit(1);
  }

  // Build a map of skill slug → id
  const skills = await prisma.skill.findMany({
    where: { domainId: domain.id },
  });
  const slugToSkill = new Map(skills.map((s) => [s.slug, s]));
  console.log(`   Found ${skills.length} skills in DB`);

  let created = 0;
  let skippedMissingSkill = 0;
  const missing = new Set<string>();

  for (const q of QUESTIONS) {
    const skill = slugToSkill.get(q.skillSlug);
    if (!skill) {
      skippedMissingSkill++;
      missing.add(q.skillSlug);
      continue;
    }

    // Check for duplicate by prompt
    const existing = await prisma.question.findFirst({
      where: {
        domainId: domain.id,
        prompt: q.prompt,
      },
    });
    if (existing) continue;

    const created_q = await prisma.question.create({
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
        questionId: created_q.id,
        skillId: skill.id,
        weight: 1.0,
      },
    });

    created++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created:              ${created}`);
  console.log(`   Skipped (missing):    ${skippedMissingSkill}`);
  if (missing.size > 0) {
    console.log(`   Missing skill slugs:  ${Array.from(missing).join(", ")}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
