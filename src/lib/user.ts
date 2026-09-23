import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Server-side helper: returns the current Prisma User from the session.
 * Redirects to /login if not authenticated or user missing in DB.
 */
export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * API-route variant: returns null if unauthenticated (caller returns 401).
 * Use inside /api routes where redirect() isn't appropriate.
 */
export async function requireUserApi() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  return user;
}
