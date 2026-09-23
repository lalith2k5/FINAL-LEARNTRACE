import { GlassPanel } from "@/components/shared/GlassPanel";

export default function PracticeTaskLoading() {
  return (
    <div>
      <div className="mb-4 h-3 w-32 animate-pulse rounded bg-bg-inset" />
      <div className="mb-8">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-8 w-72 animate-pulse rounded bg-bg-inset" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <GlassPanel>
          <div className="h-6 w-48 animate-pulse rounded bg-bg-inset" />
          <div className="mt-4 h-96 animate-pulse rounded bg-bg-inset" />
        </GlassPanel>
        <div className="space-y-4">
          <GlassPanel>
            <div className="h-3 w-16 animate-pulse rounded bg-bg-inset" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-bg-inset" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-bg-inset" />
          </GlassPanel>
          <GlassPanel>
            <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
            <div className="mt-3 h-12 w-full animate-pulse rounded bg-bg-inset" />
            <div className="mt-2 h-12 w-full animate-pulse rounded bg-bg-inset" />
            <div className="mt-2 h-12 w-full animate-pulse rounded bg-bg-inset" />
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
