import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const domains = await prisma.domain.findMany({
    orderBy: { slug: "asc" },
    include: {
      skills: { select: { id: true, difficulty: true } },
      _count: {
        select: { skills: true, questions: true, materials: true, practicalTasks: true },
      },
    },
  });

  console.log("\n🌐 Domain verification\n");
  console.log("SLUG                SKILLS  D1  D2  D3  D4  D5  QUES  MAT  PRACT");
  console.log("─".repeat(72));

  for (const d of domains) {
    const byDiff = [1, 2, 3, 4, 5].map(
      (lvl) => d.skills.filter((s) => s.difficulty === lvl).length
    );
    console.log(
      `${d.slug.padEnd(20)}${String(d._count.skills).padStart(6)}` +
        byDiff.map((n) => String(n).padStart(4)).join("") +
        String(d._count.questions).padStart(6) +
        String(d._count.materials).padStart(5) +
        String(d._count.practicalTasks).padStart(7)
    );
  }

  console.log("─".repeat(72));

  const totals = domains.reduce(
    (acc, d) => ({
      skills: acc.skills + d._count.skills,
      questions: acc.questions + d._count.questions,
      materials: acc.materials + d._count.materials,
      practicalTasks: acc.practicalTasks + d._count.practicalTasks,
    }),
    { skills: 0, questions: 0, materials: 0, practicalTasks: 0 }
  );
  console.log(
    `TOTAL               ${String(totals.skills).padStart(6)}${" ".repeat(
      20
    )}${String(totals.questions).padStart(6)}${String(totals.materials).padStart(
      5
    )}${String(totals.practicalTasks).padStart(7)}`
  );

  // Per-domain integrity checks
  console.log("\n🔎 Integrity checks\n");
  for (const d of domains) {
    // Find prereqs where parent or child isn't in this domain
    const prereqs = await prisma.prerequisite.findMany({
      where: {
        OR: [
          { parent: { domainId: d.id } },
          { child: { domainId: d.id } },
        ],
      },
      include: {
        parent: { select: { domainId: true, name: true } },
        child: { select: { domainId: true, name: true } },
      },
    });

    const crossDomain = prereqs.filter(
      (p) => p.parent.domainId !== d.id || p.child.domainId !== d.id
    );

    // Orphan skills (no questions, no materials)
    const orphanSkills = await prisma.skill.findMany({
      where: {
        domainId: d.id,
        questions: { none: {} },
        materials: { none: {} },
      },
      select: { slug: true },
    });

    // Skills with no prereqs and no children (isolated)
    const isolatedSkills = await prisma.skill.findMany({
      where: {
        domainId: d.id,
        parents: { none: {} },
        children: { none: {} },
      },
      select: { slug: true },
    });

    console.log(`${d.slug}:`);
    console.log(`   Cross-domain prereqs:  ${crossDomain.length}`);
    console.log(`   Orphan skills:         ${orphanSkills.length}`);
    if (orphanSkills.length > 0) {
      console.log(`     → ${orphanSkills.map((s) => s.slug).join(", ")}`);
    }
    console.log(`   Isolated skills:       ${isolatedSkills.length}`);
    if (isolatedSkills.length > 0) {
      console.log(`     → ${isolatedSkills.map((s) => s.slug).join(", ")}`);
    }
  }
}

main()
  .catch((e) => {
    console.error("❌", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
