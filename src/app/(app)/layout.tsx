import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-60 flex min-h-screen flex-col">
        <Topbar />
        <main className="flex-1 p-8">{children}</main>
      </div>
      <OnboardingFlow />
    </div>
  );
}
