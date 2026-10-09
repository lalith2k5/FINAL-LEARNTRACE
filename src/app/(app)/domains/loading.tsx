import { GlassPanel } from "@/components/shared/GlassPanel";

export default function DomainsLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-8 w-80 animate-pulse rounded bg-bg-inset" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-bg-inset" />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <GlassPanel key={i}>
            <div className="h-3 w-20 animate-pulse rounded bg-bg-inset" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-bg-inset" />
            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-bg-inset" />
          </GlassPanel>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <GlassPanel key={i}>
            <div className="h-4 w-40 animate-pulse rounded bg-bg-inset" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-bg-inset" />
            <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-bg-inset" />
            <div className="mt-4 h-8 w-full animate-pulse rounded bg-bg-inset" />
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
