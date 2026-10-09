import { GlassPanel } from "@/components/shared/GlassPanel";

export default function AssessmentSessionLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-3 w-32 animate-pulse rounded bg-bg-inset" />
          <div className="h-3 w-40 animate-pulse rounded bg-bg-inset" />
        </div>
        <div className="h-1 w-full animate-pulse rounded-full bg-bg-inset" />
      </div>
      <GlassPanel className="p-6">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-5 w-full animate-pulse rounded bg-bg-inset" />
        <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-bg-inset" />
        <div className="mt-6 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 w-full animate-pulse rounded-lg bg-bg-inset"
            />
          ))}
        </div>
      </GlassPanel>
      <GlassPanel className="mt-4">
        <div className="h-3 w-40 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 flex-1 animate-pulse rounded-lg bg-bg-inset"
            />
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
