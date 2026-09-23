import { PageHeader } from "@/components/shared/PageHeader";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SignOutButton } from "@/components/profile/SignOutButton";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import Link from "next/link";
import { AppearanceSection } from "@/components/settings/AppearanceSection";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();

  const [attempts, sessions, masteryRows, submissions, userDomains] =
    await Promise.all([
      prisma.attempt.count({ where: { userId: user.id } }),
      prisma.assessmentSession.count({ where: { userId: user.id } }),
      prisma.mastery.count({ where: { userId: user.id } }),
      prisma.practicalSubmission.count({ where: { userId: user.id } }),
      prisma.userDomain.findMany({
        where: { userId: user.id },
        include: { domain: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="Your account"
        description="Manage your identity and review your activity."
      />

      <div className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left: form + history link */}
        <div className="space-y-6">
          <ProfileForm initialName={user.name ?? ""} email={user.email} />

          <GlassPanel>
            <div className="flex items-center justify-between">
              <div>
                <p className="label-mono">Progress history</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Every attempt, quiz, and code submission — in one timeline.
                </p>
              </div>
              <Link href="/profile/history" className="btn-primary text-xs">
                View history →
              </Link>
            </div>
          </GlassPanel>
                    <AppearanceSection />


          <GlassPanel>
            <p className="label-mono mb-3">Selected domains</p>
            {userDomains.length === 0 ? (
              <p className="text-xs text-text-tertiary">
                No domains selected yet.{" "}
                <Link href="/domains" className="text-accent underline">
                  Choose one →
                </Link>
              </p>
            ) : (
              <ul className="space-y-2">
                {userDomains.map((ud) => (
                  <li
                    key={ud.domainId}
                    className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-inset/40 px-3 py-2"
                  >
                    <span className="text-sm text-text-secondary">
                      {ud.domain.name}
                    </span>
                    <span className="label-mono text-text-quaternary">
                      {ud.domain.slug}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </GlassPanel>
        </div>

        {/* Right: stats + sign out */}
        <div className="space-y-4">
          <GlassPanel>
            <p className="label-mono">Activity</p>
            <ul className="mt-3 space-y-3">
              <StatRow label="Attempts" value={attempts} />
              <StatRow label="Sessions" value={sessions} />
              <StatRow label="Skills tracked" value={masteryRows} />
              <StatRow label="Code submissions" value={submissions} />
            </ul>
          </GlassPanel>

          <GlassPanel>
            <p className="label-mono">Session</p>
            <p className="mt-1 text-xs text-text-tertiary">
              Signed in as {user.email}
            </p>
            <div className="mt-4">
              <SignOutButton />
            </div>
          </GlassPanel>
        </div>
      </div>
    </>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-xs text-text-tertiary">{label}</span>
      <span className="num text-sm font-medium text-text-primary">
        {value}
      </span>
    </li>
  );
}
