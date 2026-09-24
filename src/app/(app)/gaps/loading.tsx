import { GlassPanel } from "@/components/shared/GlassPanel";

export default function GapsLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-8 w-72 animate-pulse rounded bg-bg-inset" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-bg-inset" />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <GlassPanel key={i}>
            <div className="h-3 w-20 animate-pulse rounded bg-bg-inset" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-bg-inset" />
          </GlassPanel>
        ))}
      </div>
      <div className="space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <GlassPanel key={i}>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 animate-pulse rounded bg-bg-inset" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-64 animate-pulse rounded bg-bg-inset" />
                <div className="h-3 w-40 animate-pulse rounded bg-bg-inset" />
                <div className="h-2 w-full animate-pulse rounded bg-bg-inset" />
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
