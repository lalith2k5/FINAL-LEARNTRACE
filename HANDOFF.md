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