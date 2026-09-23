import { GlassPanel } from "@/components/shared/GlassPanel";

export default function GraphLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-8 w-80 animate-pulse rounded bg-bg-inset" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-bg-inset" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <GlassPanel className="h-[640px] animate-pulse" />
        <GlassPanel className="h-64 animate-pulse" />
      </div>
    </div>
  );
}
