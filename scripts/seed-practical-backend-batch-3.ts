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
    slug: "git-branches-sim",
    title: "Simulate Git Branches",
    description:
      "Write `git_branches(ops)` that simulates branch creation and commits. `ops` is a list of tuples: `('commit', msg)` appends `msg` to the current branch's history; `('checkout', name)` switches to `name`, creating it (as a copy of the current branch's history) if it doesn't exist. Start on branch `'main'` with empty history. Return a dict mapping every branch name to its list of commit messages.",
    difficulty: 1,
    starterCode: `def git_branches(ops):
    # Return {branch_name: [msg, ...]}
    pass
`,
    solutionHint:
      "Keep current = 'main' and branches = {'main': []}. On checkout, if name not in branches, copy the current branch's history list. On commit, append msg to branches[current].",
    skillSlugs: ["git-version-control"],
    testCases: [
      { description: "Empty ops → main exists, empty", assertion: "assert git_branches([]) == {'main': []}" },
      { description: "Commit on main", assertion: "assert git_branches([('commit', 'a')]) == {'main': ['a']}" },
      { description: "Branch inherits current history", assertion: "assert git_branches([('commit', 'a'), ('checkout', 'dev'), ('commit', 'b')]) == {'main': ['a'], 'dev': ['a', 'b']}" },
      { description: "Switch back, commit on main", assertion: "assert git_branches([('commit', 'a'), ('checkout', 'dev'), ('commit', 'b'), ('checkout', 'main'), ('commit', 'c')]) == {'main': ['a', 'c'], 'dev': ['a', 'b']}" },
    ],
  },
  {
    slug: "dockerfile-parse",
    title: "Parse a Dockerfile",
    description:
      "Write `parse_dockerfile(text)` that extracts EXPOSE ports and ENTRYPOINT from a Dockerfile string. `EXPOSE` takes one or more space-separated integer ports. `ENTRYPOINT` takes a JSON array of strings. Return `{'ports': [...], 'entrypoint': [...]}`. Ignore other instructions.",
    difficulty: 3,
    starterCode: `import json

def parse_dockerfile(text):
    # Return {'ports': [int, ...], 'entrypoint': [str, ...]}
    pass
`,
    solutionHint:
      "Split text into lines. If a line starts with 'EXPOSE ', int-parse the remaining tokens. If it starts with 'ENTRYPOINT ', json.loads the remainder.",
    skillSlugs: ["docker"],
    testCases: [
      { description: "Empty Dockerfile", assertion: "assert parse_dockerfile('') == {'ports': [], 'entrypoint': []}" },
      { description: "Single EXPOSE port", assertion: "assert parse_dockerfile('EXPOSE 80\\n') == {'ports': [80], 'entrypoint': []}" },
      { description: "Multiple EXPOSE ports", assertion: "assert parse_dockerfile('EXPOSE 80 443\\n') == {'ports': [80, 443], 'entrypoint': []}" },
      { description: "ENTRYPOINT JSON array", assertion: "assert parse_dockerfile('ENTRYPOINT [\"python\", \"app.py\"]\\n') == {'ports': [], 'entrypoint': ['python', 'app.py']}" },
      { description: "Full Dockerfile", assertion: "assert parse_dockerfile('FROM python:3.11\\nEXPOSE 8080\\nCMD [\"x\"]\\nENTRYPOINT [\"python\", \"-m\", \"app\"]\\n') == {'ports': [8080], 'entrypoint': ['python', '-m', 'app']}" },
    ],
  },
  {
    slug: "ci-trigger-match",
    title: "CI Workflow Trigger Match",
    description:
      "Write `should_trigger(workflow, event)` where `workflow` is `{'on': {event_type: config}}` and `event` is `{'type': ..., 'branch': ...}`. Return True iff `event['type']` is a key in `workflow['on']` and, if that trigger has a `'branches'` list, `event['branch']` matches at least one pattern. A pattern matches if it equals the branch or ends in `/*` and the branch starts with the prefix before `*`. If no `'branches'` key is present, any branch matches.",
    difficulty: 3,
    starterCode: `def should_trigger(workflow, event):
    # Return True or False
    pass
`,
    solutionHint:
      "Check event['type'] in workflow['on']. Get cfg = workflow['on'][event['type']]. If 'branches' not in cfg, return True. Else return any(match(p, event['branch']) for p in cfg['branches']), where match handles 'prefix/*'.",
    skillSlugs: ["ci-cd"],
    testCases: [
      { description: "Literal branch match", assertion: "assert should_trigger({'on': {'push': {'branches': ['main']}}}, {'type': 'push', 'branch': 'main'}) is True" },
      { description: "Branch does not match", assertion: "assert should_trigger({'on': {'push': {'branches': ['main']}}}, {'type': 'push', 'branch': 'dev'}) is False" },
      { description: "Wildcard pattern", assertion: "assert should_trigger({'on': {'push': {'branches': ['release/*']}}}, {'type': 'push', 'branch': 'release/1.2'}) is True" },
      { description: "Wildcard does not match other prefix", assertion: "assert should_trigger({'on': {'push': {'branches': ['release/*']}}}, {'type': 'push', 'branch': 'hotfix/1.2'}) is False" },
      { description: "Event type missing from workflow", assertion: "assert should_trigger({'on': {'pull_request': {}}}, {'type': 'push', 'branch': 'main'}) is False" },
      { description: "No branches filter → always match", assertion: "assert should_trigger({'on': {'push': {}}}, {'type': 'push', 'branch': 'anything'}) is True" },
    ],
  },
  {
    slug: "queue-at-least-once",
    title: "At-Least-Once Queue Delivery",
    description:
      "Write `process_queue(ids, success_after)` that simulates at-least-once delivery. `ids` is a list of message IDs; `success_after` maps each ID to the attempt number on which it succeeds (1-indexed). An `success_after` value of `0` means the message never succeeds and is delivered exactly once before being dead-lettered. Return a dict mapping each ID to its total delivery count.",
    difficulty: 3,
    starterCode: `def process_queue(ids, success_after):
    # Return {id: delivery_count}
    pass
`,
    solutionHint:
      "For each id: if success_after[id] == 0, record 1 delivery (DLQ). Otherwise record success_after[id] deliveries.",
    skillSlugs: ["message-queues"],
    testCases: [
      { description: "Succeeds on first try", assertion: "assert process_queue(['a'], {'a': 1}) == {'a': 1}" },
      { description: "Succeeds on third try", assertion: "assert process_queue(['a'], {'a': 3}) == {'a': 3}" },
      { description: "Always fails → DLQ after one delivery", assertion: "assert process_queue(['a'], {'a': 0}) == {'a': 1}" },
      { description: "Two messages, mixed outcomes", assertion: "assert process_queue(['a', 'b'], {'a': 2, 'b': 0}) == {'a': 2, 'b': 1}" },
      { description: "Empty input", assertion: "assert process_queue([], {}) == {}" },
    ],
  },
  {
    slug: "latency-percentiles",
    title: "Latency Percentiles",
    description:
      "Write `latency_stats(samples)` that returns `{'p50': ..., 'p90': ..., 'p99': ..., 'mean': ...}` using the nearest-rank method: sort the samples and take index `ceil(p * n) - 1`. Empty input returns all zeros.",
    difficulty: 4,
    starterCode: `import math

def latency_stats(samples):
    # Return {'p50': float, 'p90': float, 'p99': float, 'mean': float}
    pass
`,
    solutionHint:
      "Sort a copy of samples. For percentile p, idx = math.ceil(p * n) - 1, clamped to [0, n-1]. Mean = sum/n.",
    skillSlugs: ["monitoring-observability"],
    testCases: [
      { description: "Empty returns zeros", assertion: "assert latency_stats([]) == {'p50': 0.0, 'p90': 0.0, 'p99': 0.0, 'mean': 0.0}" },
      { description: "Single sample", assertion: "assert latency_stats([100]) == {'p50': 100, 'p90': 100, 'p99': 100, 'mean': 100.0}" },
      { description: "Small sample", assertion: "assert latency_stats([10, 20, 30, 40, 50]) == {'p50': 30, 'p90': 50, 'p99': 50, 'mean': 30.0}" },
      { description: "1..100 range", assertion: "s = latency_stats(list(range(1, 101)))\\nassert s['p50'] == 50 and s['p90'] == 90 and s['p99'] == 99 and abs(s['mean'] - 50.5) < 1e-9" },
    ],
  },
  {
    slug: "bottleneck-service",
    title: "Find the Bottleneck Service",
    description:
      "Write `find_bottleneck(requests)` where `requests` is a list of dicts, each `{'services': [(name, latency_ms), ...]}`. Aggregate per service: total time and request count. Return the name of the service with the highest mean latency. Ties resolve to the lexicographically smaller name. Empty input returns `None`.",
    difficulty: 5,
    starterCode: `def find_bottleneck(requests):
    # Return the service name with the highest mean latency, or None
    pass
`,
    solutionHint:
      "Accumulate totals = {name: [sum, count]}. Compute mean per service, pick max, tie-break with sorted(name).",
    skillSlugs: ["system-design"],
    testCases: [
      { description: "Empty input", assertion: "assert find_bottleneck([]) is None" },
      { description: "Single request, one service", assertion: "assert find_bottleneck([{'services': [('a', 10), ('b', 20)]}]) == 'b'" },
      { description: "Aggregate across requests", assertion: "assert find_bottleneck([{'services': [('a', 10)]}, {'services': [('a', 20), ('b', 5)]}]) == 'a'" },
      { description: "Tie → lexicographically first", assertion: "assert find_bottleneck([{'services': [('z', 10), ('a', 10)]}]) == 'a'" },
    ],
  },
];

async function main() {
  console.log("Seeding backend-engineer practical batch 3...\n");

  const domain = await prisma.domain.findUnique({
    where: { slug: "backend-engineer" },
  });
  if (!domain) {
    console.error("backend-engineer domain not found");
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
