import { GlassPanel } from "@/components/shared/GlassPanel";

export default function RoadmapLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-8 w-72 animate-pulse rounded bg-bg-inset" />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <GlassPanel key={i}>
            <div className="h-3 w-20 animate-pulse rounded bg-bg-inset" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-bg-inset" />
          </GlassPanel>
        ))}
      </div>
      <div className="max-w-4xl space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="grid grid-cols-[40px_1fr] gap-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-bg-inset" />
            <GlassPanel>
              <div className="h-4 w-64 animate-pulse rounded bg-bg-inset" />
              <div className="mt-3 h-3 w-40 animate-pulse rounded bg-bg-inset" />
              <div className="mt-4 h-2 w-full animate-pulse rounded bg-bg-inset" />
            </GlassPanel>
          </div>
        ))}
      </div>
    </div>
  );
}
