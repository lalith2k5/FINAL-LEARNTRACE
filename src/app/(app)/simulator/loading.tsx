import { GlassPanel } from "@/components/shared/GlassPanel";

export default function SimulatorLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-8 w-72 animate-pulse rounded bg-bg-inset" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-bg-inset" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <GlassPanel>
          <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
          <div className="mt-4 h-10 w-full animate-pulse rounded bg-bg-inset" />
          <div className="mt-4 h-10 w-full animate-pulse rounded bg-bg-inset" />
          <div className="mt-6 h-10 w-full animate-pulse rounded bg-bg-inset" />
        </GlassPanel>
        <GlassPanel>
          <div className="h-3 w-32 animate-pulse rounded bg-bg-inset" />
          <div className="mt-4 h-32 w-full animate-pulse rounded bg-bg-inset" />
        </GlassPanel>
      </div>
    </div>
  );
}
