import { GlassPanel } from "@/components/shared/GlassPanel";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-8 w-72 animate-pulse rounded bg-bg-inset" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-bg-inset" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <GlassPanel key={i}>
            <div className="h-3 w-20 animate-pulse rounded bg-bg-inset" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-bg-inset" />
            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-bg-inset" />
          </GlassPanel>
        ))}
      </div>
      <GlassPanel>
        <div className="h-3 w-32 animate-pulse rounded bg-bg-inset" />
        <div className="mt-4 h-40 animate-pulse rounded bg-bg-inset" />
      </GlassPanel>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <GlassPanel key={i}>
            <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
            <div className="mt-3 h-20 animate-pulse rounded bg-bg-inset" />
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
