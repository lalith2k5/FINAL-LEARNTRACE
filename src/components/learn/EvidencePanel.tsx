"use client";

import { motion } from "framer-motion";
import { BookOpen, Code2, ShieldCheck } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import type { SkillEvidence } from "@/lib/mastery/evidence";
import { cn } from "@/lib/utils";

type Props = { evidence: SkillEvidence };

function barColor(pct: number): string {
  if (pct >= 0.75) return "bg-emerald";
  if (pct >= 0.5) return "bg-amber";
  return "bg-rose";
}

function toneFor(pct: number): string {
  if (pct >= 0.75) return "text-text-primary";
  if (pct >= 0.5) return "text-text-secondary";
  return "text-text-tertiary";
}

export function EvidencePanel({ evidence }: Props) {
  const theoryPct = Math.round(evidence.theory * 100);
  const practicalPct = Math.round(evidence.practical * 100);
  const combinedPct = Math.round(evidence.combined * 100);

  return (
    <GlassPanel
      glow
      className={cn(
        evidence.verified && "border-white/[0.12]/40 shadow-[0_0_24px_-10px_rgba(244,244,245,0.5)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-mono">Evidence profile</p>
          <p className="mt-1 text-sm text-text-secondary">
            Theory from quizzes · practical from code tasks
          </p>
        </div>
        {evidence.verified && (
          <span className="label-mono flex shrink-0 items-center gap-1 rounded-md border border-white/[0.12]/40 bg-white/[0.06] px-2 py-0.5 text-text-primary">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </span>
        )}
      </div>

      <div className="mt-5 space-y-4">
        {/* Theory */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <BookOpen className="h-3.5 w-3.5 text-text-secondary" />
              Theory
            </span>
            <span className={cn("num text-xs font-medium", toneFor(evidence.theory))}>
              {theoryPct}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-inset">
            <motion.div
              className={cn("h-full rounded-full", barColor(evidence.theory))}
              initial={{ width: 0 }}
              animate={{ width: `${theoryPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Practical */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Code2 className="h-3.5 w-3.5 text-accent" />
              Practical
            </span>
            <span
              className={cn("num text-xs font-medium", toneFor(evidence.practical))}
            >
              {practicalPct}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-inset">
            <motion.div
              className={cn("h-full rounded-full", barColor(evidence.practical))}
              initial={{ width: 0 }}
              animate={{ width: `${practicalPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            />
          </div>
          {evidence.practicalAttempts > 0 && (
            <p className="mt-1.5 text-[10px] text-text-quaternary">
              {evidence.practicalPassed} / {evidence.practicalAttempts} submissions
              passed
            </p>
          )}
          {evidence.practicalAttempts === 0 && (
            <p className="mt-1.5 text-[10px] text-text-quaternary">
              No submissions yet — try a practice task
            </p>
          )}
        </div>

        {/* Combined */}
        <div className="border-t border-border-subtle pt-4">
          <div className="flex items-center justify-between">
            <span className="label-mono">Combined</span>
            <span className="num text-sm font-semibold text-text-primary">
              {combinedPct}%
            </span>
          </div>
          <p className="mt-1 text-[10px] text-text-quaternary">
            Weighted: 60% theory · 40% practical
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}
