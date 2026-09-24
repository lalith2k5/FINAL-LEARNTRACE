import { GlassPanel } from "@/components/shared/GlassPanel";

export default function ReportLoading() {
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
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <GlassPanel key={i}>
            <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
            <div className="mt-3 space-y-2">
              {[0, 1, 2].map((j) => (
                <div
                  key={j}
                  className="h-3 w-full animate-pulse rounded bg-bg-inset"
                />
              ))}
            </div>
          </GlassPanel>
        ))}
      </div>
      <GlassPanel>
        <div className="h-3 w-32 animate-pulse rounded bg-bg-inset" />
        <div className="mt-4 h-24 animate-pulse rounded bg-bg-inset" />
      </GlassPanel>
    </div>
  );
}
