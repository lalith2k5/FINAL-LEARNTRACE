import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type TestCase = { description: string; assertion: string };
type Task = {
  domainSlug: string;
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
  // ═══════════════════════════════════════════════════════════════
  // BACKEND ENGINEER
  // ═══════════════════════════════════════════════════════════════
  {
    domainSlug: "backend-engineer", slug: "two-sum",
    title: "Two Sum",
    description: "Write `two_sum(nums, target)` that returns the indices of the two numbers that add up to `target`. Assume exactly one solution exists; don't reuse the same element.",
    difficulty: 2,
    starterCode: `def two_sum(nums, target):\n    # Return [i, j] with nums[i] + nums[j] == target\n    pass\n`,
    solutionHint: "Use a hash map from value → index. For each num, check if (target - num) is already in the map.",
    skillSlugs: ["data-structures-and-algorithms"],
    testCases: [
      { description: "[2,7,11,15], target 9 → [0,1]", assertion: "assert sorted(two_sum([2, 7, 11, 15], 9)) == [0, 1]" },
      { description: "[3,2,4], target 6 → [1,2]", assertion: "assert sorted(two_sum([3, 2, 4], 6)) == [1, 2]" },
      { description: "[3,3], target 6 → [0,1]", assertion: "assert sorted(two_sum([3, 3], 6)) == [0, 1]" },
    ],
  },
  {
    domainSlug: "backend-engineer", slug: "lru-cache",
    title: "LRU Cache (Simplified)",
    description: "Write `lru_sim(capacity, ops)` where ops is a list of `(\"get\", key)` or `(\"put\", key, value)`. Return the list of get results (-1 for miss).",
    difficulty: 4,
    starterCode: `def lru_sim(capacity, ops):\n    # Simulate an LRU cache\n    pass\n`,
    solutionHint: "Use collections.OrderedDict. move_to_end on access; popitem(last=False) to evict.",
    skillSlugs: ["caching", "data-structures-and-algorithms"],
    testCases: [
      { description: "Basic get/put", assertion: "assert lru_sim(2, [('put', 1, 1), ('put', 2, 2), ('get', 1)]) == [1]" },
      { description: "Evicts LRU", assertion: "assert lru_sim(2, [('put', 1, 1), ('put', 2, 2), ('put', 3, 3), ('get', 1)]) == [-1]" },
      { description: "Get promotes to MRU", assertion: "assert lru_sim(2, [('put', 1, 1), ('put', 2, 2), ('get', 1), ('put', 3, 3), ('get', 2)]) == [1, -1]" },
    ],
  },
  {
    domainSlug: "backend-engineer", slug: "token-bucket-rate-limit",
    title: "Token Bucket Rate Limiter",
    description: "Write `allow(capacity, rate, timestamps)` that returns a list of booleans — one per request — indicating if it's allowed. Tokens refill at `rate` per second, capped at `capacity`. Start with a full bucket.",
    difficulty: 4,
    starterCode: `def allow(capacity, rate, timestamps):\n    # Return list of bools\n    pass\n`,
    solutionHint: "Track tokens and last_refill_time. On each request, add (now - last) * rate to tokens, cap at capacity, then consume 1 if available.",
    skillSlugs: ["api-design", "caching"],
    testCases: [
      { description: "Two requests fit, third blocked", assertion: "assert allow(2, 1, [0, 0, 0]) == [True, True, False]" },
      { description: "Bucket refills over time", assertion: "assert allow(1, 1, [0, 1]) == [True, True]" },
      { description: "Cap enforced", assertion: "assert allow(2, 10, [0, 0.05]) == [True, True]" },
    ],
  },
  {
    domainSlug: "backend-engineer", slug: "parse-query-string",
    title: "Parse a Query String",
    description: "Write `parse_qs(qs)` that parses a URL query string (without the leading `?`) into a dict. Repeated keys should collect into a list.",
    difficulty: 2,
    starterCode: `def parse_qs(qs):\n    # 'a=1&b=2&a=3' → {'a': ['1', '3'], 'b': '2'}\n    pass\n`,
    solutionHint: "Split on '&', then '='. Collect values; if a key repeats, promote to a list.",
    skillSlugs: ["http-and-rest"],
    testCases: [
      { description: "Single key", assertion: "assert parse_qs('a=1') == {'a': '1'}" },
      { description: "Repeated key → list", assertion: "assert parse_qs('a=1&a=2') == {'a': ['1', '2']}" },
      { description: "Empty string", assertion: "assert parse_qs('') == {}" },
    ],
  },
  {
    domainSlug: "backend-engineer", slug: "paginate-list",
    title: "Paginate a List",
    description: "Write `paginate(items, page, page_size)` that returns the slice for the given 1-indexed page plus metadata: `{'items': [...], 'page': page, 'page_size': page_size, 'total': N, 'has_next': bool}`.",
    difficulty: 2,
    starterCode: `def paginate(items, page, page_size):\n    # Return dict with paginated items and metadata\n    pass\n`,
    solutionHint: "start = (page - 1) * page_size; end = start + page_size. has_next = end < total.",
    skillSlugs: ["api-design"],
    testCases: [
      { description: "Page 1 of size 2", assertion: "r = paginate([1,2,3,4,5], 1, 2)\nassert r['items'] == [1, 2] and r['total'] == 5 and r['has_next'] is True" },
      { description: "Last page has_next False", assertion: "r = paginate([1,2,3,4,5], 3, 2)\nassert r['items'] == [5] and r['has_next'] is False" },
      { description: "Out of range page", assertion: "r = paginate([1,2,3], 5, 2)\nassert r['items'] == [] and r['has_next'] is False" },
    ],
  },
  {
    domainSlug: "backend-engineer", slug: "validate-email",
    title: "Validate Email Format",
    description: "Write `is_valid_email(s)` that returns True for a valid-looking email. Require exactly one `@`, a non-empty local part, and a domain with at least one `.` and a TLD of length ≥ 2.",
    difficulty: 2,
    starterCode: `def is_valid_email(s):\n    # Return True or False\n    pass\n`,
    solutionHint: "Split on '@'. Check len(parts) == 2, local part non-empty, domain has '.' and last segment length >= 2.",
    skillSlugs: ["security-best-practices"],
    testCases: [
      { description: "Valid email", assertion: "assert is_valid_email('a@b.co') is True" },
      { description: "Missing TLD", assertion: "assert is_valid_email('a@b') is False" },
      { description: "Multiple @", assertion: "assert is_valid_email('a@@b.co') is False" },
    ],
  },
  {
    domainSlug: "backend-engineer", slug: "flatten-nested-dict",
    title: "Flatten a Nested Dict",
    description: "Write `flatten(d)` that flattens nested dicts using dot-separated keys. `{'a': {'b': 1}}` → `{'a.b': 1}`. Non-dict values pass through.",
    difficulty: 3,
    starterCode: `def flatten(d):\n    # Recursively flatten nested dicts\n    pass\n`,
    solutionHint: "Walk the dict. For each key, if value is a dict, recurse with prefixed key; else assign.",
    skillSlugs: ["data-structures-and-algorithms"],
    testCases: [
      { description: "Simple nesting", assertion: "assert flatten({'a': {'b': 1}}) == {'a.b': 1}" },
      { description: "Deep nesting", assertion: "assert flatten({'a': {'b': {'c': 2}}}) == {'a.b.c': 2}" },
      { description: "No nesting unchanged", assertion: "assert flatten({'x': 5}) == {'x': 5}" },
    ],
  },
  {
    domainSlug: "backend-engineer", slug: "is-palindrome",
    title: "Palindrome Check",
    description: "Write `is_palindrome(s)` that returns True if `s` reads the same forwards and backwards, ignoring case and non-alphanumeric characters.",
    difficulty: 1,
    starterCode: `def is_palindrome(s):\n    # Return True or False\n    pass\n`,
    solutionHint: "Filter to alphanumeric chars, lowercase, compare with reverse.",
    skillSlugs: ["programming-fundamentals"],
    testCases: [
      { description: "Simple palindrome", assertion: "assert is_palindrome('racecar') is True" },
      { description: "Case/space insensitive", assertion: "assert is_palindrome('A man a plan a canal Panama') is True" },
      { description: "Not palindrome", assertion: "assert is_palindrome('hello') is False" },
    ],
  },
  {
    domainSlug: "backend-engineer", slug: "rate-limit-window",
    title: "Fixed Window Rate Limiter",
    description: "Write `check_window(timestamps, window_s, limit)` returning True/False per request based on a fixed time-window counter.",
    difficulty: 3,
    starterCode: `def check_window(timestamps, window_s, limit):\n    pass\n`,
    solutionHint: "Compute window_id = int(t // window_s). Count requests in the current window; allow if count < limit.",
    skillSlugs: ["caching"],
    testCases: [
      { description: "Three in same window, limit 2", assertion: "assert check_window([0, 0, 0], 60, 2) == [True, True, False]" },
      { description: "New window resets count", assertion: "assert check_window([0, 61], 60, 1) == [True, True]" },
      { description: "Mixed", assertion: "assert check_window([10, 20, 70, 80], 60, 2) == [True, True, True, True]" },
    ],
  },
  {
    domainSlug: "backend-engineer", slug: "reverse-string",
    title: "Reverse a String",
    description: "Write `reverse(s)` that returns the string reversed, in-place semantics not required.",
    difficulty: 1,
    starterCode: `def reverse(s):\n    pass\n`,
    solutionHint: "Python: s[::-1].",
    skillSlugs: ["programming-fundamentals"],
    testCases: [
      { description: "Basic", assertion: "assert reverse('abc') == 'cba'" },
      { description: "Empty", assertion: "assert reverse('') == ''" },
      { description: "Single char", assertion: "assert reverse('a') == 'a'" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // FRONTEND ENGINEER — language-agnostic algorithmic patterns
  // ═══════════════════════════════════════════════════════════════
  {
    domainSlug: "frontend-engineer", slug: "dedupe-array",
    title: "Dedupe an Array",
    description: "Write `dedupe(xs)` that returns a new list with duplicates removed, preserving first-occurrence order.",
    difficulty: 1,
    starterCode: `def dedupe(xs):\n    pass\n`,
    solutionHint: "Iterate and add to a set of seen; append if new.",
    skillSlugs: ["javascript-basics"],
    testCases: [
      { description: "Basic", assertion: "assert dedupe([1, 2, 2, 3, 1]) == [1, 2, 3]" },
      { description: "Preserve order", assertion: "assert dedupe([3, 1, 3, 2, 1]) == [3, 1, 2]" },
      { description: "Empty", assertion: "assert dedupe([]) == []" },
    ],
  },
  {
    domainSlug: "frontend-engineer", slug: "deep-equal",
    title: "Deep Equality",
    description: "Write `deep_equal(a, b)` that recursively checks equality for nested lists and dicts.",
    difficulty: 3,
    starterCode: `def deep_equal(a, b):\n    pass\n`,
    solutionHint: "Type check first; recurse on dict/list; otherwise ==.",
    skillSlugs: ["javascript-basics"],
    testCases: [
      { description: "Primitives", assertion: "assert deep_equal(1, 1) is True and deep_equal(1, 2) is False" },
      { description: "Nested lists", assertion: "assert deep_equal([1, [2, 3]], [1, [2, 3]]) is True" },
      { description: "Nested dicts differ", assertion: "assert deep_equal({'a': [1]}, {'a': [2]}) is False" },
    ],
  },
  {
    domainSlug: "frontend-engineer", slug: "slugify",
    title: "Slugify a Title",
    description: "Write `slugify(s)` that converts a title into a URL slug: lowercase, spaces → hyphens, non-alphanumeric (except hyphens) removed, collapse multiple hyphens.",
    difficulty: 2,
    starterCode: `def slugify(s):\n    pass\n`,
    solutionHint: "Lowercase, replace non-alphanumeric with hyphens, then collapse runs and strip edges.",
    skillSlugs: ["javascript-basics"],
    testCases: [
      { description: "Basic", assertion: "assert slugify('Hello World') == 'hello-world'" },
      { description: "Punctuation stripped", assertion: "assert slugify('Hello, World!') == 'hello-world'" },
      { description: "Collapse whitespace", assertion: "assert slugify('  a   b  ') == 'a-b'" },
    ],
  },
  {
    domainSlug: "frontend-engineer", slug: "format-currency",
    title: "Format Currency",
    description: "Write `format_currency(amount, symbol='$')` that formats a number with thousands separators and exactly 2 decimal places. Negative amounts get a leading minus.",
    difficulty: 2,
    starterCode: `def format_currency(amount, symbol='$'):\n    pass\n`,
    solutionHint: "f'{amount:,.2f}' handles grouping and decimals. Prepend symbol; handle negatives carefully.",
    skillSlugs: ["javascript-basics"],
    testCases: [
      { description: "Integer", assertion: "assert format_currency(1234) == '$1,234.00'" },
      { description: "Decimal", assertion: "assert format_currency(1234.5) == '$1,234.50'" },
      { description: "Negative", assertion: "assert format_currency(-50) == '-$50.00'" },
    ],
  },
  {
    domainSlug: "frontend-engineer", slug: "chunk-array",
    title: "Chunk an Array",
    description: "Write `chunk(xs, size)` that splits a list into consecutive chunks of length `size` (last chunk may be shorter).",
    difficulty: 2,
    starterCode: `def chunk(xs, size):\n    pass\n`,
    solutionHint: "Slice in a loop: xs[i:i+size] for i in range(0, len(xs), size).",
    skillSlugs: ["javascript-basics"],
    testCases: [
      { description: "Even split", assertion: "assert chunk([1,2,3,4], 2) == [[1,2],[3,4]]" },
      { description: "Uneven", assertion: "assert chunk([1,2,3,4,5], 2) == [[1,2],[3,4],[5]]" },
      { description: "Empty", assertion: "assert chunk([], 3) == []" },
    ],
  },
  {
    domainSlug: "frontend-engineer", slug: "group-by",
    title: "Group By Key",
    description: "Write `group_by(items, key)` that groups a list of dicts by the value at `key`, returning a dict of lists.",
    difficulty: 2,
    starterCode: `def group_by(items, key):\n    pass\n`,
    solutionHint: "Loop and append to dict.setdefault(value, []).",
    skillSlugs: ["javascript-basics"],
    testCases: [
      { description: "Group by category", assertion: "assert group_by([{'c':'a','v':1},{'c':'b','v':2},{'c':'a','v':3}], 'c') == {'a': [{'c':'a','v':1},{'c':'a','v':3}], 'b': [{'c':'b','v':2}]}" },
      { description: "Empty input", assertion: "assert group_by([], 'x') == {}" },
      { description: "Single group", assertion: "assert group_by([{'k':1},{'k':1}], 'k') == {1: [{'k':1},{'k':1}]}" },
    ],
  },
  {
    domainSlug: "frontend-engineer", slug: "flatten-deep-array",
    title: "Deep Flatten an Array",
    description: "Write `flatten_deep(xs)` that fully flattens arbitrarily nested lists into a single flat list.",
    difficulty: 3,
    starterCode: `def flatten_deep(xs):\n    pass\n`,
    solutionHint: "Recurse: if item is a list, extend with flatten_deep(item); else append.",
    skillSlugs: ["javascript-basics"],
    testCases: [
      { description: "Two levels", assertion: "assert flatten_deep([1, [2, 3], 4]) == [1, 2, 3, 4]" },
      { description: "Three levels", assertion: "assert flatten_deep([1, [2, [3, [4]]]]) == [1, 2, 3, 4]" },
      { description: "Empty", assertion: "assert flatten_deep([]) == []" },
    ],
  },
  {
    domainSlug: "frontend-engineer", slug: "capitalize-title",
    title: "Capitalize Title Case",
    description: "Write `title_case(s)` that capitalizes the first letter of each word and lowercases the rest, preserving spaces.",
    difficulty: 1,
    starterCode: `def title_case(s):\n    pass\n`,
    solutionHint: "s.title() does this — or split, capitalize each, join.",
    skillSlugs: ["javascript-basics"],
    testCases: [
      { description: "Basic", assertion: "assert title_case('hello world') == 'Hello World'" },
      { description: "Mixed case input", assertion: "assert title_case('HELLO world') == 'Hello World'" },
      { description: "Single word", assertion: "assert title_case('python') == 'Python'" },
    ],
  },
  {
    domainSlug: "frontend-engineer", slug: "count-occurrences",
    title: "Count Occurrences",
    description: "Write `count(xs)` that returns a dict mapping each unique element to its frequency.",
    difficulty: 1,
    starterCode: `def count(xs):\n    pass\n`,
    solutionHint: "collections.Counter, or manual dict increment.",
    skillSlugs: ["javascript-basics"],
    testCases: [
      { description: "Basic", assertion: "assert count(['a','b','a','c','a']) == {'a': 3, 'b': 1, 'c': 1}" },
      { description: "Empty", assertion: "assert count([]) == {}" },
      { description: "Numbers", assertion: "assert count([1, 1, 2]) == {1: 2, 2: 1}" },
    ],
  },
  {
    domainSlug: "frontend-engineer", slug: "clamp-number",
    title: "Clamp a Number",
    description: "Write `clamp(n, lo, hi)` that returns `n` bounded to the range [lo, hi].",
    difficulty: 1,
    starterCode: `def clamp(n, lo, hi):\n    pass\n`,
    solutionHint: "max(lo, min(hi, n)).",
    skillSlugs: ["javascript-basics"],
    testCases: [
      { description: "In range", assertion: "assert clamp(5, 1, 10) == 5" },
      { description: "Below", assertion: "assert clamp(-3, 0, 10) == 0" },
      { description: "Above", assertion: "assert clamp(100, 0, 10) == 10" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // DATA ANALYST
  // ═══════════════════════════════════════════════════════════════
  {
    domainSlug: "data-analyst", slug: "percent-change",
    title: "Percent Change",
    description: "Write `pct_change(old, new)` that returns the percent change as a float. Return 0.0 if old is 0.",
    difficulty: 1,
    starterCode: `def pct_change(old, new):\n    pass\n`,
    solutionHint: "(new - old) / old * 100, guarding against old == 0.",
    skillSlugs: ["business-metrics-kpis"],
    testCases: [
      { description: "Increase", assertion: "assert pct_change(100, 150) == 50.0" },
      { description: "Decrease", assertion: "assert pct_change(100, 75) == -25.0" },
      { description: "Zero base", assertion: "assert pct_change(0, 50) == 0.0" },
    ],
  },
  {
    domainSlug: "data-analyst", slug: "moving-average",
    title: "Moving Average",
    description: "Write `moving_avg(xs, window)` that returns the simple moving average. The first `window-1` positions are filled with None.",
    difficulty: 2,
    starterCode: `def moving_avg(xs, window):\n    pass\n`,
    solutionHint: "Sum the current window each step. Or maintain a running sum for O(n).",
    skillSlugs: ["exploratory-data-analysis"],
    testCases: [
      { description: "Window 2", assertion: "assert moving_avg([1, 2, 3, 4], 2) == [None, 1.5, 2.5, 3.5]" },
      { description: "Window 3", assertion: "assert moving_avg([1, 2, 3, 4, 5], 3) == [None, None, 2.0, 3.0, 4.0]" },
      { description: "Window larger than input", assertion: "assert moving_avg([1, 2], 5) == [None, None]" },
    ],
  },
  {
    domainSlug: "data-analyst", slug: "detect-outliers-iqr",
    title: "Detect Outliers (IQR)",
    description: "Write `outliers_iqr(xs)` that returns a sorted list of values outside Q1 − 1.5·IQR or Q3 + 1.5·IQR. Use linear interpolation for quartiles (numpy-style).",
    difficulty: 3,
    starterCode: `def outliers_iqr(xs):\n    pass\n`,
    solutionHint: "Sort, compute Q1 and Q3 via position (n-1)*p, compute bounds, filter.",
    skillSlugs: ["exploratory-data-analysis"],
    testCases: [
      { description: "No outliers", assertion: "assert outliers_iqr([1, 2, 3, 4, 5]) == []" },
      { description: "One high outlier", assertion: "assert outliers_iqr([1, 2, 3, 4, 100]) == [100]" },
      { description: "Both directions", assertion: "assert outliers_iqr([-100, 1, 2, 3, 4, 100]) == [-100, 100]" },
    ],
  },
  {
    domainSlug: "data-analyst", slug: "weighted-average",
    title: "Weighted Average",
    description: "Write `weighted_avg(values, weights)` that returns the weighted average. Assume non-empty, equal-length lists.",
    difficulty: 1,
    starterCode: `def weighted_avg(values, weights):\n    pass\n`,
    solutionHint: "sum(v*w) / sum(w).",
    skillSlugs: ["descriptive-statistics"],
    testCases: [
      { description: "Equal weights = simple mean", assertion: "assert weighted_avg([1, 2, 3], [1, 1, 1]) == 2.0" },
      { description: "Weighted", assertion: "assert weighted_avg([1, 2, 3], [0, 0, 1]) == 3.0" },
      { description: "Mixed", assertion: "assert weighted_avg([10, 20], [1, 3]) == 17.5" },
    ],
  },
  {
    domainSlug: "data-analyst", slug: "cohort-retention",
    title: "Cohort Retention",
    description: "Write `retention(cohort_size, active)` that returns the retention rate (active / cohort_size) as a float between 0 and 1.",
    difficulty: 1,
    starterCode: `def retention(cohort_size, active):\n    pass\n`,
    solutionHint: "active / cohort_size, guarding against zero.",
    skillSlugs: ["cohort-analysis"],
    testCases: [
      { description: "50%", assertion: "assert retention(100, 50) == 0.5" },
      { description: "Full", assertion: "assert retention(100, 100) == 1.0" },
      { description: "Zero cohort", assertion: "assert retention(0, 5) == 0.0" },
    ],
  },
  {
    domainSlug: "data-analyst", slug: "top-k-categories",
    title: "Top K Categories",
    description: "Write `top_k(items, k)` that returns the k most frequent items, sorted by count descending then alphabetically. Return a list of `(item, count)` tuples.",
    difficulty: 2,
    starterCode: `def top_k(items, k):\n    pass\n`,
    solutionHint: "Count with Counter, sort by (-count, item), take first k.",
    skillSlugs: ["data-cleaning"],
    testCases: [
      { description: "Top 2", assertion: "assert top_k(['a','b','a','c','a','b'], 2) == [('a', 3), ('b', 2)]" },
      { description: "Ties sorted alphabetically", assertion: "assert top_k(['b','a','c'], 2) == [('a', 1), ('b', 1)]" },
      { description: "k > unique", assertion: "assert top_k(['x','x'], 5) == [('x', 2)]" },
    ],
  },
  {
    domainSlug: "data-analyst", slug: "cumulative-sum",
    title: "Cumulative Sum",
    description: "Write `cumsum(xs)` that returns the running total of a list (window-function style).",
    difficulty: 2,
    starterCode: `def cumsum(xs):\n    pass\n`,
    solutionHint: "Track a running total; append each step.",
    skillSlugs: ["sql-subqueries-ctes"],
    testCases: [
      { description: "Basic", assertion: "assert cumsum([1, 2, 3]) == [1, 3, 6]" },
      { description: "With negatives", assertion: "assert cumsum([10, -5, 2]) == [10, 5, 7]" },
      { description: "Empty", assertion: "assert cumsum([]) == []" },
    ],
  },
  {
    domainSlug: "data-analyst", slug: "parse-csv-row",
    title: "Parse a CSV Row",
    description: "Write `parse_csv_row(row, columns)` where `row` is a comma-separated string and `columns` is the header list. Return a dict of column → value. Strip whitespace.",
    difficulty: 2,
    starterCode: `def parse_csv_row(row, columns):\n    pass\n`,
    solutionHint: "row.split(',') then zip with columns, stripping each value.",
    skillSlugs: ["data-cleaning"],
    testCases: [
      { description: "Basic", assertion: "assert parse_csv_row('a,b,c', ['x','y','z']) == {'x':'a','y':'b','z':'c'}" },
      { description: "Strips whitespace", assertion: "assert parse_csv_row(' 1 , 2 , 3 ', ['a','b','c']) == {'a':'1','b':'2','c':'3'}" },
      { description: "Empty fields", assertion: "assert parse_csv_row('a,,c', ['x','y','z']) == {'x':'a','y':'','z':'c'}" },
    ],
  },
  {
    domainSlug: "data-analyst", slug: "count-by-category",
    title: "Count by Category",
    description: "Write `count_by(rows, key)` that counts rows by the value at `key` in each dict. Returns a dict of category → count.",
    difficulty: 1,
    starterCode: `def count_by(rows, key):\n    pass\n`,
    solutionHint: "Dict increment per row.",
    skillSlugs: ["data-cleaning"],
    testCases: [
      { description: "Basic", assertion: "assert count_by([{'c':'a'},{'c':'b'},{'c':'a'}], 'c') == {'a':2,'b':1}" },
      { description: "Empty", assertion: "assert count_by([], 'x') == {}" },
      { description: "Numbers as keys", assertion: "assert count_by([{'k':1},{'k':1},{'k':2}], 'k') == {1:2,2:1}" },
    ],
  },
  {
    domainSlug: "data-analyst", slug: "funnel-conversion-rate",
    title: "Funnel Conversion Rate",
    description: "Write `conversion(steps)` where `steps` is a list of counts (each step's user count). Return the overall conversion rate from the first to last step as a float.",
    difficulty: 1,
    starterCode: `def conversion(steps):\n    pass\n`,
    solutionHint: "steps[-1] / steps[0], guarding against zero.",
    skillSlugs: ["funnel-analysis"],
    testCases: [
      { description: "1000→50", assertion: "assert conversion([1000, 500, 200, 50]) == 0.05" },
      { description: "No drop", assertion: "assert conversion([100, 100, 100]) == 1.0" },
      { description: "Empty entry", assertion: "assert conversion([0, 10]) == 0.0" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // DATA SCIENTIST
  // ═══════════════════════════════════════════════════════════════
  {
    domainSlug: "data-scientist", slug: "entropy",
    title: "Shannon Entropy",
    description: "Write `entropy(labels)` that returns the Shannon entropy (base 2) of a label distribution. Return 0 for empty or single-class input.",
    difficulty: 3,
    starterCode: `import math\n\ndef entropy(labels):\n    pass\n`,
    solutionHint: "Compute p for each class; return -sum(p * log2(p)).",
    skillSlugs: ["experimental-design"],
    testCases: [
      { description: "Pure = 0", assertion: "assert entropy(['a','a','a']) == 0.0" },
      { description: "Balanced binary = 1", assertion: "assert abs(entropy(['a','b']) - 1.0) < 1e-9" },
      { description: "Empty = 0", assertion: "assert entropy([]) == 0.0" },
    ],
  },
  {
    domainSlug: "data-scientist", slug: "confusion-matrix",
    title: "Confusion Matrix",
    description: "Write `confusion(y_true, y_pred)` for binary 0/1 labels. Return `(tp, fp, fn, tn)`.",
    difficulty: 2,
    starterCode: `def confusion(y_true, y_pred):\n    pass\n`,
    solutionHint: "Loop and count based on truth/prediction combinations.",
    skillSlugs: ["model-evaluation-metrics"],
    testCases: [
      { description: "Mixed predictions", assertion: "assert confusion([1,0,1,0], [1,0,0,1]) == (1, 1, 1, 1)" },
      { description: "All correct", assertion: "assert confusion([1,1,0], [1,1,0]) == (2, 0, 0, 1)" },
      { description: "All wrong", assertion: "assert confusion([1,0], [0,1]) == (0, 1, 1, 0)" },
    ],
  },
  {
    domainSlug: "data-scientist", slug: "precision-recall",
    title: "Precision and Recall",
    description: "Write `pr(y_true, y_pred)` returning `(precision, recall)`. Handle divide-by-zero by returning 0.0.",
    difficulty: 3,
    starterCode: `def pr(y_true, y_pred):\n    pass\n`,
    solutionHint: "Compute tp/fp/fn, then precision = tp/(tp+fp), recall = tp/(tp+fn).",
    skillSlugs: ["model-evaluation-metrics"],
    testCases: [
      { description: "Typical", assertion: "assert pr([1,1,0,0], [1,0,0,1]) == (0.5, 0.5)" },
      { description: "Perfect", assertion: "assert pr([1,1,0], [1,1,0]) == (1.0, 1.0)" },
      { description: "No positives predicted", assertion: "assert pr([1,1], [0,0]) == (0.0, 0.0)" },
    ],
  },
  {
    domainSlug: "data-scientist", slug: "train-test-split",
    title: "Train/Test Split",
    description: "Write `split_indices(n, test_frac, seed)` that returns `(train_indices, test_indices)` — a deterministic shuffle using Python's `random.Random(seed)`.",
    difficulty: 3,
    starterCode: `import random\n\ndef split_indices(n, test_frac, seed=42):\n    pass\n`,
    solutionHint: "shuffle(range(n)) with a seeded Random, then split at n_test = int(n * test_frac).",
    skillSlugs: ["feature-engineering"],
    testCases: [
      { description: "Deterministic", assertion: "assert split_indices(10, 0.2, 42) == split_indices(10, 0.2, 42)" },
      { description: "Correct sizes", assertion: "tr, te = split_indices(10, 0.3, 1)\nassert len(tr) == 7 and len(te) == 3" },
      { description: "No overlap", assertion: "tr, te = split_indices(20, 0.25, 7)\nassert set(tr).isdisjoint(set(te))" },
    ],
  },
  {
    domainSlug: "data-scientist", slug: "min-max-scaling",
    title: "Min-Max Scale (per column)",
    description: "Write `scale(rows)` where `rows` is a list of equal-length numeric lists. Return a new list scaled column-wise to [0, 1]. Columns with zero range become all 0.",
    difficulty: 3,
    starterCode: `def scale(rows):\n    pass\n`,
    solutionHint: "Transpose logic: for each column, find min/max, then (x - min)/(max - min).",
    skillSlugs: ["feature-engineering"],
    testCases: [
      { description: "Basic", assertion: "assert scale([[1, 10], [3, 20]]) == [[0.0, 0.0], [1.0, 1.0]]" },
      { description: "Zero range column", assertion: "assert scale([[5, 1], [5, 3]]) == [[0.0, 0.0], [0.0, 1.0]]" },
      { description: "Mid value", assertion: "assert scale([[0], [5], [10]]) == [[0.0], [0.5], [1.0]]" },
    ],
  },
  {
    domainSlug: "data-scientist", slug: "knn-single-prediction",
    title: "KNN — Single Prediction",
    description: "Write `knn_predict(X, y, query, k)` where X is a list of training vectors, y is a list of integer labels, and query is a vector. Return the majority label among the k nearest neighbors (Euclidean). Ties → smaller label.",
    difficulty: 4,
    starterCode: `import math\n\ndef knn_predict(X, y, query, k):\n    pass\n`,
    solutionHint: "Compute distances, sort by distance, take first k, majority vote.",
    skillSlugs: ["classification"],
    testCases: [
      { description: "Simple majority", assertion: "assert knn_predict([[0,0],[1,1],[2,2]], [0,1,1], [2, 2], 1) == 1" },
      { description: "k=3 vote", assertion: "assert knn_predict([[0],[1],[2],[3]], [0,0,1,1], [1.1], 3) == 0" },
      { description: "Tie → smaller label", assertion: "assert knn_predict([[0],[2]], [5,3], [1], 2) == 3" },
    ],
  },
  {
    domainSlug: "data-scientist", slug: "manhattan-distance",
    title: "Manhattan Distance",
    description: "Write `manhattan(a, b)` that returns the L1 distance between two equal-length numeric vectors.",
    difficulty: 2,
    starterCode: `def manhattan(a, b):\n    pass\n`,
    solutionHint: "sum(abs(x - y) for x, y in zip(a, b)).",
    skillSlugs: ["clustering-algorithms"],
    testCases: [
      { description: "Basic", assertion: "assert manhattan([0, 0], [3, 4]) == 7" },
      { description: "Same point", assertion: "assert manhattan([1, 1], [1, 1]) == 0" },
      { description: "3D", assertion: "assert manhattan([1, 2, 3], [4, 6, 3]) == 8" },
    ],
  },
  {
    domainSlug: "data-scientist", slug: "spearman-rank-correlation",
    title: "Spearman Rank Correlation",
    description: "Write `spearman(xs, ys)` that returns the Spearman rank correlation. Rank both lists (average ties), then return Pearson correlation of the ranks.",
    difficulty: 4,
    starterCode: `def spearman(xs, ys):\n    pass\n`,
    solutionHint: "Rank each list, then Pearson on ranks. Handle ties by averaging.",
    skillSlugs: ["inferential-statistics"],
    testCases: [
      { description: "Perfect monotonic", assertion: "assert abs(spearman([1,2,3], [10,20,30]) - 1.0) < 1e-9" },
      { description: "Reverse monotonic", assertion: "assert abs(spearman([1,2,3], [30,20,10]) - (-1.0)) < 1e-9" },
      { description: "Non-linear monotonic", assertion: "assert abs(spearman([1,2,3,4], [1,4,9,16]) - 1.0) < 1e-9" },
    ],
  },
  {
    domainSlug: "data-scientist", slug: "log-loss",
    title: "Log Loss (Binary Cross-Entropy)",
    description: "Write `log_loss(y_true, y_prob)` where `y_prob` are probabilities in (0, 1). Return the mean binary cross-entropy. Clamp probabilities to [1e-15, 1-1e-15] for stability.",
    difficulty: 4,
    starterCode: `import math\n\ndef log_loss(y_true, y_prob):\n    pass\n`,
    solutionHint: "-mean(y*log(p) + (1-y)*log(1-p)), clamping p first.",
    skillSlugs: ["model-evaluation-metrics"],
    testCases: [
      { description: "Perfect predictions ≈ 0", assertion: "assert log_loss([1,0], [0.99, 0.01]) < 0.02" },
      { description: "50/50 is ln(2)", assertion: "assert abs(log_loss([1, 0], [0.5, 0.5]) - 0.6931471805599453) < 1e-6" },
      { description: "Extreme wrong", assertion: "assert log_loss([1], [0.001]) > 5" },
    ],
  },
  {
    domainSlug: "data-scientist", slug: "null-accuracy",
    title: "Null (Baseline) Accuracy",
    description: "Write `null_accuracy(y_true)` that returns the accuracy of always predicting the majority class.",
    difficulty: 2,
    starterCode: `def null_accuracy(y_true):\n    pass\n`,
    solutionHint: "max(class_count) / len(y_true), guarding against empty.",
    skillSlugs: ["model-evaluation-metrics"],
    testCases: [
      { description: "Balanced = 0.5", assertion: "assert null_accuracy([1, 0, 1, 0]) == 0.5" },
      { description: "Skewed 9:1", assertion: "assert null_accuracy([1]*9 + [0]) == 0.9" },
      { description: "Empty = 0", assertion: "assert null_accuracy([]) == 0.0" },
    ],
  },
];

async function main() {
  console.log("🔧 Seeding practical tasks across 4 domains...\n");

  const domainSlugs = [...new Set(TASKS.map((t) => t.domainSlug))];
  const domainMap = new Map<string, string>();
  for (const slug of domainSlugs) {
    const d = await prisma.domain.findUnique({ where: { slug } });
    if (!d) {
      console.error(`❌ Domain '${slug}' not found — aborting`);
      process.exit(1);
    }
    domainMap.set(slug, d.id);
  }

  let created = 0;
  let skipped = 0;
  const missingSkills = new Set<string>();

  for (const task of TASKS) {
    const domainId = domainMap.get(task.domainSlug)!;

    const skillIds: string[] = [];
    let missing = false;
    for (const skillSlug of task.skillSlugs) {
      const skill = await prisma.skill.findUnique({
        where: { domainId_slug: { domainId, slug: skillSlug } },
      });
      if (!skill) {
        missingSkills.add(`${task.domainSlug}:${skillSlug}`);
        missing = true;
        break;
      }
      skillIds.push(skill.id);
    }
    if (missing) { skipped++; continue; }

    const existing = await prisma.practicalTask.findUnique({
      where: { domainId_slug: { domainId, slug: task.slug } },
    });
    if (existing) { skipped++; continue; }

    const createdTask = await prisma.practicalTask.create({
      data: {
        domainId,
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
    console.log(`   ✅ [${task.domainSlug}] ${task.title}`);
    created++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created:          ${created}`);
  console.log(`   Skipped:          ${skipped}`);
  if (missingSkills.size > 0) {
    console.log(`   Missing skills:   ${Array.from(missingSkills).join(", ")}`);
  }

  // Per-domain counts
  console.log(`\n📈 Per-domain practical task totals:`);
  for (const slug of domainSlugs) {
    const count = await prisma.practicalTask.count({
      where: { domainId: domainMap.get(slug)! },
    });
    console.log(`   ${slug.padEnd(24)} ${count}`);
  }
}

main()
  .catch((e) => { console.error("❌", e?.message ?? e); process.exit(1); })
  .finally(() => prisma.$disconnect());
