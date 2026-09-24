import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const domains = await prisma.domain.findMany({
    orderBy: { slug: "asc" },
    include: {
      skills: {
        orderBy: [{ difficulty: "asc" }, { slug: "asc" }],
        include: {
          parents: { include: { parent: { select: { slug: true, name: true } } } },
          children: { include: { child: { select: { slug: true, name: true } } } },
          _count: { select: { questions: true, materials: true } },
        },
      },
    },
  });

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  DOMAIN CONTENT ANALYSIS");
  console.log("═══════════════════════════════════════════════════════════════\n");

  for (const d of domains) {
    console.log(`\n${"━".repeat(63)}`);
    console.log(`📦  ${d.name}  (${d.slug})`);
    console.log(`${"━".repeat(63)}\n`);

    for (const s of d.skills) {
      const parents = s.parents.map((p) => p.parent.slug);
      const children = s.children.map((c) => c.child.slug);
      console.log(
        `  D${s.difficulty}  ${s.slug.padEnd(34)} ` +
          `Q:${String(s._count.questions).padStart(2)} ` +
          `M:${String(s._count.materials).padStart(2)} ` +
          `↑${parents.length} ↓${children.length}`
      );
      console.log(`      "${s.name}"`);
      if (parents.length > 0) {
        console.log(`      ← parents: ${parents.join(", ")}`);
      }
    }
  }

  // ── Cross-domain overlap analysis ─────────────────────────────
  console.log(`\n\n${"═".repeat(63)}`);
  console.log("  CROSS-DOMAIN SLUG OVERLAP");
  console.log(`${"═".repeat(63)}\n`);

  const slugToDomains = new Map<string, string[]>();
  const slugToNames = new Map<string, string[]>();
  for (const d of domains) {
    for (const s of d.skills) {
      if (!slugToDomains.has(s.slug)) {
        slugToDomains.set(s.slug, []);
        slugToNames.set(s.slug, []);
      }
      slugToDomains.get(s.slug)!.push(d.slug);
      slugToNames.get(s.slug)!.push(s.name);
    }
  }

  let overlapCount = 0;
  for (const [slug, doms] of slugToDomains) {
    if (doms.length > 1) {
      overlapCount++;
      console.log(`  "${slug}"`);
      console.log(`     → in ${doms.length} domains: ${doms.join(", ")}`);
      const names = slugToNames.get(slug)!;
      const uniqueNames = [...new Set(names)];
      if (uniqueNames.length > 1) {
        console.log(`     ⚠️  Different names: ${uniqueNames.join(" | ")}`);
      }
    }
  }
  if (overlapCount === 0) console.log("  (none)\n");

  // ── Similar-but-different slug detection ─────────────────────
  console.log(`\n${"═".repeat(63)}`);
  console.log("  SIMILAR SLUGS ACROSS DOMAINS (potential semantic duplicates)");
  console.log(`${"═".repeat(63)}\n`);

  const allSlugs = [...slugToDomains.keys()];
  const similarPairs: Array<[string, string]> = [];
  for (let i = 0; i < allSlugs.length; i++) {
    for (let j = i + 1; j < allSlugs.length; j++) {
      const a = allSlugs[i];
      const b = allSlugs[j];
      // Normalize: remove "and", "the", hyphens
      const norm = (s: string) =>
        s.replace(/-/g, "").replace(/and/g, "").replace(/the/g, "");
      const na = norm(a);
      const nb = norm(b);
      if (na === nb || na.includes(nb) || nb.includes(na)) {
        if (Math.abs(na.length - nb.length) < 15) {
          similarPairs.push([a, b]);
        }
      }
    }
  }

  if (similarPairs.length === 0) {
    console.log("  (none detected)\n");
  } else {
    for (const [a, b] of similarPairs) {
      console.log(`  • "${a}"`);
      console.log(`    vs "${b}"`);
      console.log(`    → in domains: ${slugToDomains.get(a)!.join(",")} vs ${slugToDomains.get(b)!.join(",")}`);
      console.log();
    }
  }

  // ── Questions referencing missing skills ──────────────────────
  console.log(`${"═".repeat(63)}`);
  console.log("  QUESTIONS WITH BROKEN SKILL REFERENCES");
  console.log(`${"═".repeat(63)}\n`);

  for (const d of domains) {
    const allQuestions = await prisma.question.findMany({
      where: { domainId: d.id },
      include: { skills: { include: { skill: { select: { slug: true } } } } },
    });
    const orphanQ = allQuestions.filter((q) => q.skills.length === 0);
    console.log(`  ${d.slug}: ${allQuestions.length} questions, ${orphanQ.length} with no skill link`);
  }

  // ── Skills with zero questions or materials ────────────────────
  console.log(`\n${"═".repeat(63)}`);
  console.log("  SKILLS LACKING CONTENT");
  console.log(`${"═".repeat(63)}\n`);

  for (const d of domains) {
    const noQ = d.skills.filter((s) => s._count.questions === 0);
    const noM = d.skills.filter((s) => s._count.materials === 0);
    if (noQ.length === 0 && noM.length === 0) {
      console.log(`  ✓ ${d.slug}: every skill has ≥1 question and ≥1 material`);
    } else {
      console.log(`  ${d.slug}:`);
      if (noQ.length > 0) {
        console.log(`     ⚠️  No questions: ${noQ.map((s) => s.slug).join(", ")}`);
      }
      if (noM.length > 0) {
        console.log(`     ⚠️  No materials: ${noM.map((s) => s.slug).join(", ")}`);
      }
    }
  }

  // ── Isolated / root skills (no parents) ───────────────────────
  console.log(`\n${"═".repeat(63)}`);
  console.log("  ROOT SKILLS (no prerequisites)");
  console.log(`${"═".repeat(63)}\n`);

  for (const d of domains) {
    const roots = d.skills.filter((s) => s.parents.length === 0);
    console.log(`  ${d.slug}: ${roots.length} root skills`);
    for (const s of roots) {
      console.log(`     D${s.difficulty}  ${s.slug}`);
    }
  }

  console.log("\n✅ Analysis complete\n");
}

main()
  .catch((e) => {
    console.error("❌", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
