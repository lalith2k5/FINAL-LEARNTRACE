"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

export async function toggleMaterialComplete(
  materialId: string,
  nextState: boolean,
  skillId: string
) {
  const user = await requireUser();

  await prisma.materialProgress.upsert({
    where: {
      userId_materialId: { userId: user.id, materialId },
    },
    update: {
      completed: nextState,
      completedAt: nextState ? new Date() : null,
    },
    create: {
      userId: user.id,
      materialId,
      completed: nextState,
      completedAt: nextState ? new Date() : null,
    },
  });

  revalidatePath(`/learn/${skillId}`);
  revalidatePath("/dashboard");
}
