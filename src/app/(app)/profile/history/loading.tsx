import { GlassPanel } from "@/components/shared/GlassPanel";

export default function HistoryLoading() {
  return (
    <div>
      <div className="mb-4 h-3 w-24 animate-pulse rounded bg-bg-inset" />
      <div className="mb-8">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-8 w-72 animate-pulse rounded bg-bg-inset" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-bg-inset" />
      </div>
      <div className="space-y-8">
        {[0, 1].map((d) => (
          <section key={d}>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
              <div className="h-px flex-1 bg-border-subtle" />
              <div className="h-3 w-16 animate-pulse rounded bg-bg-inset" />
            </div>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <GlassPanel key={i}>
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 animate-pulse rounded-lg bg-bg-inset" />
                    <div className="flex-1">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-bg-inset" />
                      <div className="mt-2 h-3 w-full animate-pulse rounded bg-bg-inset" />
                    </div>
                  </div>
                </GlassPanel>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
