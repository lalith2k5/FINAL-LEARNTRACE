"use client";

import { useTransition } from "react";
import { Check, Plus, X, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { cn } from "@/lib/utils";
import {
  selectDomain,
  deselectDomain,
  setActiveDomain,
} from "@/app/(app)/domains/actions";
import type { DomainSummary } from "@/lib/domain";

type Props = {
  domain: DomainSummary;
  index: number;
  disabled: boolean;
};

export function DomainCard({ domain, index, disabled }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSelect() {
    startTransition(async () => {
      await selectDomain(domain.id);
    });
  }

  function handleDeselect() {
    startTransition(async () => {
      await deselectDomain(domain.id);
    });
  }

  function handleActivate() {
    startTransition(async () => {
      await setActiveDomain(domain.id);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <GlassPanel
        glow
        className={cn(
          "relative flex h-full flex-col",
          domain.isActive && "border-accent/50 shadow-[0_0_0_1px_rgba(24, 119, 242, 0.25),0_0_24px_-8px_rgba(24, 119, 242, 0.4)]"
        )}
      >
        {/* Top: name + difficulty-ish chip */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium text-text-primary">
              {domain.name}
            </h3>
            <p className="label-mono mt-1">
              {domain.skillCount} skills · {domain.slug}
            </p>
          </div>
          {domain.isActive && (
            <span className="label-mono flex shrink-0 items-center gap-1 rounded-md border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-accent">
              <Circle className="h-1.5 w-1.5 fill-current" />
              Active
            </span>
          )}
          {!domain.isActive && domain.isSelected && (
            <span className="label-mono flex shrink-0 items-center gap-1 rounded-md border border-white/[0.12]/40 bg-white/[0.06] px-1.5 py-0.5 text-text-primary">
              <Check className="h-3 w-3" />
              Selected
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mt-3 flex-1 text-xs text-text-tertiary">
          {domain.description}
        </p>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          {!domain.isSelected && (
            <button
              onClick={handleSelect}
              disabled={disabled || isPending}
              className={cn(
                "btn-primary flex-1 justify-center text-xs",
                (disabled || isPending) && "cursor-not-allowed opacity-40"
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              {isPending ? "Selecting..." : "Select domain"}
            </button>
          )}

          {domain.isSelected && !domain.isActive && (
            <button
              onClick={handleActivate}
              disabled={isPending}
              className={cn(
                "btn-primary flex-1 justify-center text-xs",
                isPending && "cursor-not-allowed opacity-40"
              )}
            >
              <Check className="h-3.5 w-3.5" />
              {isPending ? "Setting..." : "Set active"}
            </button>
          )}

          {domain.isSelected && (
            <button
              onClick={handleDeselect}
              disabled={isPending}
              className={cn(
                "btn-ghost text-xs",
                isPending && "cursor-not-allowed opacity-40"
              )}
              title="Remove from your selected domains"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  );
}
