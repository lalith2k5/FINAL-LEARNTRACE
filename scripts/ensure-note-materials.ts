import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📝 Ensuring every skill has a note-type material...\n");

  const domain = await prisma.domain.findUnique({
    where: { slug: "ml-engineer" },
    include: {
      skills: {
        include: {
          materials: {
            include: { material: true },
          },
        },
      },
    },
  });

  if (!domain) {
    console.error("❌ Domain 'ml-engineer' not found.");
    process.exit(1);
  }

  let created = 0;
  let alreadyHad = 0;

  for (const skill of domain.skills) {
    const hasNote = skill.materials.some(
      (ms) => ms.material.type === "note"
    );

    if (hasNote) {
      alreadyHad++;
      continue;
    }

    const material = await prisma.material.create({
      data: {
        domainId: domain.id,
        title: `${skill.name} — Study Notes`,
        type: "note",
        body: null,
      },
    });

    await prisma.materialSkill.create({
      data: {
        materialId: material.id,
        skillId: skill.id,
      },
    });

    console.log(`   ✅ Created note placeholder for: ${skill.name}`);
    created++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Skills total:          ${domain.skills.length}`);
  console.log(`   Already had a note:    ${alreadyHad}`);
  console.log(`   New note placeholders: ${created}`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
