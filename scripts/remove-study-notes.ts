import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const mode = process.argv[2] ?? "dry";

  const notes = await prisma.material.findMany({
    where: {
      type: "note",
    },
    include: {
      skills: { include: { skill: true } },
    },
    orderBy: { title: "asc" },
  });

  console.log(`\n📝 Found ${notes.length} note materials\n`);
  for (const n of notes) {
    const skill = n.skills[0]?.skill.name ?? "?";
    console.log(`   ${skill.padEnd(40).slice(0, 40)}  ${n.title}`);
  }

  if (mode === "dry") {
    console.log(`\n🔎 Dry run — nothing deleted.`);
    console.log(`   To delete, run: pnpm tsx scripts/remove-study-notes.ts delete`);
    return;
  }

  if (mode === "delete") {
    const ids = notes.map((n) => n.id);
    const result = await prisma.material.deleteMany({
      where: { id: { in: ids } },
    });
    console.log(`\n🗑️  Deleted ${result.count} notes`);
    console.log(`   (MaterialSkill rows cascade-deleted automatically)`);
  }
}

main()
  .catch((e) => {
    console.error("❌", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
