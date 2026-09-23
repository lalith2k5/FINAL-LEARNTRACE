"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

const UpdateSchema = z.object({
  name: z.string().min(1).max(60),
});

export async function updateProfile(input: { name: string }) {
  const user = await requireUser();
  const parsed = UpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Name must be 1–60 characters." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
