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
  language?: string;
  starterCode: string;
  solutionHint: string;
  skillSlugs: string[];
  testCases: TestCase[];
};

const TASKS: Task[] = [
  {
    domainSlug: "frontend-engineer", slug: "flex-style",
    title: "Flexbox Style Builder",
    description: "Write `flexStyle({direction, wrap, justify})` that returns a CSS style object for a flex container. Default `direction` to `'row'`, `wrap` to `false` (as `'nowrap'`), and `justify` to `'flex-start'`. Always include `display: 'flex'`.",
    difficulty: 2,
    language: "javascript",
    starterCode: `function flexStyle({ direction, wrap, justify }) {
  // Return { display, flexDirection, flexWrap, justifyContent }
  return {};
}
`,
    solutionHint: "Use default parameters and map booleans to 'wrap' / 'nowrap'.",
    skillSlugs: ["css-layout"],
    testCases: [
      { description: "row + wrap + center", assertion: "assertEqual(flexStyle({direction:'row',wrap:true,justify:'center'}), {display:'flex',flexDirection:'row',flexWrap:'wrap',justifyContent:'center'})" },
      { description: "column + nowrap + space-between", assertion: "assertEqual(flexStyle({direction:'column',wrap:false,justify:'space-between'}), {display:'flex',flexDirection:'column',flexWrap:'nowrap',justifyContent:'space-between'})" },
      { description: "Defaults when fields missing", assertion: "assertEqual(flexStyle({}), {display:'flex',flexDirection:'row',flexWrap:'nowrap',justifyContent:'flex-start'})" },
    ],
  },

  {
    domainSlug: "frontend-engineer", slug: "class-list-toggle",
    title: "Class List Toggle",
    description: "Write `updateClassList(current, op, cls)` where `current` is a space-separated class string, `op` is `'add' | 'remove' | 'toggle'`, and `cls` is a class name. Return the updated space-separated string with no duplicates and no leading/trailing whitespace.",
    difficulty: 2,
    language: "javascript",
    starterCode: `function updateClassList(current, op, cls) {
  // Return a space-separated class string
  return current;
}
`,
    solutionHint: "Split by whitespace, filter empties, apply the operation on a Set, then rejoin.",
    skillSlugs: ["dom-manipulation"],
    testCases: [
      { description: "Add new class", assertion: "assertEqual(updateClassList('btn', 'add', 'primary'), 'btn primary')" },
      { description: "Add existing class is a no-op", assertion: "assertEqual(updateClassList('btn primary', 'add', 'btn'), 'btn primary')" },
      { description: "Remove class", assertion: "assertEqual(updateClassList('btn primary large', 'remove', 'primary'), 'btn large')" },
      { description: "Toggle on adds, off removes", assertion: "assertEqual(updateClassList('btn', 'toggle', 'active'), 'btn active'); assertEqual(updateClassList('btn active', 'toggle', 'active'), 'btn')" },
    ],
  },

  {
    domainSlug: "frontend-engineer", slug: "promise-settle-summary",
    title: "Promise Settle Summary",
    description: "Write `settleSummary(results)` where `results` is an array of `{status: 'fulfilled'|'rejected', value?}` objects (as produced by Promise.allSettled). Return `{fulfilled, rejected, values, reasons}` — counts plus arrays of the successful values and failure reasons in original order.",
    difficulty: 3,
    language: "javascript",
    starterCode: `function settleSummary(results) {
  // Return { fulfilled, rejected, values, reasons }
  return { fulfilled: 0, rejected: 0, values: [], reasons: [] };
}
`,
    solutionHint: "Loop once, push to the right array, count both statuses.",
    skillSlugs: ["async-javascript"],
    testCases: [
      { description: "Mixed results", assertion: "const s = settleSummary([{status:'fulfilled',value:1},{status:'rejected',value:'boom'},{status:'fulfilled',value:2}]); assertEqual(s.fulfilled, 2); assertEqual(s.rejected, 1); assertEqual(s.values, [1, 2]); assertEqual(s.reasons, ['boom'])" },
      { description: "All fulfilled", assertion: "const s = settleSummary([{status:'fulfilled',value:'a'}]); assertEqual(s.rejected, 0); assertEqual(s.reasons, [])" },
      { description: "Empty input", assertion: "assertEqual(settleSummary([]), {fulfilled:0,rejected:0,values:[],reasons:[]})" },
    ],
  },

  {
    domainSlug: "frontend-engineer", slug: "retry-delays",
    title: "Retry Delays (Exponential Backoff)",
    description: "Write `retryDelays(attempts, baseMs, capMs)` that returns an array of `attempts` delay values in ms. Each delay doubles from the previous one, starting at `baseMs`, and is capped at `capMs`.",
    difficulty: 3,
    language: "javascript",
    starterCode: `function retryDelays(attempts, baseMs, capMs) {
  // Return an array of delays
  return [];
}
`,
    solutionHint: "Use Math.min(capMs, baseMs * 2**i) in a loop.",
    skillSlugs: ["http-and-apis"],
    testCases: [
      { description: "Four attempts at 100ms, cap 2000ms", assertion: "assertEqual(retryDelays(4, 100, 2000), [100, 200, 400, 800])" },
      { description: "Cap kicks in", assertion: "assertEqual(retryDelays(6, 100, 400), [100, 200, 400, 400, 400, 400])" },
      { description: "Zero attempts", assertion: "assertEqual(retryDelays(0, 100, 1000), [])" },
    ],
  },

  {
    domainSlug: "frontend-engineer", slug: "typed-pair",
    title: "Pair and Swap",
    description: "Write `pair(a, b)` that returns `{first: a, second: b}` and `swap(p)` that returns the pair with first and second exchanged.",
    difficulty: 2,
    language: "javascript",
    starterCode: `function pair(a, b) {
  return { first: a, second: b };
}

function swap(p) {
  // Return a new pair with first/second exchanged
  return p;
}
`,
    solutionHint: "Destructure p or construct directly.",
    skillSlugs: ["typescript-fundamentals"],
    testCases: [
      { description: "pair builds object", assertion: "assertEqual(pair(1, 2), {first: 1, second: 2})" },
      { description: "swap exchanges fields", assertion: "assertEqual(swap({first: 'a', second: 'b'}), {first: 'b', second: 'a'})" },
      { description: "swap does not mutate input", assertion: "const p = {first: 1, second: 2}; swap(p); assertEqual(p, {first: 1, second: 2})" },
    ],
  },

  {
    domainSlug: "frontend-engineer", slug: "counter-reducer",
    title: "Counter Reducer",
    description: "Write `counterReducer(state, action)` for a counter. `action` is `{type}` where type is `'increment' | 'decrement' | 'reset' | 'set'` (with `value` for `'set'`). Return the new numeric state.",
    difficulty: 3,
    language: "javascript",
    starterCode: `function counterReducer(state, action) {
  // state: number, action: { type, value? }
  return state;
}
`,
    solutionHint: "Switch on action.type. Unknown actions return state unchanged.",
    skillSlugs: ["react-fundamentals"],
    testCases: [
      { description: "increment adds 1", assertion: "assertEqual(counterReducer(5, {type:'increment'}), 6)" },
      { description: "decrement subtracts 1", assertion: "assertEqual(counterReducer(5, {type:'decrement'}), 4)" },
      { description: "reset returns 0", assertion: "assertEqual(counterReducer(42, {type:'reset'}), 0)" },
      { description: "set uses provided value", assertion: "assertEqual(counterReducer(1, {type:'set', value:99}), 99)" },
      { description: "unknown action is a no-op", assertion: "assertEqual(counterReducer(7, {type:'nope'}), 7)" },
    ],
  },

  {
    domainSlug: "frontend-engineer", slug: "immutable-update",
    title: "Immutable Nested Update",
    description: "Write `immutableUpdate(obj, path, value)` where `path` is a dot-separated string (e.g., `'user.address.city'`). Return a NEW object with that path set to `value`. All ancestors along the path must also be new objects. Original must not be mutated. Missing intermediate keys default to `{}`.",
    difficulty: 3,
    language: "javascript",
    starterCode: `function immutableUpdate(obj, path, value) {
  // Return a new object with the nested path set
  return obj;
}
`,
    solutionHint: "Recurse on path split by '.', or build the new tree from the innermost leaf outward.",
    skillSlugs: ["state-management"],
    testCases: [
      { description: "Simple top-level set", assertion: "assertEqual(immutableUpdate({a:1}, 'a', 2), {a:2})" },
      { description: "Nested set", assertion: "assertEqual(immutableUpdate({u:{name:'a'}}, 'u.name', 'b'), {u:{name:'b'}})" },
      { description: "Deep nested set creates intermediates", assertion: "assertEqual(immutableUpdate({}, 'a.b.c', 1), {a:{b:{c:1}}})" },
      { description: "Original not mutated", assertion: "const o = {a:{b:1}}; immutableUpdate(o, 'a.b', 2); assertEqual(o, {a:{b:1}})" },
      { description: "Sibling keys preserved", assertion: "assertEqual(immutableUpdate({a:1, b:2}, 'a', 3), {a:3, b:2})" },
    ],
  },

  {
    domainSlug: "frontend-engineer", slug: "validate-form",
    title: "Form Validation",
    description: "Write `validateForm(data, rules)` where `rules` is an object of `{field: {required?, minLength?}}`. Return `{valid, errors}` where `errors` maps field name to the first failed rule's message: `'required'` or `'minLength N'`. Validation stops at the first failure per field.",
    difficulty: 2,
    language: "javascript",
    starterCode: `function validateForm(data, rules) {
  // Return { valid, errors }
  return { valid: true, errors: {} };
}
`,
    solutionHint: "Iterate Object.entries(rules); for each field, check in order required → minLength.",
    skillSlugs: ["forms-and-validation"],
    testCases: [
      { description: "All valid", assertion: "assertEqual(validateForm({name:'Al', age:20}, {name:{required:true, minLength:2}}), {valid:true, errors:{}})" },
      { description: "Missing required field", assertion: "assertEqual(validateForm({}, {name:{required:true}}), {valid:false, errors:{name:'required'}})" },
      { description: "Too short", assertion: "assertEqual(validateForm({name:'A'}, {name:{minLength:2}}), {valid:false, errors:{name:'minLength 2'}})" },
      { description: "Multiple fields", assertion: "const r = validateForm({a:''}, {a:{required:true}, b:{required:true}}); assertEqual(r.valid, false); assertEqual(Object.keys(r.errors).sort(), ['a','b'])" },
    ],
  },

  {
    domainSlug: "frontend-engineer", slug: "parse-route",
    title: "Parse Route Pattern",
    description: "Write `parseRoute(pattern, path)` that matches a URL path against a pattern with `:param` segments. Returns an object of params on match, or `null`. Patterns and paths are slash-separated with no trailing slash. Segment count must match exactly.",
    difficulty: 2,
    language: "javascript",
    starterCode: `function parseRoute(pattern, path) {
  // Return params object or null
  return null;
}
`,
    solutionHint: "Split both by '/', check lengths, walk segments together, collect non-literal matches.",
    skillSlugs: ["routing"],
    testCases: [
      { description: "Static match → empty params", assertion: "assertEqual(parseRoute('/users', '/users'), {})" },
      { description: "Single param", assertion: "assertEqual(parseRoute('/users/:id', '/users/42'), {id:'42'})" },
      { description: "Multiple params", assertion: "assertEqual(parseRoute('/users/:uid/posts/:pid', '/users/1/posts/9'), {uid:'1', pid:'9'})" },
      { description: "No match", assertion: "assertEqual(parseRoute('/users/:id', '/posts/1'), null)" },
      { description: "Segment count mismatch", assertion: "assertEqual(parseRoute('/users', '/users/1'), null)" },
    ],
  },

  {
    domainSlug: "frontend-engineer", slug: "resolve-aria",
    title: "Resolve ARIA Attribute",
    description: "Write `resolveAria(role, state)` where `state` is `{expanded?, pressed?, checked?}`. Return the aria attribute string for the given state, or `null` if none apply. Mapping: expanded → `'aria-expanded'`, pressed → `'aria-pressed'`, checked → `'aria-checked'`. Priority: checked > pressed > expanded.",
    difficulty: 2,
    language: "javascript",
    starterCode: `function resolveAria(role, state) {
  // Return 'aria-...' or null
  return null;
}
`,
    solutionHint: "Check state keys in priority order; return the first one that is defined (not undefined).",
    skillSlugs: ["accessibility"],
    testCases: [
      { description: "expanded only", assertion: "assertEqual(resolveAria('button', {expanded:true}), 'aria-expanded')" },
      { description: "pressed wins over expanded", assertion: "assertEqual(resolveAria('button', {expanded:true, pressed:false}), 'aria-pressed')" },
      { description: "checked wins over everything", assertion: "assertEqual(resolveAria('checkbox', {checked:true, pressed:true, expanded:true}), 'aria-checked')" },
      { description: "No state → null", assertion: "assertEqual(resolveAria('button', {}), null)" },
    ],
  },

  {
    domainSlug: "frontend-engineer", slug: "mini-test-runner",
    title: "Mini Test Runner",
    description: "Write `runTests(cases)` where each case is `{name, fn}`. Call each `fn`, catch any exception, and return an array of `{name, passed}` in the original order. `passed` is true only if no exception is thrown.",
    difficulty: 3,
    language: "javascript",
    starterCode: `function runTests(cases) {
  // Return [{ name, passed }]
  return [];
}
`,
    solutionHint: "Loop, try/catch each fn, record pass/fail.",
    skillSlugs: ["testing-frontend"],
    testCases: [
      { description: "All pass", assertion: "assertEqual(runTests([{name:'a',fn:()=>{}},{name:'b',fn:()=>{}}]), [{name:'a',passed:true},{name:'b',passed:true}])" },
      { description: "One fails", assertion: "const r = runTests([{name:'ok',fn:()=>{}},{name:'bad',fn:()=>{throw new Error('x')}}]); assertEqual(r[0].passed, true); assertEqual(r[1].passed, false)" },
      { description: "Empty input", assertion: "assertEqual(runTests([]), [])" },
      { description: "Order preserved", assertion: "const r = runTests([{name:'z',fn:()=>{}},{name:'a',fn:()=>{}}]); assertEqual(r.map(x=>x.name), ['z','a'])" },
    ],
  },

  {
    domainSlug: "backend-engineer", slug: "sql-where-builder",
    title: "SQL WHERE Builder",
    description: "Write `buildWhere(clauses, operator)` where `clauses` is an array of condition strings and `operator` is `'AND' | 'OR'`. Return the clauses joined by the operator and wrapped in parentheses. Empty input returns `''`. Single-clause input returns it without parens.",
    difficulty: 2,
    language: "python",
    starterCode: `def build_where(clauses, operator):
    # Return a WHERE-fragment string
    pass
`,
    solutionHint: "Empty → ''. Single → clauses[0]. Multiple → f\"({f' {op} '.join(clauses)})\".",
    skillSlugs: ["sql-databases"],
    testCases: [
      { description: "Empty returns empty", assertion: "assert build_where([], 'AND') == ''" },
      { description: "Single clause unwrapped", assertion: "assert build_where(['a = 1'], 'AND') == 'a = 1'" },
      { description: "Multiple AND", assertion: "assert build_where(['a = 1', 'b = 2'], 'AND') == '(a = 1 AND b = 2)'" },
      { description: "Multiple OR", assertion: "assert build_where(['x > 0', 'y < 0'], 'OR') == '(x > 0 OR y < 0)'" },
    ],
  },

  {
    domainSlug: "backend-engineer", slug: "request-router",
    title: "Minimal Request Router",
    description: "Write `route(method, path)` that returns a handler name for known routes, or `'404'`. Routes: `GET /health` → `'health'`, `POST /users` → `'create_user'`, `GET /users` → `'list_users'`. Anything else → `'404'`. Match is exact (no wildcards).",
    difficulty: 2,
    language: "python",
    starterCode: `def route(method, path):
    # Return a handler name or '404'
    pass
`,
    solutionHint: "Dictionary lookup on (method, path) tuple.",
    skillSlugs: ["web-frameworks"],
    testCases: [
      { description: "GET /health", assertion: "assert route('GET', '/health') == 'health'" },
      { description: "POST /users", assertion: "assert route('POST', '/users') == 'create_user'" },
      { description: "Wrong method", assertion: "assert route('DELETE', '/users') == '404'" },
      { description: "Unknown path", assertion: "assert route('GET', '/nope') == '404'" },
    ],
  },

  {
    domainSlug: "backend-engineer", slug: "migration-plan",
    title: "Migration Plan",
    description: "Write `plan_migrations(current_version, target_version, migrations)` where `migrations` is a list of `(from_v, to_v)` pairs. Return a list of `to_v` values (in order) that get applied to reach `target_version`. Assume a linear history; stop when you reach target. If target is unreachable, return the migrations you *can* apply.",
    difficulty: 4,
    language: "python",
    starterCode: `def plan_migrations(current_version, target_version, migrations):
    # Return list of to_v values
    pass
`,
    solutionHint: "Build an adjacency from from_v → to_v, walk from current applying while making progress.",
    skillSlugs: ["orm-and-migrations"],
    testCases: [
      { description: "Apply two steps", assertion: "assert plan_migrations('v1', 'v3', [('v1','v2'),('v2','v3')]) == ['v2','v3']" },
      { description: "Nothing to do", assertion: "assert plan_migrations('v3', 'v3', [('v1','v2')]) == []" },
      { description: "Partial path", assertion: "assert plan_migrations('v1', 'v9', [('v1','v2'),('v2','v3')]) == ['v2','v3']" },
      { description: "Skip unused branches", assertion: "assert plan_migrations('v1', 'v2', [('v1','v2'),('v3','v4')]) == ['v2']" },
    ],
  },

  {
    domainSlug: "backend-engineer", slug: "error-envelope",
    title: "Error Envelope",
    description: "Write `error_envelope(code, message, details=None)` that returns a dict `{error: {code, message}}` plus a `details` key only when `details` is not None. All strings.",
    difficulty: 1,
    language: "python",
    starterCode: `def error_envelope(code, message, details=None):
    # Return {error: {code, message}} (+ details if provided)
    pass
`,
    solutionHint: "Build the dict, conditionally add details.",
    skillSlugs: ["error-handling"],
    testCases: [
      { description: "Without details", assertion: "assert error_envelope('NOT_FOUND', 'Missing') == {'error': {'code': 'NOT_FOUND', 'message': 'Missing'}}" },
      { description: "With details", assertion: "assert error_envelope('BAD', 'Oops', {'field': 'email'}) == {'error': {'code': 'BAD', 'message': 'Oops'}, 'details': {'field': 'email'}}" },
      { description: "None details excluded", assertion: "assert 'details' not in error_envelope('X', 'y', None)" },
    ],
  },

  {
    domainSlug: "backend-engineer", slug: "mock-db",
    title: "Mock DB Call",
    description: "Write `fetch_user(db, user_id)` where `db` is a dict-like object exposing `.get(id)` that may return `None`. Return the user dict on hit, or raise a `LookupError` with message `f\"user {user_id} not found\"` on miss.",
    difficulty: 2,
    language: "python",
    starterCode: `class DB:
    def __init__(self, rows):
        self._rows = rows
    def get(self, user_id):
        return self._rows.get(user_id)

def fetch_user(db, user_id):
    # Return user dict or raise LookupError
    pass
`,
    solutionHint: "Call db.get; raise LookupError on None.",
    skillSlugs: ["testing"],
    testCases: [
      { description: "Returns user on hit", assertion: "db = DB({'u1': {'id':'u1','name':'Ada'}}); assert fetch_user(db, 'u1')['name'] == 'Ada'" },
      { description: "Raises on miss", assertion: "db = DB({}); \ntry:\n    fetch_user(db, 'x')\n    assert False\nexcept LookupError as e:\n    assert str(e) == 'user x not found'" },
    ],
  },

  {
    domainSlug: "backend-engineer", slug: "verify-token",
    title: "Verify Signed Token",
    description: "Write `verify_token(header, payload, signature)` that returns the payload dict when `signature` matches `hash(header + '.' + payload)` using the given `hash_fn`, otherwise returns None. `hash_fn` is passed as an argument.",
    difficulty: 3,
    language: "python",
    starterCode: `def verify_token(header, payload, signature, hash_fn):
    # Return payload dict or None
    pass
`,
    solutionHint: "Recompute hash_fn(header + '.' + payload) and compare to signature.",
    skillSlugs: ["authentication-authorization"],
    testCases: [
      { description: "Valid signature", assertion: "hf = lambda s: 'H:' + s\nassert verify_token('h', 'p', 'H:h.p', hf) == 'p'" },
      { description: "Invalid signature", assertion: "hf = lambda s: 'H:' + s\nassert verify_token('h', 'p', 'wrong', hf) is None" },
    ],
  },

  {
    domainSlug: "backend-engineer", slug: "sanitize-input",
    title: "Sanitize User Input",
    description: "Write `sanitize(s)` that strips leading/trailing whitespace, removes ASCII control characters (0x00–0x1F and 0x7F), and collapses consecutive whitespace to a single space. Return the cleaned string.",
    difficulty: 2,
    language: "python",
    starterCode: `import re

def sanitize(s):
    # Return cleaned string
    pass
`,
    solutionHint: "re.sub for control chars, then re.sub(r'\\s+', ' ', ...), then strip.",
    skillSlugs: ["security-best-practices"],
    testCases: [
      { description: "Trims", assertion: "assert sanitize('  hi  ') == 'hi'" },
      { description: "Removes control chars", assertion: "assert sanitize('a\\x00b\\x1fc') == 'abc'" },
      { description: "Collapses whitespace", assertion: "assert sanitize('a\\t\\t b\\n c') == 'a b c'" },
      { description: "Empty safe", assertion: "assert sanitize('') == ''" },
    ],
  },

  {
    domainSlug: "backend-engineer", slug: "choose-index",
    title: "Choose an Index",
    description: "Write `choose_index(query_shape)` where `query_shape` is `{filter: [cols], sort: [cols]}`. Return `'composite'` if the filter has ≥2 columns, `'filter'` if only filter is present (1 col), `'sort'` if only sort is present, `'none'` otherwise.",
    difficulty: 2,
    language: "python",
    starterCode: `def choose_index(query_shape):
    # Return 'composite' | 'filter' | 'sort' | 'none'
    pass
`,
    solutionHint: "Check in priority order: composite → filter → sort → none.",
    skillSlugs: ["database-performance"],
    testCases: [
      { description: "Multi-col filter → composite", assertion: "assert choose_index({'filter':['a','b'],'sort':[]}) == 'composite'" },
      { description: "Single filter → filter", assertion: "assert choose_index({'filter':['a'],'sort':[]}) == 'filter'" },
      { description: "Sort only → sort", assertion: "assert choose_index({'filter':[],'sort':['a']}) == 'sort'" },
      { description: "Neither → none", assertion: "assert choose_index({'filter':[],'sort':[]}) == 'none'" },
    ],
  },

  {
    domainSlug: "backend-engineer", slug: "consistent-hash",
    title: "Consistent Hashing",
    description: "Write `assign_node(key, nodes, replicas=3)` that hashes `key` and each `(node, replica)` pair with `hash_fn`, and returns the node whose hashed virtual-point is the smallest one ≥ `hash(key)` (wrapping around). `hash_fn` returns an int; nodes is a list of node names.",
    difficulty: 4,
    language: "python",
    starterCode: `def assign_node(key, nodes, hash_fn, replicas=3):
    # Return the node name
    pass
`,
    solutionHint: "Build a sorted list of (point, node) with replicas. Find the first point >= hash(key), wrap if none.",
    skillSlugs: ["distributed-systems"],
    testCases: [
      { description: "Deterministic for same key", assertion: "hf = lambda s: sum(ord(c) for c in s)\na = assign_node('k', ['n1','n2','n3'], hf)\nb = assign_node('k', ['n1','n2','n3'], hf)\nassert a == b" },
      { description: "Returns one of the nodes", assertion: "hf = lambda s: sum(ord(c) for c in s)\nassert assign_node('any', ['a','b'], hf) in ('a','b')" },
      { description: "Single node always chosen", assertion: "hf = lambda s: sum(ord(c) for c in s)\nassert assign_node('x', ['only'], hf) == 'only'" },
    ],
  },

  {
    domainSlug: "data-analyst", slug: "sql-query-builder",
    title: "SQL SELECT Builder",
    description: "Write `build_select(table, columns, limit=None)` returning `SELECT col1, col2 FROM table` or `SELECT * FROM table` when columns is empty, appending ` LIMIT n` when limit is not None.",
    difficulty: 1,
    language: "python",
    starterCode: `def build_select(table, columns, limit=None):
    pass
`,
    solutionHint: "Join columns or use '*', format the SQL string, conditionally add LIMIT.",
    skillSlugs: ["sql-fundamentals"],
    testCases: [
      { description: "All columns", assertion: "assert build_select('users', []) == 'SELECT * FROM users'" },
      { description: "Specific columns", assertion: "assert build_select('users', ['id','name']) == 'SELECT id, name FROM users'" },
      { description: "With limit", assertion: "assert build_select('users', ['id'], 10) == 'SELECT id FROM users LIMIT 10'" },
    ],
  },

  {
    domainSlug: "data-analyst", slug: "inner-join",
    title: "Inner Join Two Tables",
    description: "Write `inner_join(left, right, left_key, right_key)` that returns the joined rows (as new dicts with right-side keys prefixed `right_` when they collide with left-side keys). Duplicate matches produce the cross-product.",
    difficulty: 3,
    language: "python",
    starterCode: `def inner_join(left, right, left_key, right_key):
    pass
`,
    solutionHint: "Nested loops; on key match merge dicts, prefixing collisions with right_.",
    skillSlugs: ["sql-joins"],
    testCases: [
      { description: "One-to-one match", assertion: "assert inner_join([{'id':1,'n':'a'}], [{'uid':1,'c':'x'}], 'id', 'uid') == [{'id':1,'n':'a','c':'x'}]" },
      { description: "Collision gets right_ prefix", assertion: "assert inner_join([{'id':1,'v':'L'}], [{'uid':1,'v':'R'}], 'id', 'uid') == [{'id':1,'v':'L','right_v':'R'}]" },
      { description: "No matches → empty", assertion: "assert inner_join([{'id':1}], [{'uid':2}], 'id', 'uid') == []" },
      { description: "One-to-many cross product", assertion: "assert len(inner_join([{'id':1}], [{'uid':1},{'uid':1}], 'id', 'uid')) == 2" },
    ],
  },

  {
    domainSlug: "data-analyst", slug: "confidence-interval",
    title: "Confidence Interval (95%)",
    description: "Write `ci95(sample)` that returns `(mean, half_width)` using the normal approximation: half_width = 1.96 * stddev / sqrt(n). Use population std (divide by n, not n-1). Empty input → `(0.0, 0.0)`.",
    difficulty: 3,
    language: "python",
    starterCode: `import math

def ci95(sample):
    pass
`,
    solutionHint: "mean = sum/n; var = sum((x-m)**2)/n; se = sqrt(var/n); half = 1.96*se.",
    skillSlugs: ["inferential-statistics"],
    testCases: [
      { description: "Empty", assertion: "assert ci95([]) == (0.0, 0.0)" },
      { description: "Constant sample → zero width", assertion: "m, h = ci95([5,5,5,5]); assert m == 5.0 and h == 0.0" },
      { description: "Known small sample", assertion: "m, h = ci95([1,2,3,4,5]); assert abs(m - 3.0) < 1e-9 and abs(h - 1.96 * (2 ** 0.5) / (5 ** 0.5)) < 1e-9" },
    ],
  },

  {
    domainSlug: "data-analyst", slug: "t-test-decision",
    title: "One-Sample t-Test Decision",
    description: "Write `t_test(sample, mu, t_crit)` that returns `'reject'` if `|mean - mu| / (std / sqrt(n))` exceeds `t_crit`, otherwise `'fail-to-reject'`. Use population std. Empty or zero-std samples → `'fail-to-reject'`.",
    difficulty: 4,
    language: "python",
    starterCode: `import math

def t_test(sample, mu, t_crit):
    pass
`,
    solutionHint: "Compute mean and std; guard against n=0 and std=0; compare t-stat to t_crit.",
    skillSlugs: ["hypothesis-testing"],
    testCases: [
      { description: "Clearly different", assertion: "assert t_test([10,10,10,10], 5, 2.0) == 'reject'" },
      { description: "Clearly same", assertion: "assert t_test([5,5,5,5], 5, 2.0) == 'fail-to-reject'" },
      { description: "Empty sample", assertion: "assert t_test([], 5, 2.0) == 'fail-to-reject'" },
    ],
  },

  {
    domainSlug: "data-analyst", slug: "sample-size-ab",
    title: "A/B Sample Size",
    description: "Write `sample_size_per_arm(baseline, mde, z=1.96, power_z=0.84)` returning the required sample size per arm using the standard formula: `n = 2 * ((z + power_z)^2) * p * (1 - p) / mde^2`, where `p = baseline` and `mde` is the absolute minimum detectable effect. Return an integer rounded up.",
    difficulty: 4,
    language: "python",
    starterCode: `import math

def sample_size_per_arm(baseline, mde, z=1.96, power_z=0.84):
    pass
`,
    solutionHint: "n = 2*(z+power_z)**2 * baseline*(1-baseline) / mde**2, then math.ceil.",
    skillSlugs: ["ab-testing"],
    testCases: [
      { description: "5% baseline, 1% MDE ≈ 7910/arm", assertion: "assert sample_size_per_arm(0.05, 0.01) == 7910" },
      { description: "Bigger MDE → fewer samples", assertion: "assert sample_size_per_arm(0.05, 0.02) < sample_size_per_arm(0.05, 0.01)" },
      { description: "Returns int", assertion: "assert isinstance(sample_size_per_arm(0.1, 0.01), int)" },
    ],
  },

  {
    domainSlug: "data-analyst", slug: "simple-ols",
    title: "Simple OLS",
    description: "Write `ols(xs, ys)` returning `(slope, intercept)` for the least-squares line. Guard against zero variance in `xs` by returning `(0.0, mean(ys) if ys else 0.0)`.",
    difficulty: 3,
    language: "python",
    starterCode: `def ols(xs, ys):
    pass
`,
    solutionHint: "slope = cov/var; intercept = mean(y) - slope * mean(x).",
    skillSlugs: ["regression-analysis"],
    testCases: [
      { description: "y = 2x", assertion: "s, i = ols([1,2,3], [2,4,6]); assert abs(s-2.0) < 1e-9 and abs(i) < 1e-9" },
      { description: "y = 2x + 1", assertion: "s, i = ols([0,1,2], [1,3,5]); assert abs(s-2.0) < 1e-9 and abs(i-1.0) < 1e-9" },
      { description: "Zero variance → horizontal line", assertion: "s, i = ols([3,3,3], [5,5,5]); assert s == 0.0 and i == 5.0" },
    ],
  },

  {
    domainSlug: "data-analyst", slug: "retention-matrix",
    title: "Cohort Retention Matrix",
    description: "Write `retention_matrix(cohorts, weekly_active)` where `cohorts` is a list of `(cohort_id, size)` and `weekly_active` maps `cohort_id` to a list of weekly active user counts. Return a dict `cohort_id → [active / size for each week]`, in the given order.",
    difficulty: 3,
    language: "python",
    starterCode: `def retention_matrix(cohorts, weekly_active):
    pass
`,
    solutionHint: "For each cohort, divide each week's active count by size; guard against size 0.",
    skillSlugs: ["cohort-analysis"],
    testCases: [
      { description: "Simple cohort", assertion: "assert retention_matrix([('c1', 100)], {'c1':[100, 50, 25]}) == {'c1':[1.0, 0.5, 0.25]}" },
      { description: "Zero-size cohort", assertion: "assert retention_matrix([('c1', 0)], {'c1':[10]}) == {'c1':[0.0]}" },
      { description: "Missing cohort in active map", assertion: "assert retention_matrix([('c1', 100)], {}) == {'c1':[]}" },
    ],
  },

  {
    domainSlug: "data-analyst", slug: "summary-pack",
    title: "Summary Stat Pack",
    description: "Write `summary_pack(values)` returning a dict with `count`, `mean`, `min`, `max`, and `median`. Median of even-length lists is the average of the two middle values. Empty input → all zeros.",
    difficulty: 2,
    language: "python",
    starterCode: `def summary_pack(values):
    pass
`,
    solutionHint: "Sort a copy for median; straightforward aggregation for the rest.",
    skillSlugs: ["data-storytelling"],
    testCases: [
      { description: "Empty", assertion: "assert summary_pack([]) == {'count':0,'mean':0.0,'min':0.0,'max':0.0,'median':0.0}" },
      { description: "Odd length", assertion: "assert summary_pack([1,2,3]) == {'count':3,'mean':2.0,'min':1,'max':3,'median':2}" },
      { description: "Even length", assertion: "r = summary_pack([1,2,3,4]); assert r['median'] == 2.5" },
    ],
  },

  {
    domainSlug: "data-scientist", slug: "bayes-update",
    title: "Bayes Update",
    description: "Write `bayes(prior, likelihood, false_positive)` that returns the posterior P(A|+): `posterior = likelihood * prior / (likelihood * prior + false_positive * (1 - prior))`. Guard against zero denominators by returning 0.0.",
    difficulty: 3,
    language: "python",
    starterCode: `def bayes(prior, likelihood, false_positive):
    pass
`,
    solutionHint: "Compute numerator and denominator; return 0.0 if denominator is 0.",
    skillSlugs: ["probability"],
    testCases: [
      { description: "Classic 1% prior, 99% sensitivity, 5% FPR", assertion: "assert abs(bayes(0.01, 0.99, 0.05) - 0.1666666666) < 1e-6" },
      { description: "Prior 1.0 → posterior 1.0", assertion: "assert bayes(1.0, 0.5, 0.5) == 1.0" },
      { description: "Prior 0.0 → posterior 0.0", assertion: "assert bayes(0.0, 0.9, 0.5) == 0.0" },
    ],
  },

  {
    domainSlug: "data-scientist", slug: "matmul",
    title: "Matrix Multiply",
    description: "Write `matmul(A, B)` returning the matrix product of two 2D lists. Assume A is m×n and B is n×p. Return an m×p list of lists of floats.",
    difficulty: 4,
    language: "python",
    starterCode: `def matmul(A, B):
    pass
`,
    solutionHint: "Triple loop: result[i][j] = sum over k of A[i][k] * B[k][j].",
    skillSlugs: ["linear-algebra"],
    testCases: [
      { description: "2x2 · 2x2", assertion: "assert matmul([[1,2],[3,4]], [[5,6],[7,8]]) == [[19,22],[43,50]]" },
      { description: "Identity preserves", assertion: "assert matmul([[3,4],[5,6]], [[1,0],[0,1]]) == [[3,4],[5,6]]" },
      { description: "Zero matrix", assertion: "assert matmul([[0,0],[0,0]], [[1,2],[3,4]]) == [[0,0],[0,0]]" },
    ],
  },

  {
    domainSlug: "data-scientist", slug: "majority-vote",
    title: "Majority Vote Ensemble",
    description: "Write `majority_vote(predictions)` where `predictions` is a list of labels (one per model). Return the most common label; ties broken by the smallest label.",
    difficulty: 2,
    language: "python",
    starterCode: `def majority_vote(predictions):
    pass
`,
    solutionHint: "Count with a dict; pick max count, tie-break by sorted label.",
    skillSlugs: ["classification"],
    testCases: [
      { description: "Clear majority", assertion: "assert majority_vote([1, 1, 0]) == 1" },
      { description: "Tie → smaller label", assertion: "assert majority_vote([5, 3]) == 3" },
      { description: "Single prediction", assertion: "assert majority_vote(['a']) == 'a'" },
      { description: "Empty → None", assertion: "assert majority_vote([]) is None" },
    ],
  },

  {
    domainSlug: "data-scientist", slug: "one-hot-with-interaction",
    title: "One-Hot with Interaction",
    description: "Write `one_hot_with_interaction(pairs)` where `pairs` is a list of `(cat_a, cat_b)` strings. Return a sparse dict representation: `{'a=cat_a': 1, 'b=cat_b': 1, 'a:b=cat_a|cat_b': 1}` per row, combined so the returned list has one dict per row.",
    difficulty: 4,
    language: "python",
    starterCode: `def one_hot_with_interaction(pairs):
    pass
`,
    solutionHint: "For each pair build the three keys; return list of dicts.",
    skillSlugs: ["feature-engineering"],
    testCases: [
      { description: "Single row", assertion: "assert one_hot_with_interaction([('x','p')]) == [{'a=x':1, 'b=p':1, 'a:b=x|p':1}]" },
      { description: "Multiple rows", assertion: "assert len(one_hot_with_interaction([('x','p'), ('y','q')])) == 2" },
      { description: "Empty", assertion: "assert one_hot_with_interaction([]) == []" },
    ],
  },

  {
    domainSlug: "data-scientist", slug: "roc-auc-trapezoid",
    title: "ROC AUC via Trapezoid",
    description: "Write `roc_auc(labels, scores)` where labels are 0/1 and scores are numeric. Sort by descending score, sweep thresholds, and compute AUC via the trapezoid rule on (FPR, TPR) points. Guard against single-class inputs by returning 0.0.",
    difficulty: 5,
    language: "python",
    starterCode: `def roc_auc(labels, scores):
    pass
`,
    solutionHint: "Sort pairs, walk forward, track TP and FP, integrate with (ΔFPR) * (TPR_prev + TPR)/2.",
    skillSlugs: ["model-evaluation-metrics"],
    testCases: [
      { description: "Perfect separation → 1.0", assertion: "assert abs(roc_auc([0,0,1,1], [0.1,0.2,0.8,0.9]) - 1.0) < 1e-9" },
      { description: "Reversed → 0.0", assertion: "assert abs(roc_auc([0,0,1,1], [0.9,0.8,0.2,0.1])) < 1e-9" },
      { description: "Single class → 0.0", assertion: "assert roc_auc([1,1,1], [0.5,0.6,0.7]) == 0.0" },
    ],
  },

  {
    domainSlug: "data-scientist", slug: "randomize-arms",
    title: "Randomize Arms",
    description: "Write `randomize_arms(n, k, seed)` that returns a list of length `n` with arm indices `0..k-1` balanced as evenly as possible, shuffled using Python's `random.Random(seed)`. When `n % k != 0`, put the remainder in the earliest arms.",
    difficulty: 3,
    language: "python",
    starterCode: `import random

def randomize_arms(n, k, seed=42):
    pass
`,
    solutionHint: "base = n // k, rem = n % k; construct list with rem arms getting one extra; shuffle.",
    skillSlugs: ["experimental-design"],
    testCases: [
      { description: "Deterministic", assertion: "assert randomize_arms(10, 2, 1) == randomize_arms(10, 2, 1)" },
      { description: "Balanced counts", assertion: "r = randomize_arms(9, 3, 7); from collections import Counter; c = Counter(r); assert sorted(c.values()) == [3,3,3]" },
      { description: "Remainder to earliest arms", assertion: "r = randomize_arms(5, 3, 0); from collections import Counter; c = Counter(r); assert c[0] == 2 and c[1] == 2 and c[2] == 1" },
    ],
  },

  {
    domainSlug: "data-scientist", slug: "silhouette",
    title: "Silhouette Score (Simplified)",
    description: "Write `silhouette(points, labels)` returning the mean silhouette coefficient using Euclidean distance. For each point `i`: `a_i` = mean distance to same-cluster points (excluding itself); `b_i` = min over other clusters of mean distance to that cluster; `s_i = (b_i - a_i) / max(a_i, b_i)`. Points in singleton clusters → s = 0.",
    difficulty: 5,
    language: "python",
    starterCode: `import math

def silhouette(points, labels):
    pass
`,
    solutionHint: "Group points by label; compute pairwise distances; handle singleton clusters carefully.",
    skillSlugs: ["clustering-algorithms"],
    testCases: [
      { description: "Two well-separated clusters → ~1.0", assertion: "assert silhouette([[0,0],[0.1,0.1],[10,10],[10.1,10.1]], [0,0,1,1]) > 0.95" },
      { description: "Singleton clusters → 0.0", assertion: "assert silhouette([[0,0],[1,1],[2,2]], [0,1,2]) == 0.0" },
      { description: "Empty → 0.0", assertion: "assert silhouette([], []) == 0.0" },
    ],
  },

  {
    domainSlug: "data-scientist", slug: "rolling-mean-diff",
    title: "Rolling Mean and Diff",
    description: "Write `rolling_mean(xs, window)` returning the SMA padded with `None` at the front (first window-1 entries), and `diff(xs)` returning `xs[i] - xs[i-1]` with `None` as the first element.",
    difficulty: 2,
    language: "python",
    starterCode: `def rolling_mean(xs, window):
    pass

def diff(xs):
    pass
`,
    solutionHint: "SMA: for i >= window-1, average xs[i-window+1..i]. Diff: [None] + [xs[i]-xs[i-1] for i in range(1, len(xs))].",
    skillSlugs: ["time-series-analysis"],
    testCases: [
      { description: "SMA window 3", assertion: "assert rolling_mean([1,2,3,4,5], 3) == [None, None, 2.0, 3.0, 4.0]" },
      { description: "SMA window larger than input", assertion: "assert rolling_mean([1,2], 5) == [None, None]" },
      { description: "Diff basic", assertion: "assert diff([1,3,6,10]) == [None, 2, 3, 4]" },
      { description: "Diff empty", assertion: "assert diff([]) == []" },
    ],
  },

  {
    domainSlug: "data-scientist", slug: "did-estimator",
    title: "Difference-in-Differences",
    description: "Write `did(pre_treat, post_treat, pre_ctrl, post_ctrl)` returning the DiD estimator: `(post_treat - pre_treat) - (post_ctrl - pre_ctrl)`.",
    difficulty: 3,
    language: "python",
    starterCode: `def did(pre_treat, post_treat, pre_ctrl, post_ctrl):
    pass
`,
    solutionHint: "Straight arithmetic.",
    skillSlugs: ["causal-inference"],
    testCases: [
      { description: "Positive effect", assertion: "assert did(10, 15, 10, 12) == 3.0" },
      { description: "No effect", assertion: "assert did(10, 15, 10, 15) == 0.0" },
      { description: "Negative effect", assertion: "assert did(10, 11, 10, 14) == -3.0" },
    ],
  },
];

async function main() {
  console.log("Seeding practical tasks (batch 2)...\n");

  const domainSlugs = [...new Set(TASKS.map((t) => t.domainSlug))];
  const domainMap = new Map<string, string>();
  for (const slug of domainSlugs) {
    const d = await prisma.domain.findUnique({ where: { slug } });
    if (!d) {
      console.error(`Domain '${slug}' not found`);
      process.exit(1);
    }
    domainMap.set(slug, d.id);
  }

  let created = 0;
  let skipped = 0;
  const missing = new Set<string>();

  for (const task of TASKS) {
    const domainId = domainMap.get(task.domainSlug)!;

    const skillIds: string[] = [];
    let missingSkill = false;
    for (const skillSlug of task.skillSlugs) {
      const skill = await prisma.skill.findUnique({
        where: { domainId_slug: { domainId, slug: skillSlug } },
      });
      if (!skill) {
        missing.add(`${task.domainSlug}:${skillSlug}`);
        missingSkill = true;
        break;
      }
      skillIds.push(skill.id);
    }
    if (missingSkill) { skipped++; continue; }

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
        language: task.language ?? "python",
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
    console.log(`  + [${task.domainSlug}] ${task.title}`);
    created++;
  }

  console.log(`\nSummary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);
  if (missing.size > 0) {
    console.log(`  Missing skills: ${Array.from(missing).join(", ")}`);
  }
}

main()
  .catch((e) => { console.error(e?.message ?? e); process.exit(1); })
  .finally(() => prisma.$disconnect());
