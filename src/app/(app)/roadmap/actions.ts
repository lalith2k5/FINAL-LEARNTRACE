"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

const VALID = new Set(["pending", "in-progress", "done", "skipped"]);

export async function setRoadmapStepStatus(
  skillId: string,
  status: string
) {
  const user = await requireUser();
  if (!VALID.has(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    select: { id: true },
  });
  if (!skill) return { ok: false, error: "Skill not found." };

  const existing = await prisma.roadmapItem.findUnique({
    where: { userId_skillId: { userId: user.id, skillId } },
  });

  if (existing) {
    await prisma.roadmapItem.update({
      where: { userId_skillId: { userId: user.id, skillId } },
      data: { status },
    });
  } else {
    await prisma.roadmapItem.create({
      data: {
        userId: user.id,
        skillId,
        order: 0,
        priority: 0,
        status,
      },
    });
  }

  revalidatePath("/roadmap");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function clearRoadmapOverrides() {
  const user = await requireUser();
  await prisma.roadmapItem.deleteMany({ where: { userId: user.id } });
  revalidatePath("/roadmap");
  return { ok: true };
}
