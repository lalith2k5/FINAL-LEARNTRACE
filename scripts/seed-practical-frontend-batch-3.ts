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
  language?: string;
  starterCode: string;
  solutionHint: string;
  skillSlugs: string[];
  testCases: TestCase[];
};

const TASKS: Task[] = [
  {
    slug: "extract-html-tags",
    title: "Extract HTML Tags",
    description:
      "Write `extractTags(html)` that returns a sorted array of unique lowercase tag names found in an HTML string. Ignore closing tags (`</div>`), comments, and self-closing slashes. Only capture the tag name immediately after `<`.",
    difficulty: 1,
    language: "javascript",
    starterCode: `function extractTags(html) {
  // Return a sorted array of unique lowercase tag names
  return [];
}
`,
    solutionHint:
      "Match /<([a-zA-Z][a-zA-Z0-9]*)\\b/g and skip captures that are preceded by '/'. Lowercase and dedupe with a Set.",
    skillSlugs: ["html-fundamentals"],
    testCases: [
      { description: "Empty input", assertion: "assertEqual(extractTags(''), [])" },
      { description: "Single tag", assertion: "assertEqual(extractTags('<div></div>'), ['div'])" },
      { description: "Multiple unique tags, sorted", assertion: "assertEqual(extractTags('<div><span></span><a></a></div>'), ['a', 'div', 'span'])" },
      { description: "Case normalized", assertion: "assertEqual(extractTags('<DIV><Span></SPAN></DIV>'), ['div', 'span'])" },
      { description: "Attributes ignored", assertion: "assertEqual(extractTags('<button class=\"x\" data-y=\"z\"></button>'), ['button'])" },
    ],
  },
  {
    slug: "css-specificity",
    title: "CSS Selector Specificity",
    description:
      "Write `specificity(selector)` that returns `[a, b, c]` where `a` = number of ID selectors (`#foo`), `b` = number of class/attribute/pseudo-class selectors (`.foo`, `[attr]`, `:hover`), `c` = number of element/pseudo-element selectors (`div`, `::before`). Handle comma-separated selectors by returning the specificity of the *highest* one.",
    difficulty: 1,
    language: "javascript",
    starterCode: `function specificity(selector) {
  // Return [a, b, c]
  return [0, 0, 0];
}
`,
    solutionHint:
      "Split on ','. For each part, count occurrences: /#[\\w-]+/g → a; /\\.[\\w-]+/g + /\\[[^\\]]+\\]/g + /(?<!:):(?!:)[\\w-]+/g → b; /::[\\w-]+/g + remaining tag names → c. Compare with lexicographic order.",
    skillSlugs: ["css-fundamentals"],
    testCases: [
      { description: "Plain element", assertion: "assertEqual(specificity('div'), [0, 0, 1])" },
      { description: "Single class", assertion: "assertEqual(specificity('.btn'), [0, 1, 0])" },
      { description: "Single ID", assertion: "assertEqual(specificity('#main'), [1, 0, 0])" },
      { description: "Class + element", assertion: "assertEqual(specificity('ul li a'), [0, 0, 3])" },
      { description: "Class + element beats elements", assertion: "assertEqual(specificity('.nav a'), [0, 1, 1])" },
      { description: "Comma-separated returns highest", assertion: "assertEqual(specificity('div, #main, .btn'), [1, 0, 0])" },
    ],
  },
  {
    slug: "three-way-merge-conflict",
    title: "Three-Way Merge Conflict Detector",
    description:
      "Write `hasConflict(base, mine, theirs)` that returns true only when *both* sides changed the same line to different values. If one side matches `base`, that side didn't change it and the other side wins.",
    difficulty: 1,
    language: "javascript",
    starterCode: `function hasConflict(base, mine, theirs) {
  // Return true if both sides changed base to different values
  return false;
}
`,
    solutionHint:
      "Only case that is a conflict: mine !== base AND theirs !== base AND mine !== theirs.",
    skillSlugs: ["git-version-control"],
    testCases: [
      { description: "Only mine changed", assertion: "assert(hasConflict('a', 'b', 'a') === false)" },
      { description: "Only theirs changed", assertion: "assert(hasConflict('a', 'a', 'b') === false)" },
      { description: "Both changed to same value", assertion: "assert(hasConflict('a', 'b', 'b') === false)" },
      { description: "Both changed differently", assertion: "assert(hasConflict('a', 'b', 'c') === true)" },
      { description: "Neither changed", assertion: "assert(hasConflict('a', 'a', 'a') === false)" },
    ],
  },
  {
    slug: "parse-media-query",
    title: "Parse a Media Query",
    description:
      "Write `parseMediaQuery(query)` that extracts the min-width and max-width constraints from a CSS media query string like `\"(min-width: 768px) and (max-width: 1024px)\"`. Return `{ minWidth: number | null, maxWidth: number | null }` in pixels (numbers, not strings).",
    difficulty: 2,
    language: "javascript",
    starterCode: `function parseMediaQuery(query) {
  // Return { minWidth, maxWidth } or null for missing constraints
  return { minWidth: null, maxWidth: null };
}
`,
    solutionHint:
      "Regex /min-width:\\s*(\\d+)/ and /max-width:\\s*(\\d+)/. Return null if no match.",
    skillSlugs: ["responsive-design"],
    testCases: [
      { description: "Empty query", assertion: "assertEqual(parseMediaQuery(''), {minWidth: null, maxWidth: null})" },
      { description: "Only min-width", assertion: "assertEqual(parseMediaQuery('(min-width: 768px)'), {minWidth: 768, maxWidth: null})" },
      { description: "Only max-width", assertion: "assertEqual(parseMediaQuery('(max-width: 1024px)'), {minWidth: null, maxWidth: 1024})" },
      { description: "Both, with and clause", assertion: "assertEqual(parseMediaQuery('(min-width: 768px) and (max-width: 1024px)'), {minWidth: 768, maxWidth: 1024})" },
      { description: "No spaces around colon", assertion: "assertEqual(parseMediaQuery('(min-width:480px)'), {minWidth: 480, maxWidth: null})" },
    ],
  },
  {
    slug: "resolve-css-var",
    title: "Resolve CSS Custom Property",
    description:
      "Write `resolveVar(styles, name, fallback)` where `styles` is a flat `{ '--foo': 'value' }` object. Resolve `name` (e.g. `'--color'`) and, if its value contains `var(--other)`, recursively resolve. Return the fallback when the variable is undefined. Detect cycles (return `''`).",
    difficulty: 3,
    language: "javascript",
    starterCode: `function resolveVar(styles, name, fallback = '') {
  // Return the fully resolved value
  return fallback;
}
`,
    solutionHint:
      "Keep a seen Set of names. If name not in styles, return fallback. If name in seen, return ''. Parse value: if it matches /^var\\((--[\\w-]+)\\)$/, recurse. Else return the literal value.",
    skillSlugs: ["css-architecture"],
    testCases: [
      { description: "Direct value", assertion: "assertEqual(resolveVar({'--color': 'red'}, '--color'), 'red')" },
      { description: "Undefined → fallback", assertion: "assertEqual(resolveVar({}, '--x', 'blue'), 'blue')" },
      { description: "Single indirection", assertion: "assertEqual(resolveVar({'--a': 'var(--b)', '--b': 'green'}, '--a'), 'green')" },
      { description: "Double indirection", assertion: "assertEqual(resolveVar({'--a': 'var(--b)', '--b': 'var(--c)', '--c': '#fff'}, '--a'), '#fff')" },
      { description: "Cycle returns empty string", assertion: "assertEqual(resolveVar({'--a': 'var(--b)', '--b': 'var(--a)'}, '--a'), '')" },
    ],
  },
  {
    slug: "tree-shake",
    title: "Tree-Shake a Module Graph",
    description:
      "Write `reachable(entry, graph)` that returns a sorted array of module names reachable from `entry` via imports. `graph` is `{ moduleName: [importedModule, ...] }`. Ignore imports that aren't keys in the graph. Include `entry` if it exists in the graph.",
    difficulty: 4,
    language: "javascript",
    starterCode: `function reachable(entry, graph) {
  // Return a sorted array of reachable module names
  return [];
}
`,
    solutionHint:
      "DFS from entry. Skip undefined nodes. Track visited in a Set. Return Array.from(set).sort().",
    skillSlugs: ["build-tools"],
    testCases: [
      { description: "Empty graph", assertion: "assertEqual(reachable('a', {}), [])" },
      { description: "Single entry no imports", assertion: "assertEqual(reachable('a', {a: []}), ['a'])" },
      { description: "Linear chain", assertion: "assertEqual(reachable('a', {a: ['b'], b: ['c'], c: []}), ['a', 'b', 'c'])" },
      { description: "Diamond deduped", assertion: "assertEqual(reachable('a', {a: ['b', 'c'], b: ['d'], c: ['d'], d: []}), ['a', 'b', 'c', 'd'])" },
      { description: "Missing imports skipped", assertion: "assertEqual(reachable('a', {a: ['b', 'missing']}), ['a'])" },
    ],
  },
  {
    slug: "core-web-vitals",
    title: "Compute TTFB from Navigation Timing",
    description:
      "Write `ttfbMs(timing)` where `timing` is `{ startTime, responseStart }` (in ms) — the standard Navigation Timing shape. Return the rounded TTFB in milliseconds. If `responseStart` is 0 (page did not start receiving a response), return `-1`.",
    difficulty: 4,
    language: "javascript",
    starterCode: `function ttfbMs(timing) {
  // Return responseStart - startTime, rounded; or -1 if responseStart === 0
  return 0;
}
`,
    solutionHint:
      "If timing.responseStart === 0, return -1. Else Math.round(timing.responseStart - timing.startTime).",
    skillSlugs: ["web-performance"],
    testCases: [
      { description: "Typical values", assertion: "assertEqual(ttfbMs({startTime: 0, responseStart: 120}), 120)" },
      { description: "Non-zero start", assertion: "assertEqual(ttfbMs({startTime: 50, responseStart: 200}), 150)" },
      { description: "Zero responseStart → -1", assertion: "assertEqual(ttfbMs({startTime: 0, responseStart: 0}), -1)" },
      { description: "Rounds to nearest int", assertion: "assertEqual(ttfbMs({startTime: 0, responseStart: 100.6}), 101)" },
    ],
  },
  {
    slug: "micro-frontend-route",
    title: "Route to Micro-Frontend",
    description:
      "Write `routeApp(path, mounts)` where `mounts` is an array of `{ prefix, app }` sorted by prefix length (longest first is NOT guaranteed — sort yourself). Return the app name whose prefix matches `path` at a path boundary (equal to `path` or followed by `/`). Return `null` if no mount matches.",
    difficulty: 5,
    language: "javascript",
    starterCode: `function routeApp(path, mounts) {
  // Return the app name, or null
  return null;
}
`,
    solutionHint:
      "Sort mounts by prefix length descending. For each, if path === prefix or path.startsWith(prefix + '/'), return app.",
    skillSlugs: ["frontend-architecture"],
    testCases: [
      { description: "Empty mounts", assertion: "assertEqual(routeApp('/dashboard', []), null)" },
      { description: "Exact match", assertion: "assertEqual(routeApp('/dashboard', [{prefix: '/dashboard', app: 'dash'}]), 'dash')" },
      { description: "Prefix match with boundary", assertion: "assertEqual(routeApp('/dashboard/settings', [{prefix: '/dashboard', app: 'dash'}]), 'dash')" },
      { description: "Longer prefix wins", assertion: "assertEqual(routeApp('/admin/users', [{prefix: '/admin', app: 'admin'}, {prefix: '/admin/users', app: 'users'}]), 'users')" },
      { description: "Boundary respected — /dash not matching /dashboard", assertion: "assertEqual(routeApp('/dashboard', [{prefix: '/dash', app: 'dash'}]), null)" },
      { description: "No match", assertion: "assertEqual(routeApp('/login', [{prefix: '/dashboard', app: 'dash'}]), null)" },
    ],
  },
];

async function main() {
  console.log("Seeding frontend-engineer practical batch 3...\n");

  const domain = await prisma.domain.findUnique({
    where: { slug: "frontend-engineer" },
  });
  if (!domain) {
    console.error("frontend-engineer domain not found");
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
        language: "javascript",
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
