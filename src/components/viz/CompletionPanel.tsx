"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Award, Lock } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { cn } from "@/lib/utils";

type Props = {
  domainName: string;
  verifiedCount: number;
  totalSkills: number;
  masteryPct: number;
};

export function CompletionPanel({
  domainName,
  verifiedCount,
  totalSkills,
  masteryPct,
}: Props) {
  const complete = totalSkills > 0 && verifiedCount === totalSkills;
  const pct = totalSkills > 0 ? (verifiedCount / totalSkills) * 100 : 0;

  if (complete) {
    return (
      <GlassPanel
        strong
        className="border-l-2 border-l-emerald shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_0_32px_-8px_rgba(16,185,129,0.5)]"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald/40 bg-emerald/10 text-emerald">
            <Award className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="label-mono text-emerald">Domain complete</p>
            <p className="mt-1 text-lg font-medium text-text-primary">
              You&apos;ve verified every skill in {domainName}.
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {verifiedCount} of {totalSkills} skills verified — theory and
              practical both passed. Certificates below match your level.
            </p>
          </div>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel>
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-default bg-bg-inset text-text-secondary">
          <Lock className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-mono">Completion gate</p>
              <p className="mt-1 text-sm font-medium text-text-primary">
                Verify every skill to complete {domainName}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                A skill counts as verified when both theory (quiz) and
                practical (code task) mastery reach 75%.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="num text-2xl font-semibold text-text-primary">
                {verifiedCount}
                <span className="text-text-tertiary">/{totalSkills}</span>
              </p>
              <p className="label-mono">verified</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-inset">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  pct >= 75
                    ? "bg-emerald"
                    : pct >= 40
                    ? "bg-amber"
                    : "bg-rose"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-text-tertiary">
                {Math.round(pct)}% of {domainName} verified
              </span>
              <span className="text-text-quaternary">
                Avg mastery {Math.round(masteryPct * 100)}%
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href="/gaps" className="btn-primary text-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Close your top gaps →
            </Link>
            <Link href="/practice" className="btn-ghost text-xs">
              Try more code tasks
            </Link>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
