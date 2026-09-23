import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const ACTIVE_DOMAIN_COOKIE = "lt_active_domain";
export const MAX_DOMAINS_PER_USER = 3;

export type DomainSummary = {
  id: string;
  slug: string;
  name: string;
  description: string;
  skillCount: number;
  isSelected: boolean;
  isActive: boolean;
};

export async function getActiveDomain(userId: string) {
  const cookieStore = await cookies();
  const cookieDomainId = cookieStore.get(ACTIVE_DOMAIN_COOKIE)?.value;

  if (cookieDomainId) {
    const userDomain = await prisma.userDomain.findUnique({
      where: { userId_domainId: { userId, domainId: cookieDomainId } },
      include: { domain: true },
    });
    if (userDomain) return userDomain.domain;
  }

  const firstSelected = await prisma.userDomain.findFirst({
    where: { userId },
    include: { domain: true },
    orderBy: { createdAt: "asc" },
  });
  if (firstSelected) return firstSelected.domain;

  return null;
}

export async function listDomainsForUser(
  userId: string
): Promise<DomainSummary[]> {
  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_DOMAIN_COOKIE)?.value;

  const domains = await prisma.domain.findMany({
    include: {
      _count: { select: { skills: true } },
      users: { where: { userId } },
    },
    orderBy: { name: "asc" },
  });

  return domains.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    description: d.description,
    skillCount: d._count.skills,
    isSelected: d.users.length > 0,
    isActive: d.id === activeId,
  }));
}

export async function requireActiveDomain(userId: string) {
  const domain = await getActiveDomain(userId);
  if (!domain) {
    redirect("/domains");
  }
  // `redirect` throws, so `domain` is guaranteed non-null here.
  return domain!;
}
