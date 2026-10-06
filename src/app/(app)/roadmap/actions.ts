"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

type Status = "pending" | "in-progress" | "done" | "skipped";
const VALID: Status[] = ["pending", "in-progress", "done", "skipped"];

export type SetStepInput = {
  skillId: string;
  status: Status;
  order?: number;
  priority?: number;
  reason?: string;
};

export async function setRoadmapStepStatus(input: SetStepInput) {
  const user = await requireUser();
  if (!VALID.includes(input.status)) {
    return { ok: false, error: "Invalid status." };
  }

  const skill = await prisma.skill.findUnique({
    where: { id: input.skillId },
    select: { id: true },
  });
  if (!skill) return { ok: false, error: "Skill not found." };

  const existing = await prisma.roadmapItem.findUnique({
    where: { userId_skillId: { userId: user.id, skillId: input.skillId } },
  });

  if (input.status === "pending") {
    if (existing) {
      await prisma.roadmapItem.delete({
        where: { userId_skillId: { userId: user.id, skillId: input.skillId } },
      });
    }
    revalidatePath("/roadmap");
    revalidatePath("/dashboard");
    return { ok: true };
  }

  const order = input.order ?? existing?.order ?? 0;
  const priority = input.priority ?? existing?.priority ?? 0;
  const reason = input.reason ?? existing?.reason ?? null;

  if (existing) {
    await prisma.roadmapItem.update({
      where: { userId_skillId: { userId: user.id, skillId: input.skillId } },
      data: { status: input.status, order, priority, reason },
    });
  } else {
    await prisma.roadmapItem.create({
      data: {
        userId: user.id,
        skillId: input.skillId,
        order,
        priority,
        reason,
        status: input.status,
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
  revalidatePath("/dashboard");
  return { ok: true };
}
