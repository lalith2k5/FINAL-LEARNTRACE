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
    slug: "vlookup-sim",
    title: "VLOOKUP Simulator",
    description:
      "Write `vlookup(table, key, col_index, exact=True)` that emulates spreadsheet VLOOKUP. `table` is a list of rows (lists). The lookup key is column 0. `col_index` is 1-based. With `exact=True`, return the value at that column of the first row whose column 0 equals `key`. With `exact=False`, assume the table is sorted ascending on column 0 and return the value from the largest key ≤ `key` (approximate match). Return `None` if no match.",
    difficulty: 1,
    starterCode: `def vlookup(table, key, col_index, exact=True):
    # Return the looked-up value, or None
    pass
`,
    solutionHint:
      "Exact: linear scan for row[0] == key. Approximate: track the best match (largest row[0] <= key) while scanning. col_index is 1-based → table[row][col_index - 1].",
    skillSlugs: ["spreadsheet-analysis"],
    testCases: [
      { description: "Exact match, first row", assertion: "assert vlookup([['a', 1], ['b', 2]], 'a', 2) == 1" },
      { description: "Exact match, later row", assertion: "assert vlookup([['a', 1], ['b', 2], ['c', 3]], 'c', 2) == 3" },
      { description: "Exact match missing", assertion: "assert vlookup([['a', 1]], 'z', 2) is None" },
      { description: "Approximate match", assertion: "assert vlookup([['a', 1], ['c', 3], ['e', 5]], 'd', 2, exact=False) == 3" },
      { description: "Approximate below range", assertion: "assert vlookup([['b', 2], ['c', 3]], 'a', 2, exact=False) is None" },
      { description: "Approximate above range returns last", assertion: "assert vlookup([['a', 1], ['b', 2]], 'z', 2, exact=False) == 2" },
    ],
  },
  {
    slug: "suggest-chart",
    title: "Suggest a Chart Type",
    description:
      "Write `suggest_chart(features)` where `features` is `{'num_numeric': int, 'num_categorical': int, 'has_time': bool, 'n_rows': int}`. Rules, applied in order: 1) if `has_time` and `num_numeric >= 1`, return `'line'`; 2) if `num_categorical == 1` and `num_numeric == 1` and `n_rows <= 10`, return `'pie'`; 3) if `num_numeric >= 2`, return `'scatter'`; 4) if `num_numeric == 1`, return `'histogram'`; 5) otherwise return `'bar'`.",
    difficulty: 2,
    starterCode: `def suggest_chart(features):
    # Return a chart-type string
    pass
`,
    solutionHint:
      "Follow the rules in order. Return the first one that matches.",
    skillSlugs: ["data-visualization"],
    testCases: [
      { description: "Time series", assertion: "assert suggest_chart({'num_numeric': 1, 'num_categorical': 0, 'has_time': True, 'n_rows': 100}) == 'line'" },
      { description: "Small categorical + numeric", assertion: "assert suggest_chart({'num_numeric': 1, 'num_categorical': 1, 'has_time': False, 'n_rows': 5}) == 'pie'" },
      { description: "Two numerics", assertion: "assert suggest_chart({'num_numeric': 2, 'num_categorical': 0, 'has_time': False, 'n_rows': 500}) == 'scatter'" },
      { description: "Single numeric", assertion: "assert suggest_chart({'num_numeric': 1, 'num_categorical': 0, 'has_time': False, 'n_rows': 1000}) == 'histogram'" },
      { description: "Categorical only", assertion: "assert suggest_chart({'num_numeric': 0, 'num_categorical': 1, 'has_time': False, 'n_rows': 50}) == 'bar'" },
      { description: "Time + numeric beats pie", assertion: "assert suggest_chart({'num_numeric': 1, 'num_categorical': 1, 'has_time': True, 'n_rows': 5}) == 'line'" },
    ],
  },
  {
    slug: "groupby-agg",
    title: "Group By and Aggregate",
    description:
      "Write `groupby_sum(rows, key, value)` where `rows` is a list of dicts. Return a dict mapping each distinct `row[key]` to the sum of `row[value]`. Skip rows where `key` or `value` is missing.",
    difficulty: 2,
    starterCode: `def groupby_sum(rows, key, value):
    # Return {key_value: sum_of_value}
    pass
`,
    solutionHint:
      "Initialize out = {}. For each row, check both fields are present, then out[row[key]] = out.get(row[key], 0) + row[value].",
    skillSlugs: ["python-for-analysts"],
    testCases: [
      { description: "Empty input", assertion: "assert groupby_sum([], 'k', 'v') == {}" },
      { description: "Single group", assertion: "assert groupby_sum([{'k': 'a', 'v': 1}, {'k': 'a', 'v': 2}], 'k', 'v') == {'a': 3}" },
      { description: "Multiple groups", assertion: "assert groupby_sum([{'k': 'a', 'v': 1}, {'k': 'b', 'v': 2}, {'k': 'a', 'v': 3}], 'k', 'v') == {'a': 4, 'b': 2}" },
      { description: "Missing key skipped", assertion: "assert groupby_sum([{'k': 'a', 'v': 1}, {'v': 5}], 'k', 'v') == {'a': 1}" },
      { description: "Missing value skipped", assertion: "assert groupby_sum([{'k': 'a', 'v': 1}, {'k': 'b'}], 'k', 'v') == {'a': 1}" },
    ],
  },
  {
    slug: "rfm-segment",
    title: "RFM Segment Classifier",
    description:
      "Write `rfm_segment(days_since_last, num_orders, total_spend)` that returns `'champion' | 'loyal' | 'at_risk' | 'new' | 'other'` per these rules (first match wins): `'champion'` if `days_since_last <= 30` and `num_orders >= 5` and `total_spend >= 500`; `'loyal'` if `num_orders >= 3` and `days_since_last <= 90`; `'at_risk'` if `days_since_last > 90` and `num_orders >= 2`; `'new'` if `num_orders == 1` and `days_since_last <= 30`; otherwise `'other'`.",
    difficulty: 3,
    starterCode: `def rfm_segment(days_since_last, num_orders, total_spend):
    # Return a segment string
    pass
`,
    solutionHint:
      "Chain the four if-checks in order, return the first match, fall through to 'other'.",
    skillSlugs: ["customer-segmentation"],
    testCases: [
      { description: "Champion", assertion: "assert rfm_segment(10, 10, 1000) == 'champion'" },
      { description: "Champion fails on spend", assertion: "assert rfm_segment(10, 10, 100) == 'loyal'" },
      { description: "Loyal", assertion: "assert rfm_segment(60, 4, 200) == 'loyal'" },
      { description: "At risk", assertion: "assert rfm_segment(120, 3, 100) == 'at_risk'" },
      { description: "New", assertion: "assert rfm_segment(5, 1, 20) == 'new'" },
      { description: "Old single order", assertion: "assert rfm_segment(200, 1, 20) == 'other'" },
    ],
  },
  {
    slug: "dashboard-hierarchy",
    title: "Dashboard Visual Hierarchy",
    description:
      "Write `layout(cards)` where each card is `{'id': str, 'importance': int}`. Return a list of IDs ordered by: importance descending, then id ascending as tie-break.",
    difficulty: 3,
    starterCode: `def layout(cards):
    # Return a list of ids
    pass
`,
    solutionHint:
      "sorted(cards, key=lambda c: (-c['importance'], c['id'])). Then map to 'id'.",
    skillSlugs: ["dashboard-design"],
    testCases: [
      { description: "Empty", assertion: "assert layout([]) == []" },
      { description: "Single card", assertion: "assert layout([{'id': 'a', 'importance': 1}]) == ['a']" },
      { description: "By importance desc", assertion: "assert layout([{'id': 'a', 'importance': 1}, {'id': 'b', 'importance': 5}]) == ['b', 'a']" },
      { description: "Ties broken by id", assertion: "assert layout([{'id': 'z', 'importance': 3}, {'id': 'a', 'importance': 3}]) == ['a', 'z']" },
      { description: "Three cards", assertion: "assert layout([{'id': 'x', 'importance': 2}, {'id': 'y', 'importance': 5}, {'id': 'z', 'importance': 5}]) == ['y', 'z', 'x']" },
    ],
  },
  {
    slug: "dimension-vs-measure",
    title: "Classify Dimensions and Measures",
    description:
      "Write `classify(fields)` where `fields` is a list of `{'name': str, 'dtype': 'numeric'|'categorical'|'date', 'cardinality': int}`. Return `{'dimensions': [...], 'measures': [...]}`: `'date'` and `'categorical'` are always dimensions; `'numeric'` is a measure unless `cardinality <= 10` (then it's a dimension — an ID-like code). Names within each list should be sorted alphabetically.",
    difficulty: 3,
    starterCode: `def classify(fields):
    # Return {'dimensions': [...], 'measures': [...]}
    pass
`,
    solutionHint:
      "For each field: dtype date or categorical → dimensions. dtype numeric: if cardinality <= 10 → dimensions, else → measures. Then sort both lists.",
    skillSlugs: ["tableau-power-bi"],
    testCases: [
      { description: "Empty", assertion: "assert classify([]) == {'dimensions': [], 'measures': []}" },
      { description: "Date and categorical → dimensions", assertion: "assert classify([{'name': 'date', 'dtype': 'date', 'cardinality': 365}, {'name': 'city', 'dtype': 'categorical', 'cardinality': 50}]) == {'dimensions': ['city', 'date'], 'measures': []}" },
      { description: "High-card numeric → measure", assertion: "assert classify([{'name': 'revenue', 'dtype': 'numeric', 'cardinality': 10000}]) == {'dimensions': [], 'measures': ['revenue']}" },
      { description: "Low-card numeric → dimension", assertion: "assert classify([{'name': 'region_id', 'dtype': 'numeric', 'cardinality': 5}]) == {'dimensions': ['region_id'], 'measures': []}" },
      { description: "Mixed set, sorted", assertion: "assert classify([{'name': 'b', 'dtype': 'numeric', 'cardinality': 100}, {'name': 'a', 'dtype': 'categorical', 'cardinality': 3}, {'name': 'c', 'dtype': 'numeric', 'cardinality': 2}]) == {'dimensions': ['a', 'c'], 'measures': ['b']}" },
    ],
  },
];

async function main() {
  console.log("Seeding data-analyst practical batch 3...\n");

  const domain = await prisma.domain.findUnique({
    where: { slug: "data-analyst" },
  });
  if (!domain) {
    console.error("data-analyst domain not found");
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
