"use client";

import { motion } from "framer-motion";
import { DecayBadge } from "./DecayBadge";
import type { MasteryView } from "@/lib/mastery/view";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  value: number;
  view?: MasteryView;
  index?: number;
  className?: string;
};

export function MasteryBar({
  name,
  value,
  view,
  index = 0,
  className,
}: Props) {
  const pct = Math.round(value * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.03,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn("py-3", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm text-text-primary" title={name}>
            {name}
          </p>
          {view && <DecayBadge view={view} compact showDays={false} />}
        </div>
        <span className="num shrink-0 text-sm font-medium tabular-nums text-text-primary">
          {pct}%
        </span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-bg-inset">
        <motion.div
          className={cn(
            "h-full rounded-full",
            pct >= 70
              ? "bg-white shadow-[0_0_8px_rgba(244,244,245,0.45)]"
              : pct >= 40
              ? "bg-white/65"
              : "bg-white/35"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.03 }}
        />
      </div>
    </motion.div>
  );
}
