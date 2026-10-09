import { GlassPanel } from "@/components/shared/GlassPanel";

export default function PracticeLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
        <div className="mt-3 h-8 w-72 animate-pulse rounded bg-bg-inset" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-bg-inset" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <GlassPanel key={i} className="flex h-full flex-col">
            <div className="h-3 w-24 animate-pulse rounded bg-bg-inset" />
            <div className="mt-3 h-5 w-40 animate-pulse rounded bg-bg-inset" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-bg-inset" />
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-bg-inset" />
            <div className="mt-auto pt-4">
              <div className="h-9 w-full animate-pulse rounded bg-bg-inset" />
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
