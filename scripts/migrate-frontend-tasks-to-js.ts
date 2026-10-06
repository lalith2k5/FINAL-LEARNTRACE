import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type TestCase = { description: string; assertion: string };
type TaskUpdate = {
  slug: string;
  language: string;
  starterCode: string;
  testCases: TestCase[];
};

const UPDATES: TaskUpdate[] = [
  {
    slug: "dedupe-array",
    language: "javascript",
    starterCode: `function dedupe(xs) {
  // Return a new array with duplicates removed, preserving first-occurrence order
  return [];
}
`,
    testCases: [
      { description: "Basic", assertion: "assertEqual(dedupe([1, 2, 2, 3, 1]), [1, 2, 3])" },
      { description: "Preserve order", assertion: "assertEqual(dedupe([3, 1, 3, 2, 1]), [3, 1, 2])" },
      { description: "Empty", assertion: "assertEqual(dedupe([]), [])" },
    ],
  },
  {
    slug: "deep-equal",
    language: "javascript",
    starterCode: `function deepEqual(a, b) {
  // Return true if a and b are structurally equal
  return false;
}
`,
    testCases: [
      { description: "Primitives", assertion: "assert(deepEqual(1, 1) === true); assert(deepEqual(1, 2) === false)" },
      { description: "Nested arrays", assertion: "assert(deepEqual([1, [2, 3]], [1, [2, 3]]) === true)" },
      { description: "Nested objects differ", assertion: "assert(deepEqual({a: [1]}, {a: [2]}) === false)" },
    ],
  },
  {
    slug: "slugify",
    language: "javascript",
    starterCode: `function slugify(s) {
  // Return a URL-safe slug
  return "";
}
`,
    testCases: [
      { description: "Basic", assertion: "assertEqual(slugify('Hello World'), 'hello-world')" },
      { description: "Punctuation stripped", assertion: "assertEqual(slugify('Hello, World!'), 'hello-world')" },
      { description: "Collapse whitespace", assertion: "assertEqual(slugify('  a   b  '), 'a-b')" },
    ],
  },
  {
    slug: "format-currency",
    language: "javascript",
    starterCode: `function formatCurrency(amount, symbol = '$') {
  // Return a formatted currency string
  return "";
}
`,
    testCases: [
      { description: "Integer", assertion: "assertEqual(formatCurrency(1234), '$1,234.00')" },
      { description: "Decimal", assertion: "assertEqual(formatCurrency(1234.5), '$1,234.50')" },
      { description: "Negative", assertion: "assertEqual(formatCurrency(-50), '-$50.00')" },
    ],
  },
  {
    slug: "chunk-array",
    language: "javascript",
    starterCode: `function chunk(xs, size) {
  // Return an array of chunks
  return [];
}
`,
    testCases: [
      { description: "Even split", assertion: "assertEqual(chunk([1,2,3,4], 2), [[1,2],[3,4]])" },
      { description: "Uneven", assertion: "assertEqual(chunk([1,2,3,4,5], 2), [[1,2],[3,4],[5]])" },
      { description: "Empty", assertion: "assertEqual(chunk([], 3), [])" },
    ],
  },
  {
    slug: "group-by",
    language: "javascript",
    starterCode: `function groupBy(items, key) {
  // Return an object mapping each key value to an array of items
  return {};
}
`,
    testCases: [
      { description: "Group by category", assertion: "assertEqual(groupBy([{c:'a',v:1},{c:'b',v:2},{c:'a',v:3}], 'c'), {a: [{c:'a',v:1},{c:'a',v:3}], b: [{c:'b',v:2}]})" },
      { description: "Empty input", assertion: "assertEqual(groupBy([], 'x'), {})" },
      { description: "Single group", assertion: "assertEqual(groupBy([{k:1},{k:1}], 'k'), {1: [{k:1},{k:1}]})" },
    ],
  },
  {
    slug: "flatten-deep-array",
    language: "javascript",
    starterCode: `function flattenDeep(xs) {
  // Return a fully flattened array
  return [];
}
`,
    testCases: [
      { description: "Two levels", assertion: "assertEqual(flattenDeep([1, [2, 3], 4]), [1, 2, 3, 4])" },
      { description: "Three levels", assertion: "assertEqual(flattenDeep([1, [2, [3, [4]]]]), [1, 2, 3, 4])" },
      { description: "Empty", assertion: "assertEqual(flattenDeep([]), [])" },
    ],
  },
  {
    slug: "capitalize-title",
    language: "javascript",
    starterCode: `function titleCase(s) {
  // Return the string in Title Case
  return "";
}
`,
    testCases: [
      { description: "Basic", assertion: "assertEqual(titleCase('hello world'), 'Hello World')" },
      { description: "Mixed case input", assertion: "assertEqual(titleCase('HELLO world'), 'Hello World')" },
      { description: "Single word", assertion: "assertEqual(titleCase('python'), 'Python')" },
    ],
  },
  {
    slug: "count-occurrences",
    language: "javascript",
    starterCode: `function count(xs) {
  // Return an object mapping each unique element to its frequency
  return {};
}
`,
    testCases: [
      { description: "Basic", assertion: "assertEqual(count(['a','b','a','c','a']), {a: 3, b: 1, c: 1})" },
      { description: "Empty", assertion: "assertEqual(count([]), {})" },
      { description: "Numbers", assertion: "assertEqual(count([1, 1, 2]), {1: 2, 2: 1})" },
    ],
  },
  {
    slug: "clamp-number",
    language: "javascript",
    starterCode: `function clamp(n, lo, hi) {
  // Return n bounded to [lo, hi]
  return n;
}
`,
    testCases: [
      { description: "In range", assertion: "assertEqual(clamp(5, 1, 10), 5)" },
      { description: "Below", assertion: "assertEqual(clamp(-3, 0, 10), 0)" },
      { description: "Above", assertion: "assertEqual(clamp(100, 0, 10), 10)" },
    ],
  },
];

async function main() {
  const domain = await prisma.domain.findUnique({
    where: { slug: "frontend-engineer" },
  });
  if (!domain) {
    console.error("frontend-engineer domain not found");
    process.exit(1);
  }

  let updated = 0;
  for (const u of UPDATES) {
    const r = await prisma.practicalTask.updateMany({
      where: { domainId: domain.id, slug: u.slug },
      data: {
        language: u.language,
        starterCode: u.starterCode,
        testCases: u.testCases as never,
      },
    });
    console.log(`  ${u.slug}: ${r.count} row(s) -> ${u.language}`);
    updated += r.count;
  }
  console.log(`\nTotal updated: ${updated}`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
