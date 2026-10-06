"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, Gauge, Repeat, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import type { Misconception } from "@/lib/mastery/misconceptions";
import { cn } from "@/lib/utils";

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

function severityFor(m: Misconception): {
  label: string;
  tone: string;
  border: string;
} {
  const count =
    m.kind === "option-repeat" || m.kind === "semantic"
      ? m.count
      : m.wrongCount;
  if (count >= 4) {
    return {
      label: "Persistent",
      tone: "text-text-tertiary",
      border: "border-white/[0.08]/40",
    };
  }
  if (count >= 3) {
    return {
      label: "Recurring",
      tone: "text-text-secondary",
      border: "border-white/[0.10]/40",
    };
  }
  return {
    label: "Emerging",
    tone: "text-text-secondary",
    border: "border-white/[0.10]/40",
  };
}

const KIND_META: Record<
  Misconception["kind"],
  { label: string; Icon: typeof Repeat }
> = {
  semantic: { label: "Reasoning error", Icon: Sparkles },
  "option-repeat": { label: "Repeated wrong option", Icon: Repeat },
  overconfident: { label: "Overconfident errors", Icon: Gauge },
  "skill-weak": { label: "Systematic weakness", Icon: AlertTriangle },
};

function headerCount(m: Misconception): number {
  if (m.kind === "option-repeat" || m.kind === "semantic") return m.count;
  return m.wrongCount;
}

export function MisconceptionCard({ misconception, index }: Props) {
  const [open, setOpen] = useState(false);
  const severity = severityFor(misconception);
  const meta = KIND_META[misconception.kind];
  const { Icon } = meta;
  const count = headerCount(misconception);

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
            misconception.kind === "semantic"
              ? "bg-violet shadow-[0_0_8px_#8B5CF6]"
              : count >= 4
              ? "bg-rose shadow-[0_0_8px_rgba(244,244,245,0.28)]"
              : "bg-rose shadow-[0_0_8px_rgba(244,244,245,0.55)]"
          )}
        />

        <div className="pl-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    misconception.kind === "semantic"
                      ? "text-violet"
                      : severity.tone
                  )}
                />
                <span
                  className={cn(
                    "label-mono",
                    misconception.kind === "semantic"
                      ? "text-violet"
                      : severity.tone
                  )}
                >
                  {misconception.kind === "semantic"
                    ? "Reasoning error"
                    : severity.label}
                </span>
                <span className="num text-xs text-text-quaternary">
                  · {meta.label}
                </span>
              </div>
              <p className="mt-1 truncate text-sm font-medium text-text-primary">
                {misconception.skillName}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="num text-lg font-semibold text-text-primary">
                {count}
              </p>
              <p className="label-mono">times</p>
            </div>
          </div>

          {misconception.kind === "semantic" && (
            <div className="mt-4 space-y-2">
              <div className="rounded-lg border border-violet/30 bg-violet/[0.05] px-3 py-2">
                <p className="label-mono text-violet">Category</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {misconception.category.replace(/-/g, " ")}
                </p>
              </div>
              <div className="rounded-lg border border-white/[0.08]/30 bg-white/[0.03] px-3 py-2">
                <p className="label-mono text-text-tertiary">What you believe</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {misconception.belief}
                </p>
              </div>
              <div className="rounded-lg border border-white/[0.12]/30 bg-white/[0.06] px-3 py-2">
                <p className="label-mono text-text-primary">Correct reasoning</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {misconception.corrective}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-tertiary">
                  Analysis confidence{" "}
                  {Math.round(misconception.avgConfidence * 100)}%
                </span>
                <span className="text-text-quaternary">
                  {stableFormatDate(misconception.lastSeenAt)}
                </span>
              </div>
            </div>
          )}

          {misconception.kind === "option-repeat" && (
            <>
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
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="text-text-tertiary">
                  {Math.round(misconception.repeatedRate * 100)}% of your wrong
                  answers on this skill
                </span>
                <span className="text-text-quaternary">
                  {stableFormatDate(misconception.lastSeenAt)}
                </span>
              </div>
            </>
          )}

          {misconception.kind === "overconfident" && (
            <div className="mt-4 space-y-2">
              <div className="rounded-lg border border-white/[0.08]/30 bg-white/[0.03] px-3 py-2">
                <p className="label-mono text-text-tertiary">
                  High confidence, wrong answer
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  You rated confidence {misconception.avgConfidence.toFixed(1)}/5
                  on {misconception.wrongCount} questions you got wrong — a
                  signal you may believe a misunderstanding.
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-tertiary">
                  Confident wrong answers
                </span>
                <span className="text-text-quaternary">
                  {stableFormatDate(misconception.lastSeenAt)}
                </span>
              </div>
            </div>
          )}

          {misconception.kind === "skill-weak" && (
            <div className="mt-4 space-y-2">
              <div className="rounded-lg border border-white/[0.08]/30 bg-white/[0.03] px-3 py-2">
                <p className="label-mono text-text-tertiary">Wrong rate</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {Math.round(misconception.wrongRate * 100)}% wrong across{" "}
                  {misconception.totalCount} attempts — consistent difficulty,
                  not a bad-luck streak.
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-tertiary">
                  {misconception.wrongCount} wrong / {misconception.totalCount} total
                </span>
                <span className="text-text-quaternary">
                  {stableFormatDate(misconception.lastSeenAt)}
                </span>
              </div>
            </div>
          )}

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
