"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import type { Misconception } from "@/lib/mastery/misconceptions";
import { cn } from "@/lib/utils";

/**
 * Deterministic date formatter — same output on server and client.
 * Uses en-GB + explicit 2-digit day/month to avoid locale drift.
 */
function stableFormatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

type Props = {
  misconception: Misconception;
  index: number;
};

export function MisconceptionCard({ misconception, index }: Props) {
  const [open, setOpen] = useState(false);

  const severity =
    misconception.count >= 4
      ? { label: "Persistent", tone: "text-text-tertiary", border: "border-white/[0.08]/40" }
      : misconception.count >= 3
      ? { label: "Recurring", tone: "text-text-secondary", border: "border-white/[0.10]/40" }
      : { label: "Emerging", tone: "text-text-secondary", border: "border-white/[0.10]/40" };

  const ratePct = Math.round(misconception.repeatedRate * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <GlassPanel glow className={cn("relative overflow-hidden", severity.border)}>
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-0.5",
            misconception.count >= 4
              ? "bg-rose shadow-[0_0_8px_rgba(244,244,245,0.28)]"
              : misconception.count >= 3
              ? "bg-rose shadow-[0_0_8px_rgba(244,244,245,0.55)]"
              : "bg-rose shadow-[0_0_8px_rgba(244,244,245,0.55)]"
          )}
        />

        <div className="pl-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn("h-3.5 w-3.5 shrink-0", severity.tone)} />
                <span className={cn("label-mono", severity.tone)}>
                  {severity.label}
                </span>
                <span className="num text-xs text-text-quaternary">
                  · {misconception.count}× repeated
                </span>
              </div>
              <p className="mt-1 truncate text-sm font-medium text-text-primary">
                {misconception.skillName}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="num text-lg font-semibold text-text-primary">
                {misconception.count}
              </p>
              <p className="label-mono">times</p>
            </div>
          </div>

          {/* Wrong vs correct */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-white/[0.08]/30 bg-white/[0.03] px-3 py-2">
              <p className="label-mono text-text-tertiary">You picked</p>
              <p className="mt-1 text-xs text-text-secondary">
                {misconception.selectedOptionText}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.12]/30 bg-white/[0.06] px-3 py-2">
              <p className="label-mono text-text-primary">Correct</p>
              <p className="mt-1 text-xs text-text-secondary">
                {misconception.correctOptionText}
              </p>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-text-tertiary">
              {ratePct}% of your wrong answers on this skill
            </span>
            <span className="text-text-quaternary">
              {stableFormatDate(misconception.lastSeenAt)}
            </span>
          </div>

          {/* Toggle */}
          {misconception.exampleQuestions.length > 0 && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="mt-3 flex items-center gap-1.5 text-xs text-text-tertiary transition-colors hover:text-text-secondary"
            >
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
              />
              {open ? "Hide" : "Show"} affected questions
            </button>
          )}

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <ul className="mt-3 space-y-1.5 border-t border-border-subtle pt-3">
                  {misconception.exampleQuestions.map((q, i) => (
                    <li
                      key={i}
                      className="line-clamp-2 text-[11px] text-text-tertiary"
                    >
                      • {q}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
