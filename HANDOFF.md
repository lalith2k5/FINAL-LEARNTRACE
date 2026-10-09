LEARNTRACE — HANDOFF DOCUMENT
What this is
You are picking up an ongoing session. The user (Lalith) has been building LearnTrace — an AI-driven adaptive learning platform (Next.js 16 + TypeScript + Prisma + PostgreSQL + Google Gemini). This doc gives you the context you need to be immediately useful.

How to work with the user
Command style — CRITICAL:

Terminal commands only. Never describe edits in prose — always give copy-paste-ready shell commands.

One block per step. Prefer single heredoc blocks (cat > file << 'EOF', python3 << 'PY') that write/rewrite entire files or apply all edits at once, over many tiny commands.

No # comments in bash blocks. The user's zsh errors on them (zsh: command not found: #). Use plain commands, no inline comments, no multi-line comment headers.

Avoid heredocs when the file is complex. Long heredocs have broken on paste (regex corruption, mismatched quotes). For big rewrites, prefer writing the file via a Python script that builds the content programmatically, or split into small sed/perl edits.

Verify after every edit. Always append a grep or pnpm tsc --noEmit line so the user can confirm the change landed.

Workflow style:

The user runs commands on macOS zsh, in ~/Projects/learntrace.

They commit to GitHub after each logical batch (git add -A && git commit -m "..." && git push origin main).

They test in the browser after each batch and report back with screenshots or pasted terminal logs.

They iterate visually — many "make this smaller", "change that color", "remove this" tweaks. Keep the diffs small and reversible.

When they say "next", they want options ranked by impact, not a single answer.

When they say "commit", just give the git commands — don't re-explain what changed.

What NOT to do:

Don't dump huge explanatory essays unless they ask "why".

Don't suggest architectural rewrites unprompted.

Don't use # in shell blocks.

Don't assume a tool exists — verify with grep/ls first.

Don't claim something works without seeing the terminal output.

Tech stack (actual, not aspirational)
Layer	What's used
Framework	Next.js 16.3.5 (App Router, Turbopack)
Language	TypeScript 5 strict
UI	React 19.2.8
Styling	Tailwind CSS v4 (CSS-first @theme tokens)
Animation	Framer Motion 13.4
Icons	lucide-react
Charts	Recharts
Graph viz	Hand-rolled SVG (no React Flow)
Markdown	react-markdown + remark-gfm
Toasts	sonner
DB	PostgreSQL 16 (Docker, port 5434)
ORM	Prisma 6.19
Auth	NextAuth v5 (Credentials + Google OAuth)
AI	Google Gemini via @google/genai
Code exec	Piston API + local Python fallback
Tests	Vitest 5
Architectural decisions (drift from proposal)
The project proposal originally described Express + a Python ML microservice + React Flow. Reality:

Express → Next.js API routes + Server Actions. Same behavior, one process.

React Flow → hand-rolled SVG in SkillGraph.tsx. Custom bezier edges with spread exit/entry points, full design-system control.

Python ML service → TypeScript mastery engine in src/lib/mastery/. All math is in-process, transactional with DB writes.

The user is aware of and comfortable with this drift. Don't "fix" it unless asked.

Current state (as of latest session)
5 domains, fully seeded:

ml-engineer — 30 skills, 450 questions, 51 materials, 21 practical tasks

backend-engineer — 20 skills, 42 questions, 40 materials, 10 practical tasks

frontend-engineer — 20 skills, 41 questions, 40 materials, 10 practical tasks

data-analyst — 20 skills, 40 questions, 36 materials, 10 practical tasks

data-scientist — 20 skills, 40 questions, 34 materials, 10 practical tasks

Totals: 110 skills, 613 questions, ~200 materials, 61 practical tasks, 0 orphans, 0 cross-domain prereq leaks.

Recent fixes:

AI cascade: gemini-3.5-flash → gemini-flash-latest → gemini-3.5-flash-lite, 3s timeout per attempt, 503/500 triggers cascade.

Simulator: soft cascade (50% proportional drag) + improve clamp (never lowers).

Google OAuth: prompt=select_account for multi-account testing.

Postgres moved from port 5433 → 5434 (another project grabbed 5433).

.env.example updated to reflect port 5434.

Known noise (non-blocking):

Google Fonts download warnings — network unreachable, falls back to system fonts.

scroll-behavior: smooth warning — cosmetic Next 16 issue.

Extension-caused browser errors — not from this codebase.

Key files to know
Mastery engine (the heart of the app):

src/lib/mastery/engine.ts — updateMastery(prior, evidence) → next (Bayesian-flavored)

src/lib/mastery/decay.ts — 21-day half-life

src/lib/mastery/view.ts — MasteryViewBundle with tiers (fresh/decaying/stale)

src/lib/mastery/impact.ts — Dependency Impact Score

src/lib/mastery/adaptive.ts — last-3-attempts difficulty adjustment

src/lib/mastery/misconceptions.ts — repeated wrong-option detection

src/lib/mastery/simulate.ts — what-if skip/improve propagation

src/lib/mastery/roadmap.ts — topological ordering

src/lib/graph/dag.ts — hasCycle, topologicalSort, downstreamClosure

Seeding scripts (all idempotent):

scripts/seed.ts <domain-slug> — seeds one domain from src/content/domains/*.json; prunes skills removed from JSON

scripts/seed-practical-all-domains.ts — 40 practical tasks across 4 domains

scripts/seed-skill-videos-all.ts — videos with oEmbed validation

scripts/check-domains-full.ts — full integrity report

scripts/analyze-domains.ts — content analysis (orphans, similar slugs, etc.)

Prisma: prisma/schema.prisma, 6 migrations in prisma/migrations/.

Env: .env.local (real secrets, never commit). Port 5434 for Postgres.

Commands the user runs often
bash
# Start everything
lt-start                           # alias: starts docker + pnpm dev

# Database
docker exec -it learntrace-pg psql -U dev -d learntrace -c '...'
pnpm prisma studio                 # visual DB browser at :5555

# Seeding
pnpm tsx scripts/seed.ts <domain>  # one domain
pnpm db:seed-practical-all         # all practical tasks
pnpm db:seed-videos-all            # all videos

# Health
pnpm tsx scripts/check-domains-full.ts
pnpm tsc --noEmit
pnpm test

# Dev server
lsof -ti:3000 | xargs kill -9      # kill stuck server
pnpm dev
What's left (open menu from last session)
Ranked, pick one when user says "next":

A — Domain switcher in Topbar (fast UX win)
B — In-app notes for the 4 new domains (~80 notes; needs Gemini quota, 20/day free tier)
C — Graph interactivity (search, zoom/pan)
D — Polish items: root not-found.tsx ✓ done, root error.tsx ✓ done, per-route loading skeletons ✓ done, metadata.icons cleanup ✓ done
E — CSV/JSON domain import (add domains without code edits)
F — Something the user suggests
---

## Session log — 2026-10-06

### Shipped
- Edge weights are now live: `Edge.weight` threaded through `impact.ts` (weighted downstream closure) and `simulate.ts` (weighted parent averaging). Every analysis page uses declared goals now.
- Multi-language practice: `src/lib/practice/runtimes.ts` (Python + JavaScript + TypeScript). 10 frontend-engineer tasks migrated to real JS in the DB.
- Misconceptions: 3-signal union — `option-repeat`, `overconfident`, `skill-weak`. New card variants.
- Declared goals: `UserDomain.goalSkillIds String[]`, `GoalPicker` on `/domains`, `getGoalSkillIds()` helper.
- Persisted roadmap: `RoadmapItem` used as an override table (Done/Skip/Undo). `src/app/(app)/roadmap/actions.ts`.
- Report completion gate: `CompletionPanel` + ring-highlighted certificates when domain is fully verified.
- next-themes removed → script-free `ThemeProvider`.
- Dead schema cut: `Material.pdfUrl`, `AssessmentSession.endedAt`. `SceneIndicator.tsx` deleted. `Logo.tsx` renders a real mark.
- README rewritten to match reality.
- Tests: 38 → 43.

### Fixed along the way
- `.env` was pointing at 5433 and winning over `.env.local`. Removed the line from `.env`.
- Docker container was stopped. `docker start learntrace-pg` restores.

### Open menu
1. Tests for new code — `runtimes.ts`, `GoalPicker`, roadmap actions, `CompletionPanel`, weighted impact/simulate (~45 min)
2. 2.1 Diagnostic depth — proposal wanted 15 per topic, code does 15 total (~2h)
3. §1 PDF upload + inline viewer — needs storage decision (~half-day+)
4. 2.9 Content depth — 4 newer domains need ~360 more Q (multi-week, Gemini-quota-limited)
5. Graph interactivity — search / zoom / pan
6. CSV/JSON domain import

---

## Session log — 2026-10-06 (part 2)

### Shipped
- Email verification: `/verify`, `/verify-request`, `src/lib/email/*`, `src/lib/auth/tokens.ts`, dashboard banner
- Password reset: `/forgot-password`, `/reset`, both API routes
- Multi-language practical: `src/lib/practice/runtimes.ts` (Python, JS, TS)
- 37 practical tasks across 4 domains — coverage 1-7/20 → 10-14/20
- Diagnostic scales per domain: 15-60 Q (min 2 per skill)
- Weighted edges: `Edge.weight` threaded through impact + simulate
- Misconceptions: 3-signal union (option-repeat, overconfident, skill-weak)
- Declared goals: `UserDomain.goalSkillIds`, `GoalPicker` on `/domains`
- Persisted roadmap: `RoadmapItem` override table with 4-state cycle
- Completion gate: reachable when skill has no practical tasks
- Dead surface cut: `Mastery.confidence → evidenceCount`, `pdfUrl`, `endedAt`, `SceneIndicator.tsx`
- next-themes replaced with script-free `ThemeProvider`

### Tests
- 43 → 86 across 9 files

### Migrations
- `add_user_goal_skills`
- `remove_dead_surface`
- `rename_mastery_confidence`

### Open menu
1. Notes top-up for 4 domains (Gemini-quota-limited, ~4 days of runs)
2. Semantic misconception detection (free-text justifications + LLM)
3. PDF upload + inline viewer (proposal §6 sub-item)
4. Graph interactivity (search / zoom / pan)
5. CSV/JSON domain import

### Known non-blocking
- Browser extension causes hydration warning in dev (extension injects `open-incognito-widget`)
- Google Fonts download warning when offline (falls back to system fonts)

---

## Reversal — 2026-10-06

Removed the email verification + password reset flows built earlier the same day.
Reason: added complexity without strong payoff; Google OAuth is the primary
signup path for the target user.

Kept:
- `VerificationToken` model (NextAuth Prisma adapter requires it)
- Semantic misconception analysis (unrelated, stays)

Removed:
- `/verify`, `/verify-request`, `/forgot-password`, `/reset` pages
- `/api/email/*` routes
- `src/lib/email/`, `src/lib/auth/tokens.ts` (+ token tests)
- `EmailVerificationBanner`, dashboard hook, register hook, login footer
- `EMAIL_*` + `RESEND_API_KEY` env vars (also from `.env.local`)

Resolved: NextAuth v5-beta `OAuthAccountNotLinked` when a password-created
user tries Google sign-in. The `signIn` callback in `src/lib/auth.ts`
pre-creates the Account row for existing users whose email matches, and
`allowDangerousEmailAccountLinking: true` covers the remaining race.

---

## Session log — 2026-10-09

### Shipped
- AI cascade hardened: Gemini (3 models) → Groq (openai/gpt-oss-20b) → OpenRouter (openrouter/free)
  - Env-configurable models: GROQ_MODEL, OPENROUTER_MODEL
  - 429 backoff (15s × attempts), JSON extraction fallback, bad-JSON retry
  - Lazy Gemini client (fixes ESM hoisting)
  - Timeouts: Gemini 20s, OpenAI-compat 45s
- Content depth: 613 → 1,058 questions across 4 domains; every skill now ≥8 Q
  - `scripts/generate-questions-batch.ts` — idempotent, cached, rerunnable
  - Cache in `src/content/generated-questions/*.json`
  - Target adjustable via `TARGET_PER_SKILL` constant

### Tests
- 83 (unchanged from yesterday's 92 minus the 9 token tests removed in the revert)

### Notes
- Groq retired all Llama models 2026-08-16; OpenRouter removed free Llama models 2026-09-11
- Set `GROQ_MODEL`/`OPENROUTER_MODEL` env vars — never hardcode model slugs, they churn monthly
- Gemini free tier: 20 RPD on gemini-3.5-flash; Groq: 1,000 RPD; OpenRouter: 50 RPD

### Session log — 2026-10-09 (batch: fixes + coverage)

- Newly-verified detection rewritten: `detectNewlyVerifiedSkills` now compares pre/post state via a hypothetical submission passed to `getSkillEvidence(…, extra)`. Celebration fires on the run that actually crosses the threshold. (Was: relied on `priorSubmissions[1]`, one-run-late.)
- AI misconception route now falls back to a static analysis on total provider failure — parity with `/api/ai/explain` and `/api/ai/certificates`. No more 500s.
- Practical-task coverage: 43 tasks added across the 5 domains. Every skill in every domain now has ≥1 practical task. Totals — backend 25, analyst 24, scientist 29, frontend 29, ml 34.
- Domain switcher in Topbar (dropdown, single-domain badge, cookies + `revalidatePath("/", "layout")`). `setActiveDomain` now verifies selection before setting the cookie.
- Dropped `Mastery.evidenceCount` (migration `20261009150000_drop_mastery_evidence_count`). Deleted `src/app/api/misconceptions/route.ts` (zero callers). `User.image`, `User.emailVerified`, `VerificationToken` explicitly kept — adapter-owned.

### Open menu
1. Graph interactivity (search / zoom / pan)
2. CSV/JSON domain import
3. PDF upload + inline viewer
4. Content depth: 15 Q/skill for the 4 newer domains (Gemini quota — ~4 days)
