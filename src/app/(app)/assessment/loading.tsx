import { GlassPanel } from "@/components/shared/GlassPanel";

export default function AssessmentLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-8 w-72 animate-pulse rounded bg-bg-inset" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-bg-inset" />
      </div>
      <div className="max-w-5xl">
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((i) => (
            <GlassPanel key={i}>
              <div className="h-3 w-20 animate-pulse rounded bg-bg-inset" />
              <div className="mt-3 h-5 w-40 animate-pulse rounded bg-bg-inset" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-bg-inset" />
              <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-bg-inset" />
              <div className="mt-4 h-10 w-full animate-pulse rounded bg-bg-inset" />
              <div className="mt-4 h-8 w-full animate-pulse rounded bg-bg-inset" />
            </GlassPanel>
          ))}
        </div>
        <GlassPanel className="mt-4">
          <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-bg-inset" />
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-bg-inset" />
        </GlassPanel>
      </div>
    </div>
  );
}
