import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { DomainCard } from "@/components/viz/DomainCard";
import { requireUser } from "@/lib/user";
import { listDomainsForUser, MAX_DOMAINS_PER_USER } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function DomainsPage() {
  const user = await requireUser();
  const domains = await listDomainsForUser(user.id);

  const selectedCount = domains.filter((d) => d.isSelected).length;
  const atLimit = selectedCount >= MAX_DOMAINS_PER_USER;
  const hasActive = domains.some((d) => d.isActive);

  return (
    <>
      <PageHeader
        eyebrow="Domains"
        title="Choose what you want to learn"
        description={`Select up to ${MAX_DOMAINS_PER_USER} domains. One is active at a time.`}
      />

      {/* Status row */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <GlassPanel>
          <p className="label-mono">Selected</p>
          <p className="num mt-2 text-3xl font-semibold text-text-primary">
            {selectedCount} / {MAX_DOMAINS_PER_USER}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {atLimit ? "Limit reached" : "Slots available"}
          </p>
        </GlassPanel>
        <GlassPanel
          className={
            hasActive
              ? "border-accent/40 shadow-[0_0_16px_-8px_rgba(24, 119, 242, 0.4)]"
              : undefined
          }
        >
          <p className="label-mono">Active</p>
          <p
            className={`num mt-2 text-3xl font-semibold ${
              hasActive ? "text-accent" : "text-text-tertiary"
            }`}
          >
            {hasActive ? "1" : "0"}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {hasActive ? "Dashboard is using this" : "Select one to begin"}
          </p>
        </GlassPanel>
        <GlassPanel>
          <p className="label-mono">Available</p>
          <p className="num mt-2 text-3xl font-semibold text-text-primary">
            {domains.length}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {domains.length === 1 ? "domain in catalog" : "domains in catalog"}
          </p>
        </GlassPanel>
      </div>

      {/* Alert banners */}
      {!hasActive && domains.length > 0 && (
        <GlassPanel className="mb-6 border-l-2 border-l-accent">
          <p className="label-mono text-accent">Get started</p>
          <p className="mt-1 text-sm text-text-secondary">
            Select a domain and set it active to unlock the dashboard, graph,
            and other pages.
          </p>
        </GlassPanel>
      )}

      {atLimit && (
        <GlassPanel className="mb-6 border-l-2 border-l-white/[0.20]">
          <p className="label-mono text-text-secondary">Limit reached</p>
          <p className="mt-1 text-sm text-text-secondary">
            You&apos;ve selected the maximum of {MAX_DOMAINS_PER_USER} domains.
            Deselect one to free a slot.
          </p>
        </GlassPanel>
      )}

      {/* Domain grid */}
      {domains.length === 0 ? (
        <GlassPanel className="p-8 text-center text-sm text-text-tertiary">
          No domains in the catalog yet. Run{" "}
          <code className="rounded bg-bg-inset px-1.5 py-0.5 text-xs">
            pnpm db:seed
          </code>{" "}
          to populate.
        </GlassPanel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {domains.map((d, i) => (
            <DomainCard
              key={d.id}
              domain={d}
              index={i}
              disabled={atLimit && !d.isSelected}
            />
          ))}
        </div>
      )}

      {/* Footer link */}
      {hasActive && (
        <div className="mt-8 flex justify-center">
          <Link href="/dashboard" className="btn-ghost text-xs">
            Go to dashboard →
          </Link>
        </div>
      )}
    </>
  );
}
