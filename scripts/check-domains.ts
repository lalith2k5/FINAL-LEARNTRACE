import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const domains = await prisma.domain.findMany({
    orderBy: { slug: "asc" },
    include: {
      _count: {
        select: {
          skills: true,
          questions: true,
          materials: true,
          practicalTasks: true,
        },
      },
    },
  });

  console.log("\n🌐 Domains in DB:\n");
  console.log("SLUG                SKILLS  QUES  MAT  PRACT");
  console.log("─".repeat(50));
  for (const d of domains) {
    console.log(
      `${d.slug.padEnd(20)}${String(d._count.skills).padStart(6)}${String(
        d._count.questions
      ).padStart(6)}${String(d._count.materials).padStart(5)}${String(
        d._count.practicalTasks
      ).padStart(6)}`
    );
  }
  console.log("─".repeat(50));
}

main()
  .catch((e) => { console.error("❌", e?.message ?? e); process.exit(1); })
  .finally(() => prisma.$disconnect());
