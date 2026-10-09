import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listDomainsForUser } from "@/lib/domain";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const allDomains = await listDomainsForUser(session.user.id);
  const selectedDomains = allDomains
    .filter((d) => d.isSelected)
    .map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      isActive: d.isActive,
    }));

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-60 flex min-h-screen flex-col">
        <Topbar domains={selectedDomains} />
        <main className="flex-1 p-8">{children}</main>
      </div>
      <OnboardingFlow />
    </div>
  );
}
