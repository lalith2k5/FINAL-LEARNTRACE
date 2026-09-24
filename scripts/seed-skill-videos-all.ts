import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type VideoSeed = { domainSlug: string; skillSlug: string; title: string; url: string };

const VIDEOS: VideoSeed[] = [
  // ═══════════════════════════════════════════════════════════════
  // BACKEND ENGINEER
  // ═══════════════════════════════════════════════════════════════
  { domainSlug: "backend-engineer", skillSlug: "programming-fundamentals", title: "CS50 2023 — Introduction to Computer Science", url: "https://www.youtube.com/watch?v=8mAITcNt710" },
  { domainSlug: "backend-engineer", skillSlug: "http-and-rest", title: "REST APIs Explained — What is REST?", url: "https://www.youtube.com/watch?v=lsMQRaeKNDk" },
  { domainSlug: "backend-engineer", skillSlug: "git-version-control", title: "Git and GitHub for Beginners — Crash Course", url: "https://www.youtube.com/watch?v=RGOj5yH7evk" },
  { domainSlug: "backend-engineer", skillSlug: "sql-databases", title: "Learn SQL in 1 Hour — SQL Tutorial for Beginners", url: "https://www.youtube.com/watch?v=7S_tz1z_5bA" },
  { domainSlug: "backend-engineer", skillSlug: "data-structures-and-algorithms", title: "Data Structures Easy to Advanced — Full Course", url: "https://www.youtube.com/watch?v=RBSGKlAvoiM" },
  { domainSlug: "backend-engineer", skillSlug: "web-frameworks", title: "Express JS Crash Course", url: "https://www.youtube.com/watch?v=L72fhGm1tfE" },
  { domainSlug: "backend-engineer", skillSlug: "api-design", title: "REST API Design Best Practices", url: "https://www.youtube.com/watch?v=7nm1pYuKAhY" },
  { domainSlug: "backend-engineer", skillSlug: "error-handling", title: "Exception Handling in Python — Best Practices", url: "https://www.youtube.com/watch?v=NIWwJbo-9_8" },
  { domainSlug: "backend-engineer", skillSlug: "testing", title: "Test-Driven Development in Python", url: "https://www.youtube.com/watch?v=EgpLj86ZHFQ" },
  { domainSlug: "backend-engineer", skillSlug: "authentication-authorization", title: "JWT Authentication — Full Guide", url: "https://www.youtube.com/watch?v=7Q17ubqLfaM" },
  { domainSlug: "backend-engineer", skillSlug: "caching", title: "Redis Crash Course — Caching Strategies", url: "https://www.youtube.com/watch?v=XCsS_NVAa1g" },
  { domainSlug: "backend-engineer", skillSlug: "message-queues", title: "System Design: Message Queues Explained", url: "https://www.youtube.com/watch?v=oUJbuFMyBDk" },
  { domainSlug: "backend-engineer", skillSlug: "orm-and-migrations", title: "Introduction to Prisma — ORM for Node.js", url: "https://www.youtube.com/watch?v=RebA5J-rlwg" },
  { domainSlug: "backend-engineer", skillSlug: "docker", title: "Docker Tutorial for Beginners — Full Course", url: "https://www.youtube.com/watch?v=fqMOX6JJhGo" },
  { domainSlug: "backend-engineer", skillSlug: "ci-cd", title: "GitHub Actions Tutorial — CI/CD Pipeline", url: "https://www.youtube.com/watch?v=R8_veQiYBjI" },
  { domainSlug: "backend-engineer", skillSlug: "database-performance", title: "SQL Indexes Explained — Query Optimization", url: "https://www.youtube.com/watch?v=-qNSXK7s7_w" },
  { domainSlug: "backend-engineer", skillSlug: "monitoring-observability", title: "Observability vs Monitoring Explained", url: "https://www.youtube.com/watch?v=cYAE0ZhT43c" },
  { domainSlug: "backend-engineer", skillSlug: "distributed-systems", title: "Distributed Systems in One Lesson", url: "https://www.youtube.com/watch?v=Y6Ev8GIlbxc" },
  { domainSlug: "backend-engineer", skillSlug: "security-best-practices", title: "OWASP Top 10 Explained", url: "https://www.youtube.com/watch?v=rWHvp7rUka8" },
  { domainSlug: "backend-engineer", skillSlug: "system-design", title: "System Design Interview — Beginner's Guide", url: "https://www.youtube.com/watch?v=i7twT3x5yv8" },

  // ═══════════════════════════════════════════════════════════════
  // FRONTEND ENGINEER
  // ═══════════════════════════════════════════════════════════════
  { domainSlug: "frontend-engineer", skillSlug: "html-fundamentals", title: "HTML Full Course — Build a Website Tutorial", url: "https://www.youtube.com/watch?v=pQN-pnXPaVg" },
  { domainSlug: "frontend-engineer", skillSlug: "css-fundamentals", title: "CSS Tutorial — Zero to Hero", url: "https://www.youtube.com/watch?v=1Rs2ND1ryYc" },
  { domainSlug: "frontend-engineer", skillSlug: "javascript-basics", title: "JavaScript Programming — Full Course", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg" },
  { domainSlug: "frontend-engineer", skillSlug: "git-version-control", title: "Git and GitHub for Beginners — Crash Course", url: "https://www.youtube.com/watch?v=RGOj5yH7evk" },
  { domainSlug: "frontend-engineer", skillSlug: "css-layout", title: "Flexbox vs Grid — The Complete Guide", url: "https://www.youtube.com/watch?v=hs3piaN4b5I" },
  { domainSlug: "frontend-engineer", skillSlug: "dom-manipulation", title: "JavaScript DOM Manipulation — Full Course", url: "https://www.youtube.com/watch?v=y17RuWkWdn8" },
  { domainSlug: "frontend-engineer", skillSlug: "async-javascript", title: "Async JavaScript — Promises and async/await", url: "https://www.youtube.com/watch?v=PoRJizFvM7s" },
  { domainSlug: "frontend-engineer", skillSlug: "responsive-design", title: "Responsive Web Design — Complete Tutorial", url: "https://www.youtube.com/watch?v=srvUrASNj0s" },
  { domainSlug: "frontend-engineer", skillSlug: "http-and-apis", title: "Fetch API in JavaScript — Complete Tutorial", url: "https://www.youtube.com/watch?v=cuEtnrL9-H0" },
  { domainSlug: "frontend-engineer", skillSlug: "typescript-fundamentals", title: "TypeScript Course for Beginners", url: "https://www.youtube.com/watch?v=BwuLxPH8IDs" },
  { domainSlug: "frontend-engineer", skillSlug: "react-fundamentals", title: "React Course — Beginner's Tutorial", url: "https://www.youtube.com/watch?v=bMknfKXIFA8" },
  { domainSlug: "frontend-engineer", skillSlug: "state-management", title: "React State Management — Every Option Explained", url: "https://www.youtube.com/watch?v=O6P86uwfdR0" },
  { domainSlug: "frontend-engineer", skillSlug: "forms-and-validation", title: "React Hook Form Tutorial", url: "https://www.youtube.com/watch?v=JyeWoqWsQFo" },
  { domainSlug: "frontend-engineer", skillSlug: "accessibility", title: "Web Accessibility — Full Course", url: "https://www.youtube.com/watch?v=e2nkq3h1P68" },
  { domainSlug: "frontend-engineer", skillSlug: "routing", title: "React Router v6 — Complete Tutorial", url: "https://www.youtube.com/watch?v=Ul3y1LXxzdU" },
  { domainSlug: "frontend-engineer", skillSlug: "testing-frontend", title: "React Testing Library Crash Course", url: "https://www.youtube.com/watch?v=8vfQ6SWBZ-U" },
  { domainSlug: "frontend-engineer", skillSlug: "css-architecture", title: "Tailwind CSS Full Course", url: "https://www.youtube.com/watch?v=pfaSUYaSgRo" },
  { domainSlug: "frontend-engineer", skillSlug: "web-performance", title: "Core Web Vitals — What They Are & How to Improve", url: "https://www.youtube.com/watch?v=AQqFZ5t8uNc" },
  { domainSlug: "frontend-engineer", skillSlug: "build-tools", title: "Vite Crash Course — Faster Frontend Tooling", url: "https://www.youtube.com/watch?v=89NJdbYTgJ8" },
  { domainSlug: "frontend-engineer", skillSlug: "frontend-architecture", title: "Frontend System Design — Complete Guide", url: "https://www.youtube.com/watch?v=9-r0RuX0pqk" },
  // ═══════════════════════════════════════════════════════════════
  // DATA ANALYST
  // ═══════════════════════════════════════════════════════════════
  { domainSlug: "data-analyst", skillSlug: "spreadsheet-analysis", title: "Excel Full Course for Data Analytics", url: "https://www.youtube.com/watch?v=Vl0H-qTclOg" },
  { domainSlug: "data-analyst", skillSlug: "sql-fundamentals", title: "SQL Tutorial — Full Course", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY" },
  { domainSlug: "data-analyst", skillSlug: "descriptive-statistics", title: "Statistics Fundamentals — Full Course", url: "https://www.youtube.com/watch?v=xxpc-HPKN28" },
  { domainSlug: "data-analyst", skillSlug: "data-cleaning", title: "Data Cleaning in Python — Full Tutorial", url: "https://www.youtube.com/watch?v=bDhvCp3_lYw" },
  { domainSlug: "data-analyst", skillSlug: "sql-joins", title: "SQL Joins Explained — All Types", url: "https://www.youtube.com/watch?v=9yeOJ0ZMUYw" },
  { domainSlug: "data-analyst", skillSlug: "python-for-analysts", title: "Pandas Tutorial — Data Analysis with Python", url: "https://www.youtube.com/watch?v=vmEHCJofslg" },
  { domainSlug: "data-analyst", skillSlug: "exploratory-data-analysis", title: "Exploratory Data Analysis — Full Tutorial", url: "https://www.youtube.com/watch?v=Liv6eeb1VfE" },
  { domainSlug: "data-analyst", skillSlug: "data-visualization", title: "Matplotlib & Seaborn Full Tutorial", url: "https://www.youtube.com/watch?v=3Xc3CA655Y4" },
  { domainSlug: "data-analyst", skillSlug: "inferential-statistics", title: "Inferential Statistics — Full Course", url: "https://www.youtube.com/watch?v=6E6pB5JFLgM" },
  { domainSlug: "data-analyst", skillSlug: "business-metrics-kpis", title: "Business Metrics Every Analyst Should Know", url: "https://www.youtube.com/watch?v=ItZlTixh6Bs" },
  { domainSlug: "data-analyst", skillSlug: "sql-subqueries-ctes", title: "SQL Window Functions, CTEs, Subqueries", url: "https://www.youtube.com/watch?v=Ww71knvhQ-s" },
  { domainSlug: "data-analyst", skillSlug: "hypothesis-testing", title: "Hypothesis Testing Explained — Full Course", url: "https://www.youtube.com/watch?v=0zZYBALbZgg" },
  { domainSlug: "data-analyst", skillSlug: "ab-testing", title: "A/B Testing — Full Course", url: "https://www.youtube.com/watch?v=zFMgpxG-chM" },
  { domainSlug: "data-analyst", skillSlug: "regression-analysis", title: "Linear Regression — Statistics Fundamentals", url: "https://www.youtube.com/watch?v=nk2CQITm_eo" },
  { domainSlug: "data-analyst", skillSlug: "tableau-power-bi", title: "Power BI Full Course for Beginners", url: "https://www.youtube.com/watch?v=FwjaHCVNBWA" },
  { domainSlug: "data-analyst", skillSlug: "dashboard-design", title: "Dashboard Design Principles", url: "https://www.youtube.com/watch?v=VaNUOVnULkI" },
  { domainSlug: "data-analyst", skillSlug: "cohort-analysis", title: "Cohort Analysis Explained — Retention Metrics", url: "https://www.youtube.com/watch?v=5O4ST-R5ZVw" },
  { domainSlug: "data-analyst", skillSlug: "funnel-analysis", title: "Funnel Analysis Explained", url: "https://www.youtube.com/watch?v=LavXIrDVNOQ" },
  { domainSlug: "data-analyst", skillSlug: "customer-segmentation", title: "Customer Segmentation with RFM Analysis", url: "https://www.youtube.com/watch?v=i-HNJZeOOMY" },
  { domainSlug: "data-analyst", skillSlug: "data-storytelling", title: "Data Storytelling — Full Course", url: "https://www.youtube.com/watch?v=SvVucB-oISo" },
  // ═══════════════════════════════════════════════════════════════
  // DATA SCIENTIST
  // ═══════════════════════════════════════════════════════════════
  { domainSlug: "data-scientist", skillSlug: "python-for-data-science", title: "Python for Data Science — Full Course", url: "https://www.youtube.com/watch?v=LHBE6Q9XlzI" },
  { domainSlug: "data-scientist", skillSlug: "probability", title: "Probability — Full Course (Khan Academy)", url: "https://www.youtube.com/watch?v=uzkc-qNVoOk" },
  { domainSlug: "data-scientist", skillSlug: "descriptive-statistics", title: "Descriptive Statistics — Full Tutorial", url: "https://www.youtube.com/watch?v=xxpc-HPKN28" },
  { domainSlug: "data-scientist", skillSlug: "linear-algebra", title: "Essence of Linear Algebra", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" },
  { domainSlug: "data-scientist", skillSlug: "data-wrangling", title: "Data Wrangling with Pandas — Full Course", url: "https://www.youtube.com/watch?v=r-uOLxNrNk8" },
  { domainSlug: "data-scientist", skillSlug: "exploratory-data-analysis", title: "Exploratory Data Analysis — Full Tutorial", url: "https://www.youtube.com/watch?v=Liv6eeb1VfE" },
  { domainSlug: "data-scientist", skillSlug: "data-visualization", title: "Data Visualization in Python — Full Course", url: "https://www.youtube.com/watch?v=UO98lJQ3QGI" },
  { domainSlug: "data-scientist", skillSlug: "inferential-statistics", title: "Inferential Statistics — Full Course", url: "https://www.youtube.com/watch?v=6E6pB5JFLgM" },
  { domainSlug: "data-scientist", skillSlug: "sql-for-analysis", title: "SQL for Data Science — Full Course", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY" },
  { domainSlug: "data-scientist", skillSlug: "regression-analysis", title: "StatQuest: Linear Regression", url: "https://www.youtube.com/watch?v=PaFPbb66DxQ" },
  { domainSlug: "data-scientist", skillSlug: "classification", title: "StatQuest: Logistic Regression", url: "https://www.youtube.com/watch?v=yIYKR4sgzI8" },
  { domainSlug: "data-scientist", skillSlug: "feature-engineering", title: "Feature Engineering Full Course", url: "https://www.youtube.com/watch?v=ma-h30PoFms" },
  { domainSlug: "data-scientist", skillSlug: "model-evaluation-metrics", title: "Model Evaluation Metrics — Full Guide", url: "https://www.youtube.com/watch?v=trg3YkCsjqE" },
  { domainSlug: "data-scientist", skillSlug: "experimental-design", title: "Experimental Design — Full Course", url: "https://www.youtube.com/watch?v=m6WoQpggrAY" },
  { domainSlug: "data-scientist", skillSlug: "ab-testing", title: "A/B Testing — Full Course", url: "https://www.youtube.com/watch?v=zFMgpxG-chM" },
  { domainSlug: "data-scientist", skillSlug: "clustering-algorithms", title: "StatQuest: K-means Clustering", url: "https://www.youtube.com/watch?v=4b5d3muPQmA" },
  { domainSlug: "data-scientist", skillSlug: "time-series-analysis", title: "Time Series Analysis — Full Course", url: "https://www.youtube.com/watch?v=e8Yw4alG16Q" },
  { domainSlug: "data-scientist", skillSlug: "causal-inference", title: "Causal Inference — Full Course", url: "https://www.youtube.com/watch?v=gRkUhg9Wb-I" },
  { domainSlug: "data-scientist", skillSlug: "ml-in-production", title: "Designing Machine Learning Systems", url: "https://www.youtube.com/watch?v=0RsmRjar66E" },
  { domainSlug: "data-scientist", skillSlug: "data-science-communication", title: "Data Storytelling — Full Course", url: "https://www.youtube.com/watch?v=So4_o3w0m1s" },
];

async function checkUrl(url: string): Promise<boolean> {
  try {
    const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembed, { method: "GET", signal: AbortSignal.timeout(8000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const mode = process.argv[2] ?? "check";
  console.log(`📺 Multi-domain video seed — mode: ${mode}\n`);

  if (mode === "check") {
    let ok = 0, bad = 0;
    const failures: string[] = [];
    for (const v of VIDEOS) {
      const valid = await checkUrl(v.url);
      if (valid) { ok++; }
      else {
        bad++;
        failures.push(`${v.domainSlug}/${v.skillSlug}`);
        console.log(`  ✗ ${v.domainSlug}/${v.skillSlug}`);
      }
    }
    console.log(`\n📊 ${ok} ok / ${bad} bad`);
    if (bad > 0) {
      console.log(`\nFailed skills:`);
      for (const f of failures) console.log(`  • ${f}`);
      console.log(`\nFix those URLs in scripts/seed-skill-videos-all.ts, then re-check.`);
    } else {
      console.log(`\nAll valid. Run: pnpm tsx scripts/seed-skill-videos-all.ts seed`);
    }
    return;
  }

  if (mode === "seed") {
    const domainSlugs = [...new Set(VIDEOS.map((v) => v.domainSlug))];
    const domainMap = new Map<string, string>();
    for (const slug of domainSlugs) {
      const d = await prisma.domain.findUnique({ where: { slug } });
      if (!d) { console.error(`❌ Domain ${slug} not found`); process.exit(1); }
      domainMap.set(slug, d.id);
    }

    let created = 0, skippedExisting = 0, skippedMissing = 0, skippedBad = 0;

    for (const v of VIDEOS) {
      const domainId = domainMap.get(v.domainSlug)!;
      const skill = await prisma.skill.findUnique({
        where: { domainId_slug: { domainId, slug: v.skillSlug } },
      });
      if (!skill) {
        console.log(`  ⚠️  Skill not found: ${v.domainSlug}/${v.skillSlug}`);
        skippedMissing++;
        continue;
      }

      const existing = await prisma.materialSkill.findFirst({
        where: { skillId: skill.id, material: { type: "video" } },
      });
      if (existing) { skippedExisting++; continue; }

      const valid = await checkUrl(v.url);
      if (!valid) {
        console.log(`  ✗ Bad URL: ${v.domainSlug}/${v.skillSlug}`);
        skippedBad++;
        continue;
      }

      const material = await prisma.material.create({
        data: { domainId, title: v.title, type: "video", url: v.url },
      });
      await prisma.materialSkill.create({
        data: { materialId: material.id, skillId: skill.id },
      });
      console.log(`  ✅ [${v.domainSlug}] ${v.skillSlug}: ${v.title}`);
      created++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created:             ${created}`);
    console.log(`   Skipped (existing):  ${skippedExisting}`);
    console.log(`   Skipped (missing):   ${skippedMissing}`);
    console.log(`   Skipped (bad URL):   ${skippedBad}`);

    console.log(`\n📈 Per-domain video totals:`);
    for (const slug of domainSlugs) {
      const count = await prisma.material.count({
        where: { domainId: domainMap.get(slug)!, type: "video" },
      });
      console.log(`   ${slug.padEnd(24)} ${count}`);
    }
  }
}

main()
  .catch((e) => { console.error("❌", e?.message ?? e); process.exit(1); })
  .finally(() => prisma.$disconnect());
