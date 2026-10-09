import { GlassPanel } from "@/components/shared/GlassPanel";

export default function LearnSkillLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-3 w-32 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-8 w-72 animate-pulse rounded bg-bg-inset" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-bg-inset" />
      </div>
      <GlassPanel className="mb-6">
        <div className="h-3 w-28 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-2 w-full animate-pulse rounded bg-bg-inset" />
        <div className="mt-2 h-2 w-full animate-pulse rounded bg-bg-inset" />
      </GlassPanel>
      <div className="mb-8 grid gap-4 md:grid-cols-[200px_1fr]">
        <GlassPanel>
          <div className="mx-auto h-28 w-28 animate-pulse rounded-full bg-bg-inset" />
        </GlassPanel>
        <GlassPanel>
          <div className="h-3 w-32 animate-pulse rounded bg-bg-inset" />
          <div className="mt-3 h-4 w-64 animate-pulse rounded bg-bg-inset" />
          <div className="mt-4 h-2 w-full animate-pulse rounded bg-bg-inset" />
        </GlassPanel>
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <GlassPanel key={i}>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-bg-inset" />
              <div className="flex-1">
                <div className="h-3 w-20 animate-pulse rounded bg-bg-inset" />
                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-bg-inset" />
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
