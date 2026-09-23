"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SceneIndicator() {
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const scenes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scene]")
    );
    setTotal(scenes.length);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.scene ?? "1"
            );
            setCurrent(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    scenes.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  if (total === 0) return null;

  return (
    <div className="pointer-events-none fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-end gap-2 md:flex">
      <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-quaternary">
        Scene
      </span>
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const active = n === current;
        return (
          <div key={n} className="flex items-center gap-2">
            <span
              className={cn(
                "num text-[10px] transition-all duration-500",
                active
                  ? "text-accent opacity-100"
                  : "text-text-quaternary opacity-40"
              )}
            >
              {String(n).padStart(2, "0")}
            </span>
            <div
              className={cn(
                "h-[2px] rounded-full transition-all duration-500",
                active
                  ? "w-7 bg-accent shadow-[0_0_10px_rgba(24, 119, 242, 0.8)]"
                  : "w-3 bg-border-default"
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
