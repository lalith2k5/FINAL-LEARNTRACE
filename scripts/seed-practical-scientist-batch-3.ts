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
    slug: "summary-stats",
    title: "Summary Statistics",
    description:
      "Write `summary(xs)` that returns `{'mean': ..., 'median': ..., 'mode': ..., 'stdev': ...}` for a non-empty list of numbers. Median of an even-length list is the mean of the two middle values. Mode is the most frequent value; ties resolve to the smallest. Stdev is population (divide by n).",
    difficulty: 1,
    starterCode: `def summary(xs):
    # Return {'mean': float, 'median': float, 'mode': float, 'stdev': float}
    pass
`,
    solutionHint:
      "Sort a copy for median. Use a dict for mode counts. Population stdev = sqrt(sum((x-m)^2)/n).",
    skillSlugs: ["descriptive-statistics"],
    testCases: [
      { description: "Single value", assertion: "r = summary([5])\\nassert r['mean'] == 5.0 and r['median'] == 5 and r['mode'] == 5 and r['stdev'] == 0.0" },
      { description: "Odd-length median", assertion: "assert summary([1, 2, 3])['median'] == 2" },
      { description: "Even-length median", assertion: "assert summary([1, 2, 3, 4])['median'] == 2.5" },
      { description: "Mode tie → smallest", assertion: "assert summary([3, 3, 1, 1, 2])['mode'] == 1" },
      { description: "Population stdev", assertion: "import math\\nr = summary([2, 4, 4, 4, 5, 5, 7, 9])\\nassert abs(r['stdev'] - 2.0) < 1e-9" },
    ],
  },
  {
    slug: "df-from-columns",
    title: "Build a DataFrame from Columns",
    description:
      "Write `df_from_columns(cols)` where `cols` is a dict mapping column name to a list of values. Return a list of row dicts (the row-major view of the frame). All column lists have the same length. Preserve insertion order of columns in each row.",
    difficulty: 1,
    starterCode: `def df_from_columns(cols):
    # Return a list of row dicts
    pass
`,
    solutionHint:
      "n = len of any column. For i in range(n), build {col: cols[col][i] for col in cols}.",
    skillSlugs: ["python-for-data-science"],
    testCases: [
      { description: "Empty frame", assertion: "assert df_from_columns({}) == []" },
      { description: "Single column", assertion: "assert df_from_columns({'a': [1, 2]}) == [{'a': 1}, {'a': 2}]" },
      { description: "Two columns, order preserved", assertion: "assert df_from_columns({'a': [1, 2], 'b': ['x', 'y']}) == [{'a': 1, 'b': 'x'}, {'a': 2, 'b': 'y'}]" },
      { description: "Three rows", assertion: "assert df_from_columns({'x': [10, 20, 30]}) == [{'x': 10}, {'x': 20}, {'x': 30}]" },
    ],
  },
  {
    slug: "histogram-bins",
    title: "Compute Histogram Bins",
    description:
      "Write `histogram(xs, bins)` that bins the values in `xs` into `bins` equal-width buckets. Bin width = `(max-min)/bins`. A value goes into bucket `floor((x - min) / width)`, clamped to `[0, bins-1]` so the max value lands in the last bucket. Return a list of `bins` counts.",
    difficulty: 2,
    starterCode: `import math

def histogram(xs, bins):
    # Return a list of counts (length == bins)
    pass
`,
    solutionHint:
      "If xs empty, return [0]*bins. Otherwise compute lo = min(xs), hi = max(xs), width = (hi - lo) / bins. If width == 0, put everything in bucket 0. Otherwise idx = min(bins - 1, int((x - lo) / width)).",
    skillSlugs: ["data-visualization"],
    testCases: [
      { description: "Empty input", assertion: "assert histogram([], 5) == [0, 0, 0, 0, 0]" },
      { description: "All identical → all in first bucket", assertion: "assert histogram([7, 7, 7], 3) == [3, 0, 0]" },
      { description: "Uniform 0..9 with 5 bins", assertion: "assert histogram([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 5) == [2, 2, 2, 2, 2]" },
      { description: "Max lands in last bucket", assertion: "assert histogram([0, 10], 5) == [1, 0, 0, 0, 1]" },
    ],
  },
  {
    slug: "pivot-long-to-wide",
    title: "Pivot Long to Wide",
    description:
      "Write `pivot(rows, index_col, column_col, value_col)` that reshapes a long list of dicts into a wide list of dicts. Output rows are grouped by `index_col` value (in first-seen order); each output row has `{index_col: key, <column_value>: <value>, ...}`. Missing pairs get `None`.",
    difficulty: 2,
    starterCode: `def pivot(rows, index_col, column_col, value_col):
    # Return a list of wide rows
    pass
`,
    solutionHint:
      "Group by rows[i][index_col], preserving first-seen order (use a dict). For each key, build the output row from the column values seen.",
    skillSlugs: ["data-wrangling"],
    testCases: [
      { description: "Empty input", assertion: "assert pivot([], 'id', 'k', 'v') == []" },
      { description: "Single row", assertion: "assert pivot([{'id': 1, 'k': 'a', 'v': 10}], 'id', 'k', 'v') == [{'id': 1, 'a': 10}]" },
      { description: "Two keys, two index values", assertion: "assert pivot([{'id': 1, 'k': 'a', 'v': 10}, {'id': 1, 'k': 'b', 'v': 20}, {'id': 2, 'k': 'a', 'v': 30}], 'id', 'k', 'v') == [{'id': 1, 'a': 10, 'b': 20}, {'id': 2, 'a': 30, 'b': None}]" },
      { description: "Order preserved by first appearance", assertion: "assert [r['id'] for r in pivot([{'id': 2, 'k': 'a', 'v': 1}, {'id': 1, 'k': 'a', 'v': 2}], 'id', 'k', 'v')] == [2, 1]" },
    ],
  },
  {
    slug: "iqr-outliers",
    title: "IQR Outlier Detection",
    description:
      "Write `find_outliers(xs)` that returns a sorted list of values outside the range `[Q1 - 1.5*IQR, Q3 + 1.5*IQR]`. Use linear interpolation for quartiles (numpy-style): `Q1 = interpolate(sorted_xs, 0.25)`, `Q3 = interpolate(sorted_xs, 0.75)` where interpolation uses the position `p * (n - 1)`.",
    difficulty: 2,
    starterCode: `def find_outliers(xs):
    # Return sorted list of outliers
    pass
`,
    solutionHint:
      "Sort a copy. pos = p * (n - 1). lo = floor(pos), hi = ceil(pos). interpolated = sorted_[lo] + (sorted_[hi] - sorted_[lo]) * (pos - lo).",
    skillSlugs: ["exploratory-data-analysis"],
    testCases: [
      { description: "Empty input", assertion: "assert find_outliers([]) == []" },
      { description: "No outliers in tight range", assertion: "assert find_outliers([1, 2, 3, 4, 5]) == []" },
      { description: "One high outlier", assertion: "assert find_outliers([1, 2, 3, 4, 100]) == [100]" },
      { description: "Both directions", assertion: "assert find_outliers([-100, 1, 2, 3, 4, 100]) == [-100, 100]" },
    ],
  },
  {
    slug: "sql-select-sim",
    title: "SQL SELECT Simulator",
    description:
      "Write `select(rows, where=None, order_by=None, limit=None)` that filters a list of dicts. `where` is `(col, op, val)` with `op` in `'=', '!=', '>', '<', '>=', '<='`. `order_by` is `(col, direction)` with direction in `'asc' | 'desc'`. Apply where → order → limit, in that order. Return the filtered/ordered list.",
    difficulty: 2,
    starterCode: `def select(rows, where=None, order_by=None, limit=None):
    # Return filtered, sorted, limited rows
    pass
`,
    solutionHint:
      "Filter with the operator via a dict of lambdas or if/elif. Sort with key=lambda r: r[col], reverse=(direction=='desc'). Slice [:limit] if limit is not None.",
    skillSlugs: ["sql-for-analysis"],
    testCases: [
      { description: "No clauses", assertion: "assert select([{'a': 1}, {'a': 2}]) == [{'a': 1}, {'a': 2}]" },
      { description: "Simple where", assertion: "assert select([{'a': 1}, {'a': 2}, {'a': 3}], where=('a', '>', 1)) == [{'a': 2}, {'a': 3}]" },
      { description: "Order ascending", assertion: "assert select([{'a': 3}, {'a': 1}, {'a': 2}], order_by=('a', 'asc')) == [{'a': 1}, {'a': 2}, {'a': 3}]" },
      { description: "Order descending", assertion: "assert select([{'a': 1}, {'a': 3}, {'a': 2}], order_by=('a', 'desc')) == [{'a': 3}, {'a': 2}, {'a': 1}]" },
      { description: "Where + order + limit", assertion: "assert select([{'a': 3}, {'a': 1}, {'a': 2}], where=('a', '>=', 2), order_by=('a', 'asc'), limit=1) == [{'a': 2}]" },
    ],
  },
  {
    slug: "ab-sample-size",
    title: "A/B Test Sample Size",
    description:
      "Write `per_arm(baseline, mde, alpha_z=1.96, power_z=0.84)` returning the required sample size per arm, rounded up. Use `n = 2 * (alpha_z + power_z)**2 * p * (1 - p) / mde**2` where `p = baseline` and `mde` is the absolute minimum detectable effect. If baseline or mde is 0, return 0.",
    difficulty: 3,
    starterCode: `import math

def per_arm(baseline, mde, alpha_z=1.96, power_z=0.84):
    # Return int
    pass
`,
    solutionHint:
      "Guard zero. n = 2 * (alpha_z + power_z)**2 * baseline * (1 - baseline) / mde**2. Return math.ceil(n).",
    skillSlugs: ["ab-testing"],
    testCases: [
      { description: "Zero baseline", assertion: "assert per_arm(0, 0.01) == 0" },
      { description: "Zero MDE", assertion: "assert per_arm(0.1, 0) == 0" },
      { description: "5% baseline, 1% MDE", assertion: "assert per_arm(0.05, 0.01) == 7910" },
      { description: "Bigger MDE → smaller n", assertion: "assert per_arm(0.05, 0.02) < per_arm(0.05, 0.01)" },
      { description: "Returns int", assertion: "assert isinstance(per_arm(0.1, 0.01), int)" },
    ],
  },
  {
    slug: "ols-fit",
    title: "Ordinary Least Squares (Simple)",
    description:
      "Write `ols(xs, ys)` returning `(slope, intercept)` for the least-squares line through paired values. If `xs` has zero variance, return `(0.0, mean(ys))`. Empty input returns `(0.0, 0.0)`.",
    difficulty: 3,
    starterCode: `def ols(xs, ys):
    # Return (slope, intercept)
    pass
`,
    solutionHint:
      "n = len(xs). mx = sum(xs)/n, my = sum(ys)/n. num = sum((x-mx)*(y-my)), den = sum((x-mx)**2). slope = num/den, intercept = my - slope * mx. Guard den == 0.",
    skillSlugs: ["regression-analysis"],
    testCases: [
      { description: "Empty", assertion: "assert ols([], []) == (0.0, 0.0)" },
      { description: "y = 2x", assertion: "s, i = ols([1, 2, 3], [2, 4, 6])\\nassert abs(s - 2.0) < 1e-9 and abs(i) < 1e-9" },
      { description: "y = 2x + 1", assertion: "s, i = ols([0, 1, 2], [1, 3, 5])\\nassert abs(s - 2.0) < 1e-9 and abs(i - 1.0) < 1e-9" },
      { description: "Zero variance → horizontal", assertion: "s, i = ols([3, 3, 3], [5, 6, 7])\\nassert s == 0.0 and abs(i - 6.0) < 1e-9" },
    ],
  },
  {
    slug: "audience-summary",
    title: "Audience-Tailored Summary",
    description:
      "Write `summarize(audience, facts)` where `audience` is `'exec' | 'engineer' | 'analyst'` and `facts` is `{'metric': str, 'value': float, 'method': str, 'caveat': str}`. Return a single string. Rules: `'exec'` → `\"<metric>: <value>\"` (no method, no caveat); `'analyst'` → `\"<metric>: <value> (<method>)\"` (method, no caveat); `'engineer'` → `\"<metric>: <value> (<method>) — caveat: <caveat>\"` (all three). Unknown audience falls back to `'analyst'` format.",
    difficulty: 4,
    starterCode: `def summarize(audience, facts):
    # Return a formatted string
    pass
`,
    solutionHint:
      "Build the string incrementally based on audience. Default to analyst-format for unknown audiences.",
    skillSlugs: ["data-science-communication"],
    testCases: [
      { description: "Exec — metric + value only", assertion: "assert summarize('exec', {'metric': 'Churn', 'value': 0.05, 'method': 'cohort', 'caveat': 'small n'}) == 'Churn: 0.05'" },
      { description: "Analyst adds method in parens", assertion: "assert summarize('analyst', {'metric': 'Churn', 'value': 0.05, 'method': 'cohort', 'caveat': 'small n'}) == 'Churn: 0.05 (cohort)'" },
      { description: "Engineer appends caveat", assertion: "assert summarize('engineer', {'metric': 'Churn', 'value': 0.05, 'method': 'cohort', 'caveat': 'small n'}) == 'Churn: 0.05 (cohort) — caveat: small n'" },
      { description: "Unknown audience defaults to analyst", assertion: "assert summarize('ceo', {'metric': 'X', 'value': 1, 'method': 'm', 'caveat': 'c'}) == 'X: 1 (m)'" },
    ],
  },
  {
    slug: "drift-detector",
    title: "Simple Feature Drift Detector",
    description:
      "Write `drift(reference, live, threshold)` returning a list of column names that have drifted. `reference` and `live` are dicts mapping column → list of numbers. A column has drifted if the absolute difference between its reference mean and live mean exceeds `threshold`. Skip columns that aren't present in both dicts. Return drifted column names sorted alphabetically.",
    difficulty: 4,
    starterCode: `def drift(reference, live, threshold):
    # Return sorted list of drifted column names
    pass
`,
    solutionHint:
      "For each col in reference that's also in live: mean_ref = sum/len, mean_live = sum/len. If abs(diff) > threshold, add to a list. Sort and return.",
    skillSlugs: ["ml-in-production"],
    testCases: [
      { description: "Empty", assertion: "assert drift({}, {}, 0.1) == []" },
      { description: "No drift", assertion: "assert drift({'x': [1, 2, 3]}, {'x': [1.05, 2.05, 3.05]}, 0.5) == []" },
      { description: "Single drifted column", assertion: "assert drift({'x': [1, 2, 3]}, {'x': [10, 11, 12]}, 0.5) == ['x']" },
      { description: "Multiple drifted, sorted", assertion: "assert drift({'a': [1, 1], 'b': [1, 1], 'z': [1, 1]}, {'a': [9, 9], 'b': [1, 1], 'z': [9, 9]}, 0.5) == ['a', 'z']" },
      { description: "Column missing from live is skipped", assertion: "assert drift({'x': [1], 'y': [1]}, {'x': [100]}, 0.5) == ['x']" },
    ],
  },
];

async function main() {
  console.log("Seeding data-scientist practical batch 3...\n");

  const domain = await prisma.domain.findUnique({
    where: { slug: "data-scientist" },
  });
  if (!domain) {
    console.error("data-scientist domain not found");
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
