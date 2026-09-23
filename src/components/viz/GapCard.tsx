"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { cn } from "@/lib/utils";

export type GapCardData = {
  rank: number;
  skillId: string;
  skillName: string;
  difficulty: number;
  description?: string | null;
  mastery: number;
  gap: number;
  score: number;
  downstreamCount: number;
  downstreamImpact: number;
  goalRelevant: boolean;
  downstream: { id: string; name: string; mastery: number }[];
};

type Props = { data: GapCardData };

export function GapCard({ data }: Props) {
  const [open, setOpen] = useState(false);
  const masteryPct = Math.round(data.mastery * 100);
  const gapPct = Math.round(data.gap * 100);

  const tier =
    data.score >= 1.5
      ? { label: "Critical", tone: "text-text-tertiary", ring: "border-white/[0.08]/40" }
      : data.score >= 0.7
      ? { label: "High", tone: "text-text-secondary", ring: "border-white/[0.10]/40" }
      : { label: "Moderate", tone: "text-text-secondary", ring: "border-white/[0.10]/40" };

  return (
    <GlassPanel
      glow
      className={cn("relative overflow-hidden", tier.ring)}
    >
      {/* Rank stripe */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-0.5",
          tier.label === "Critical"
            ? "bg-amber shadow-[0_0_8px_rgba(244,244,245,0.28)]"
            : tier.label === "High"
            ? "bg-rose shadow-[0_0_8px_rgba(244,244,245,0.55)]"
            : "bg-rose shadow-[0_0_8px_rgba(244,244,245,0.55)]"
        )}
      />

      <div className="flex items-start gap-4 pl-3">
        {/* Rank */}
        <div className="flex shrink-0 flex-col items-center">
          <span className="num text-3xl font-semibold text-text-primary">
            {String(data.rank).padStart(2, "0")}
          </span>
          <span className={cn("label-mono mt-1", tier.tone)}>
            {tier.label}
          </span>
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-base font-medium text-text-primary">
                  {data.skillName}
                </p>
                {data.goalRelevant && (
                  <span className="label-mono shrink-0 rounded-md border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-accent">
                    Goal skill
                  </span>
                )}
              </div>
              <p className="label-mono mt-1">
                Difficulty {data.difficulty}/5 · {data.downstreamCount} downstream
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="num text-lg font-semibold text-text-primary">
                {data.score.toFixed(2)}
              </p>
              <p className="label-mono">impact</p>
            </div>
          </div>

          {/* Mastery bar */}
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label-mono">Mastery</span>
              <span className="num text-xs text-text-secondary">
                {masteryPct}% · gap {gapPct}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-inset">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  masteryPct >= 75
                    ? "bg-emerald"
                    : masteryPct >= 50
                    ? "bg-rose"
                    : "bg-rose"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${masteryPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Metrics row */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="label-mono">Gap</p>
              <p className="num mt-0.5 text-sm text-text-secondary">
                {(data.gap * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="label-mono">Downstream</p>
              <p className="num mt-0.5 text-sm text-text-secondary">
                {data.downstreamCount} skills
              </p>
            </div>
            <div>
              <p className="label-mono">Impact sum</p>
              <p className="num mt-0.5 text-sm text-text-secondary">
                {data.downstreamImpact.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Expand toggle */}
          {data.downstream.length > 0 && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="mt-3 flex items-center gap-1.5 text-xs text-text-tertiary transition-colors hover:text-text-secondary"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  open && "rotate-180"
                )}
              />
              {open ? "Hide" : "Show"} what this unlocks
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
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border-subtle pt-3">
                  {data.downstream.map((d) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-bg-inset px-2 py-0.5 text-xs text-text-secondary"
                    >
                      {d.name}
                      <span className="num text-text-quaternary">
                        {Math.round(d.mastery * 100)}%
                      </span>
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <div className="mt-4 flex justify-end">
            <Link
              href={`/learn/${data.skillId}`}
              className="btn-primary text-xs"
            >
              Start learning →
            </Link>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
