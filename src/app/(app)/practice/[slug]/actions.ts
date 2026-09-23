"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { z } from "zod";

const ResultSchema = z.object({
  description: z.string(),
  passed: z.boolean(),
  error: z.string().optional(),
});

const Schema = z.object({
  taskId: z.string(),
  code: z.string(),
  results: z.array(ResultSchema),
});

export async function saveSubmission(input: {
  taskId: string;
  code: string;
  results: { description: string; passed: boolean; error?: string }[];
}) {
  const user = await requireUser();
  const parsed = Schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid submission" };
  }

  const { taskId, code, results } = parsed.data;
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const passedAll = total > 0 && passed === total;

  await prisma.practicalSubmission.create({
    data: {
      userId: user.id,
      taskId,
      code,
      passed,
      total,
      passedAll,
      results: results as never,
    },
  });

  revalidatePath("/practice");
  revalidatePath("/dashboard");
  return { ok: true, passed, total, passedAll };
}
