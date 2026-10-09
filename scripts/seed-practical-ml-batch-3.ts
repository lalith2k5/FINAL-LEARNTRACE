import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type TestCase = { description: string; assertion: string };
type Task = {
  slug: string;
  title: string;
  description: string;
  difficulty: number;
  starterCode: string;
  solutionHint: string;
  skillSlugs: string[];
  testCases: TestCase[];
};

const TASKS: Task[] = [
  {
    slug: "poly-derivative",
    title: "Polynomial Derivative",
    description:
      "Write `derivative(coeffs)` where `coeffs = [a0, a1, a2, ...]` represents the polynomial `a0 + a1*x + a2*x^2 + ...`. Return the coefficients of its derivative as a new list. The derivative of a constant is `[]`.",
    difficulty: 1,
    starterCode: `def derivative(coeffs):
    # Return a list of coefficients for the derivative
    pass
`,
    solutionHint:
      "For each index i >= 1, the derivative term has coefficient coeffs[i] * i and lands at index i-1. Drop a0.",
    skillSlugs: ["calculus"],
    testCases: [
      { description: "Constant", assertion: "assert derivative([5]) == []" },
      { description: "Linear", assertion: "assert derivative([2, 3]) == [3]" },
      { description: "x^2", assertion: "assert derivative([0, 0, 1]) == [0, 2]" },
      { description: "2 + 3x + 4x^2", assertion: "assert derivative([2, 3, 4]) == [3, 8]" },
      { description: "Empty input", assertion: "assert derivative([]) == []" },
    ],
  },
  {
    slug: "describe-for-chart",
    title: "Describe Numeric Series for Charting",
    description:
      "Write `describe_for_chart(xs)` returning `{'n': int, 'min': float, 'max': float, 'mean': float, 'is_constant': bool, 'has_negative': bool}`. Empty input returns all zeros with `is_constant=True`.",
    difficulty: 2,
    starterCode: `def describe_for_chart(xs):
    # Return dict with keys n, min, max, mean, is_constant, has_negative
    pass
`,
    solutionHint:
      "n = len(xs). If n == 0, return {'n': 0, 'min': 0.0, 'max': 0.0, 'mean': 0.0, 'is_constant': True, 'has_negative': False}. Else compute.",
    skillSlugs: ["data-visualization"],
    testCases: [
      { description: "Empty", assertion: "assert describe_for_chart([]) == {'n': 0, 'min': 0.0, 'max': 0.0, 'mean': 0.0, 'is_constant': True, 'has_negative': False}" },
      { description: "Single value is constant", assertion: "assert describe_for_chart([5]) == {'n': 1, 'min': 5, 'max': 5, 'mean': 5.0, 'is_constant': True, 'has_negative': False}" },
      { description: "Normal spread", assertion: "assert describe_for_chart([1, 2, 3]) == {'n': 3, 'min': 1, 'max': 3, 'mean': 2.0, 'is_constant': False, 'has_negative': False}" },
      { description: "Detects negatives", assertion: "assert describe_for_chart([-1, 0, 1])['has_negative'] is True" },
      { description: "All identical (nonempty)", assertion: "assert describe_for_chart([7, 7, 7])['is_constant'] is True" },
    ],
  },
  {
    slug: "broadcast-shape",
    title: "NumPy Broadcasting Shape",
    description:
      "Write `broadcast_shape(a, b)` where `a` and `b` are shape tuples. Return the resulting broadcast shape as a tuple, or `None` if the shapes are incompatible. Follow NumPy rules: align right, each dimension pair must be equal or one of them must be 1.",
    difficulty: 2,
    starterCode: `def broadcast_shape(a, b):
    # Return tuple or None
    pass
`,
    solutionHint:
      "Pad the shorter shape with leading 1s. For each aligned pair: if equal, keep it; if either is 1, take the other; else return None.",
    skillSlugs: ["numpy-fundamentals"],
    testCases: [
      { description: "Same shape", assertion: "assert broadcast_shape((3, 4), (3, 4)) == (3, 4)" },
      { description: "(3,1) + (1,4)", assertion: "assert broadcast_shape((3, 1), (1, 4)) == (3, 4)" },
      { description: "Scalar broadcast", assertion: "assert broadcast_shape((), (5,)) == (5,)" },
      { description: "1D with 2D", assertion: "assert broadcast_shape((3,), (2, 3)) == (2, 3)" },
      { description: "Incompatible", assertion: "assert broadcast_shape((3,), (4,)) is None" },
      { description: "Incompatible 2D", assertion: "assert broadcast_shape((2, 3), (2, 4)) is None" },
    ],
  },
  {
    slug: "fill-missing",
    title: "Fill Missing Values in a Column",
    description:
      "Write `fill_missing(rows, column, strategy)` operating on a list of dicts. `strategy` is `'mean' | 'median' | 'zero'`. Return a new list where every row has a numeric value in `column`. Missing = key absent OR value is `None`. If the column has no numeric values, fill with 0. Do not mutate the input.",
    difficulty: 2,
    starterCode: `def fill_missing(rows, column, strategy):
    # Return a new list of rows with the column filled
    pass
`,
    solutionHint:
      "Collect numeric values. mean = sum/n, median = sorted middle (average for even n). 'zero' → 0. Rebuild each row as a copy with the fill value where missing.",
    skillSlugs: ["pandas-data-manipulation"],
    testCases: [
      { description: "No missing values", assertion: "assert fill_missing([{'x': 1}, {'x': 2}], 'x', 'mean') == [{'x': 1}, {'x': 2}]" },
      { description: "Mean fill", assertion: "assert fill_missing([{'x': 1}, {'x': None}, {'x': 3}], 'x', 'mean') == [{'x': 1}, {'x': 2.0}, {'x': 3}]" },
      { description: "Median fill", assertion: "assert fill_missing([{'x': 1}, {'x': None}, {'x': 100}], 'x', 'median') == [{'x': 1}, {'x': 50.5}, {'x': 100}]" },
      { description: "Zero fill", assertion: "assert fill_missing([{}, {'x': 5}], 'x', 'zero') == [{'x': 0}, {'x': 5}]" },
      { description: "Does not mutate input", assertion: "r = [{'x': 1}, {'x': None}]\\nfill_missing(r, 'x', 'zero')\\nassert r[1]['x'] is None" },
    ],
  },
  {
    slug: "center-matrix",
    title: "Center a Feature Matrix",
    description:
      "Write `center(X)` where `X` is a list of equal-length numeric rows. Return a new matrix with each column centered on mean 0 (subtract the column mean). Empty matrix returns `[]`. Matrix with empty rows returns `[[] for each row]`.",
    difficulty: 3,
    starterCode: `def center(X):
    # Return column-centered matrix
    pass
`,
    solutionHint:
      "n_rows = len(X). n_cols = len(X[0]) if X else 0. Compute per-column means, then subtract.",
    skillSlugs: ["dimensionality-reduction-and-pca"],
    testCases: [
      { description: "Empty", assertion: "assert center([]) == []" },
      { description: "Single row → zeros", assertion: "assert center([[1, 2, 3]]) == [[0.0, 0.0, 0.0]]" },
      { description: "Two rows", assertion: "assert center([[1, 10], [3, 20]]) == [[-1.0, -5.0], [1.0, 5.0]]" },
      { description: "Three rows, mean 0 per column", assertion: "c = center([[1, 2], [2, 4], [3, 6]])\\nassert c == [[-1.0, -2.0], [0.0, 0.0], [1.0, 2.0]]" },
    ],
  },
  {
    slug: "linear-svm-decision",
    title: "Linear SVM Decision Function",
    description:
      "Write `svm_predict(x, w, b)` where `x` and `w` are equal-length numeric lists and `b` is a scalar. Compute `w·x + b`. Return `1` if the score is positive, `-1` otherwise. Zero counts as `-1`.",
    difficulty: 3,
    starterCode: `def svm_predict(x, w, b):
    # Return 1 or -1
    pass
`,
    solutionHint:
      "score = sum(xi * wi for xi, wi in zip(x, w)) + b. Return 1 if score > 0 else -1.",
    skillSlugs: ["support-vector-machines"],
    testCases: [
      { description: "Positive side", assertion: "assert svm_predict([1, 0], [1, 0], 0) == 1" },
      { description: "Negative side", assertion: "assert svm_predict([-1, 0], [1, 0], 0) == -1" },
      { description: "Bias shifts boundary", assertion: "assert svm_predict([0], [1], 5) == 1" },
      { description: "On the boundary → -1", assertion: "assert svm_predict([0], [1], 0) == -1" },
      { description: "Two features", assertion: "assert svm_predict([1, 1], [1, -1], 0) == -1" },
    ],
  },
  {
    slug: "nearest-centroid",
    title: "Nearest Centroid Classifier",
    description:
      "Write `nearest_centroid(x, centroids)` where `centroids` is a list of equal-length numeric vectors. Return the index of the centroid with the smallest Euclidean distance to `x`. Ties resolve to the smallest index.",
    difficulty: 3,
    starterCode: `import math

def nearest_centroid(x, centroids):
    # Return the index (int) of the nearest centroid
    pass
`,
    solutionHint:
      "For each centroid, sum((xi - ci) ** 2). Pick argmin. Python's min with a key handles ties by first occurrence.",
    skillSlugs: ["unsupervised-learning"],
    testCases: [
      { description: "Single centroid", assertion: "assert nearest_centroid([1, 1], [[0, 0]]) == 0" },
      { description: "Closer to first", assertion: "assert nearest_centroid([0.1, 0.1], [[0, 0], [5, 5]]) == 0" },
      { description: "Closer to second", assertion: "assert nearest_centroid([4.9, 5.1], [[0, 0], [5, 5]]) == 1" },
      { description: "Exact tie → smallest index", assertion: "assert nearest_centroid([1, 0], [[0, 0], [2, 0]]) == 0" },
      { description: "Three centroids", assertion: "assert nearest_centroid([0, 0, 0], [[1, 1, 1], [10, 10, 10], [0.5, 0.5, 0.5]]) == 2" },
    ],
  },
  {
    slug: "container-lifecycle",
    title: "Container Lifecycle Simulation",
    description:
      "Write `container_lifecycle(ops)` where `ops` is a list of tuples: `('run', name)` starts a container (idempotent — running it again is a no-op); `('stop', name)` moves a running container to stopped; `('rm', name)` deletes a container entirely. Return `{'running': [...], 'stopped': [...]}` sorted alphabetically within each list.",
    difficulty: 4,
    starterCode: `def container_lifecycle(ops):
    # Return {'running': [...], 'stopped': [...]}
    pass
`,
    solutionHint:
      "Track a dict name -> 'running' | 'stopped'. 'run' sets running only if name not tracked. 'stop' only if currently running. 'rm' deletes.",
    skillSlugs: ["docker-and-containerization"],
    testCases: [
      { description: "Empty", assertion: "assert container_lifecycle([]) == {'running': [], 'stopped': []}" },
      { description: "Run one", assertion: "assert container_lifecycle([('run', 'a')]) == {'running': ['a'], 'stopped': []}" },
      { description: "Run then stop", assertion: "assert container_lifecycle([('run', 'a'), ('stop', 'a')]) == {'running': [], 'stopped': ['a']}" },
      { description: "Stop then run resumes", assertion: "assert container_lifecycle([('run', 'a'), ('stop', 'a'), ('run', 'a')]) == {'running': ['a'], 'stopped': []}" },
      { description: "rm deletes", assertion: "assert container_lifecycle([('run', 'a'), ('rm', 'a')]) == {'running': [], 'stopped': []}" },
      { description: "Multiple containers, sorted", assertion: "assert container_lifecycle([('run', 'z'), ('run', 'a'), ('stop', 'z')]) == {'running': ['a'], 'stopped': ['z']}" },
    ],
  },
  {
    slug: "model-registry-ops",
    title: "Model Registry Operations",
    description:
      "Write `registry(ops)` where ops are tuples: `('register', name, version, metrics)` creates a version; `('promote', name, version, stage)` sets its stage. Return `{name: {version: {'stage': str, 'metrics': dict}}}`. New versions default to stage `'none'`. Promote on an unknown name/version is a silent no-op.",
    difficulty: 4,
    starterCode: `def registry(ops):
    # Return the registry state
    pass
`,
    solutionHint:
      "Use nested dicts. On register, only create if (name, version) doesn't exist (idempotent). On promote, update only if both exist.",
    skillSlugs: ["mlops-and-model-registry"],
    testCases: [
      { description: "Empty", assertion: "assert registry([]) == {}" },
      { description: "Register one", assertion: "assert registry([('register', 'm', 1, {'acc': 0.9})]) == {'m': {1: {'stage': 'none', 'metrics': {'acc': 0.9}}}}" },
      { description: "Promote to production", assertion: "r = registry([('register', 'm', 1, {}), ('promote', 'm', 1, 'prod')])\\nassert r['m'][1]['stage'] == 'prod'" },
      { description: "Register is idempotent", assertion: "r = registry([('register', 'm', 1, {'a': 1}), ('register', 'm', 1, {'a': 2})])\\nassert r['m'][1]['metrics'] == {'a': 1}" },
      { description: "Promote unknown is no-op", assertion: "assert registry([('promote', 'x', 1, 'prod')]) == {}" },
      { description: "Two versions", assertion: "r = registry([('register', 'm', 1, {}), ('register', 'm', 2, {})])\\nassert set(r['m'].keys()) == {1, 2}" },
    ],
  },
  {
    slug: "batch-requests",
    title: "Batch Prediction Requests",
    description:
      "Write `batch(items, size)` that splits `items` into consecutive chunks of length `size`. The last chunk may be shorter. `size <= 0` returns `[]` (invalid configuration).",
    difficulty: 4,
    starterCode: `def batch(items, size):
    # Return a list of batches
    pass
`,
    solutionHint:
      "Guard size <= 0. Slice in steps of size: items[i:i+size].",
    skillSlugs: ["model-deployment-api"],
    testCases: [
      { description: "Empty input", assertion: "assert batch([], 4) == []" },
      { description: "Exact split", assertion: "assert batch([1, 2, 3, 4], 2) == [[1, 2], [3, 4]]" },
      { description: "Uneven split", assertion: "assert batch([1, 2, 3, 4, 5], 2) == [[1, 2], [3, 4], [5]]" },
      { description: "Size larger than input", assertion: "assert batch([1, 2], 10) == [[1, 2]]" },
      { description: "Invalid size", assertion: "assert batch([1, 2, 3], 0) == []" },
      { description: "Size 1", assertion: "assert batch([1, 2, 3], 1) == [[1], [2], [3]]" },
    ],
  },
  {
    slug: "rnn-forward-scalar",
    title: "Scalar RNN Forward Pass",
    description:
      "Write `rnn_forward(xs, w_xh, w_hh, h0)` computing a simple scalar RNN: `h_t = tanh(w_xh * x_t + w_hh * h_{t-1})`. Return the list of hidden states `[h_1, h_2, ..., h_T]` (not including `h0`). Use `math.tanh`.",
    difficulty: 4,
    starterCode: `import math

def rnn_forward(xs, w_xh, w_hh, h0):
    # Return list of hidden states h_1 .. h_T
    pass
`,
    solutionHint:
      "Loop over xs. h_prev starts as h0. For each x: h = math.tanh(w_xh * x + w_hh * h_prev). Append h, update h_prev = h.",
    skillSlugs: ["recurrent-neural-networks"],
    testCases: [
      { description: "Empty sequence", assertion: "assert rnn_forward([], 1, 1, 0.5) == []" },
      { description: "Single step with zero weights", assertion: "assert rnn_forward([1.0], 0, 0, 0.5) == [0.0]" },
      { description: "Single step, w_xh=1, w_hh=0, h0=0", assertion: "assert abs(rnn_forward([1.0], 1, 0, 0)[0] - math.tanh(1.0)) < 1e-9" },
      { description: "Single step with state feedback", assertion: "assert abs(rnn_forward([1.0], 1, 1, 0.5)[0] - math.tanh(1.5)) < 1e-9" },
      { description: "Two steps chained", assertion: "h = rnn_forward([1.0, 2.0], 1, 1, 0.0)\\nassert abs(h[0] - math.tanh(1.0)) < 1e-9\\nassert abs(h[1] - math.tanh(2.0 + math.tanh(1.0))) < 1e-9" },
    ],
  },
  {
    slug: "slo-health-check",
    title: "ML Service Health Check",
    description:
      "Write `health(latencies, errors, slo_ms)` where `latencies` is a list of request times in ms and `errors` is a list of booleans (`True` = request errored, same length). Return `{'healthy': bool, 'p99_exceeded': bool, 'error_rate_high': bool}`. `p99_exceeded` is `True` if the p99 (nearest-rank) > `slo_ms`. `error_rate_high` is `True` if the error rate > 0.01. `healthy` = neither flag is set. Empty input → all `True` for the flags (unhealthy by default).",
    difficulty: 5,
    starterCode: `import math

def health(latencies, errors, slo_ms):
    # Return {'healthy': bool, 'p99_exceeded': bool, 'error_rate_high': bool}
    pass
`,
    solutionHint:
      "If latencies is empty, return {'healthy': False, 'p99_exceeded': True, 'error_rate_high': True}. Else p99 = sorted[math.ceil(0.99*n)-1], err_rate = sum(errors)/len(errors).",
    skillSlugs: ["ml-system-design-and-monitoring"],
    testCases: [
      { description: "Empty → all unhealthy flags", assertion: "assert health([], [], 100) == {'healthy': False, 'p99_exceeded': True, 'error_rate_high': True}" },
      { description: "Healthy service", assertion: "assert health([50, 60, 70], [False, False, False], 100) == {'healthy': True, 'p99_exceeded': False, 'error_rate_high': False}" },
      { description: "p99 blows SLO", assertion: "r = health([50, 50, 50, 500], [False, False, False, False], 100)\\nassert r['p99_exceeded'] is True and r['healthy'] is False" },
      { description: "Error rate above 1%", assertion: "r = health([10] * 50, [True] + [False] * 49, 100)\\nassert r['error_rate_high'] is True and r['healthy'] is False" },
      { description: "Both flags set", assertion: "r = health([999], [True], 100)\\nassert r == {'healthy': False, 'p99_exceeded': True, 'error_rate_high': True}" },
    ],
  },
  {
    slug: "quantize-int8",
    title: "INT8 Quantization",
    description:
      "Write `quantize(values)` that maps FP32 values to INT8 using min-max scaling. Return `(quantized, scale, zero_point)` where `scale = (max - min) / 255`, `zero_point = round(-min / scale)`, and each quantized value is `round(x / scale) + zero_point` clamped to `[0, 255]`. If `scale == 0`, return `([0]*n, 0.0, 0)`.",
    difficulty: 5,
    starterCode: `def quantize(values):
    # Return (list_of_ints, scale, zero_point)
    pass
`,
    solutionHint:
      "If not values, return ([], 0.0, 0). Compute lo, hi. If hi == lo, return ([0]*len(values), 0.0, 0). scale = (hi - lo) / 255. zp = round(-lo / scale). q = max(0, min(255, round(x / scale) + zp)).",
    skillSlugs: ["model-optimization-and-quantization"],
    testCases: [
      { description: "Empty", assertion: "assert quantize([]) == ([], 0.0, 0)" },
      { description: "Constant input", assertion: "assert quantize([5, 5, 5]) == ([0, 0, 0], 0.0, 0)" },
      { description: "Min maps to 0", assertion: "q, s, zp = quantize([0.0, 1.0])\\nassert q[0] == 0" },
      { description: "Max maps to 255", assertion: "q, s, zp = quantize([0.0, 1.0])\\nassert q[1] == 255" },
      { description: "Scale and zero_point math", assertion: "q, s, zp = quantize([0.0, 1.0])\\nassert abs(s - 1/255) < 1e-12 and zp == 0" },
      { description: "Negative range", assertion: "q, s, zp = quantize([-1.0, 1.0])\\nassert q[0] == 0 and q[1] == 255 and zp == 128" },
    ],
  },
];

async function main() {
  console.log("Seeding ml-engineer practical batch 3...\n");

  const domain = await prisma.domain.findUnique({
    where: { slug: "ml-engineer" },
  });
  if (!domain) {
    console.error("ml-engineer domain not found");
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;
  const missing = new Set<string>();

  for (const task of TASKS) {
    const skillIds: string[] = [];
    let missingSkill = false;
    for (const slug of task.skillSlugs) {
      const skill = await prisma.skill.findUnique({
        where: { domainId_slug: { domainId: domain.id, slug } },
      });
      if (!skill) {
        missing.add(slug);
        missingSkill = true;
        break;
      }
      skillIds.push(skill.id);
    }
    if (missingSkill) { skipped++; continue; }

    const existing = await prisma.practicalTask.findUnique({
      where: { domainId_slug: { domainId: domain.id, slug: task.slug } },
    });
    if (existing) { skipped++; continue; }

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
    console.log(`  + ${task.slug}`);
    created++;
  }

  console.log(`\nCreated: ${created}`);
  console.log(`Skipped: ${skipped}`);
  if (missing.size > 0) console.log(`Missing skills: ${[...missing].join(", ")}`);
}

main()
  .catch((e) => { console.error(e?.message ?? e); process.exit(1); })
  .finally(() => prisma.$disconnect());
