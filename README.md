# LearnTrace

**An AI-driven knowledge graph and knowledge tracing framework for skill gap detection and personalized learning.**

LearnTrace models skills and their prerequisite relationships, estimates learner mastery over time, identifies high-priority skill gaps, and generates personalized learning paths — with an AI tutor, adaptive assessment, and hands-on coding tasks.

---

## The Idea

Most learning platforms track **course completion**, not **actual mastery**. LearnTrace goes further:

- **Prerequisite-aware intelligence** — finds gaps that block downstream skills, not just low scores
- **Evidence-based learner model** — mastery inferred from correctness, difficulty, response time, and confidence
- **Adaptive difficulty** — the next question responds to your last 3 answers
- **Knowledge decay** — skills lose mastery over time; the app tells you what to revise
- **Misconception detection** — flags repeated wrong reasoning, not just wrong answers
- **Theory vs practical** — separates conceptual knowledge from demonstrated application
- **What-If simulator** — "What if I skip Probability?" projected through the prerequisite DAG
- **AI tutor** — every wrong answer becomes a 4-part tutoring moment
- **In-browser Python** — hands-on coding tasks with test-case feedback

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 + custom design tokens |
| DB | PostgreSQL 16 (Docker) |
| ORM | Prisma 6 |
| Auth | NextAuth v5 (Credentials + Google OAuth) |
| AI | Google Gemini 3.6 Flash |
| Code execution | Piston API (public Python runner) |
| Viz | React Flow + Recharts + Framer Motion |
| Tests | Vitest (35 unit tests) |

---

## Features

### Learning loop
- Diagnostic assessment (15 questions, adaptive)
- Focused quiz mode (5 per skill, pick up to 3)
- Per-skill mastery tracking with Bayesian-weighted updates
- Concept reassessment with before/after comparison
- Knowledge graph (React Flow) with mastery-colored nodes + verified badges
- Skill gaps ranked by Dependency Impact Score
- Personalized roadmap (topological sort + impact ranking)
- Learning materials with markdown notes, PDF upload + inline viewer, video embeds
- Practical coding tasks with in-browser Python execution
- Theory/practical evidence panel with verified state

### AI features
- Tutor explanations on wrong answers (Gemini, cached, retry-safe)
- AI certificate recommendations on the final report (with static fallback)
- Content generation pipeline (used to build the skill graph)

### Platform
- Email/password + Google sign-in
- Profile page with activity stats
- Progress history timeline
- Multi-domain framework (max 3 per user)
- Loading skeletons + error boundaries on every route

---

## Getting Started

### Prerequisites
- Node 20+
- pnpm (`brew install pnpm`)
- Docker Desktop (for Postgres)
- A Gemini API key from aistudio.google.com/apikey

### Setup

```bash
git clone <your-repo-url> learntrace
cd learntrace
pnpm install

docker run --name learntrace-pg \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_USER=dev \
  -e POSTGRES_DB=learntrace \
  -p 5433:5432 -d postgres:16

cp .env.example .env.local

pnpm db:migrate
pnpm db:seed
pnpm db:seed-practical
pnpm db:seed-questions

pnpm dev
EOF_MARK

**A short guide**

For a full walkthrough and the mastery formula, see the source in `src/lib/mastery/`.
