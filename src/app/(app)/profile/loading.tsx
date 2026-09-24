import { GlassPanel } from "@/components/shared/GlassPanel";

export default function ProfileLoading() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-8 w-72 animate-pulse rounded bg-bg-inset" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-bg-inset" />
      </div>
      <div className="mb-6 flex items-center gap-1 border-b border-border-subtle">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-24 animate-pulse rounded bg-bg-inset/60"
          />
        ))}
      </div>
      <div className="space-y-6">
        <GlassPanel>
          <div className="h-3 w-20 animate-pulse rounded bg-bg-inset" />
          <div className="mt-4 h-10 w-full animate-pulse rounded bg-bg-inset" />
          <div className="mt-4 h-10 w-full animate-pulse rounded bg-bg-inset" />
        </GlassPanel>
        <GlassPanel>
          <div className="h-3 w-20 animate-pulse rounded bg-bg-inset" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-bg-inset" />
        </GlassPanel>
      </div>
    </div>
  );
}
