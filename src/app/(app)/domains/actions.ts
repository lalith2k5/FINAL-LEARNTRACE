"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

const MAX_DOMAINS = 3;
const COOKIE_NAME = "lt_active_domain";

export async function selectDomain(domainId: string) {
  const user = await requireUser();

  const count = await prisma.userDomain.count({ where: { userId: user.id } });
  if (count >= MAX_DOMAINS) {
    return { ok: false, error: `You can select at most ${MAX_DOMAINS} domains.` };
  }

  await prisma.userDomain.upsert({
    where: { userId_domainId: { userId: user.id, domainId } },
    update: {},
    create: { userId: user.id, domainId },
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, domainId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/domains");
  revalidatePath("/dashboard");

  redirect("/dashboard");
}

export async function deselectDomain(domainId: string) {
  const user = await requireUser();

  await prisma.userDomain.deleteMany({
    where: { userId: user.id, domainId },
  });

  const cookieStore = await cookies();
  const current = cookieStore.get(COOKIE_NAME)?.value;
  if (current === domainId) {
    cookieStore.delete(COOKIE_NAME);
  }

  revalidatePath("/domains");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setActiveDomain(domainId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, domainId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/domains");
  return { ok: true };
}
