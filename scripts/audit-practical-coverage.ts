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
        include: { practicalTasks: { select: { taskId: true } } },
      },
      practicalTasks: { select: { id: true } },
    },
  });

  for (const d of domains) {
    const covered = d.skills.filter((s) => s.practicalTasks.length > 0);
    const uncovered = d.skills.filter((s) => s.practicalTasks.length === 0);
    const pct = ((covered.length / d.skills.length) * 100).toFixed(0);
    console.log(
      `\n${d.slug}  —  ${covered.length}/${d.skills.length} skills covered (${pct}%), ${d.practicalTasks.length} tasks total`
    );
    if (uncovered.length > 0) {
      console.log(`  Uncovered (${uncovered.length}):`);
      for (const s of uncovered) {
        console.log(`    D${s.difficulty}  ${s.slug}`);
      }
    }
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
