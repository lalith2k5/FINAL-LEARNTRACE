"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { cn } from "@/lib/utils";

export type RoadmapStepData = {
  order: number;
  skillId: string;
  skillName: string;
  difficulty: number;
  description?: string | null;
  mastery: number;
  targetMastery: number;
  priority: number;
  reason: string;
  estimatedMinutes: number;
  prereqsSatisfied: boolean;
  goalRelevant: boolean;
};

type Props = {
  step: RoadmapStepData;
  isFirst: boolean;
  isLast: boolean;
  index: number;
};

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function RoadmapStepCard({ step, isFirst, isLast, index }: Props) {
  const masteryPct = Math.round(step.mastery * 100);
  const targetPct = Math.round(step.targetMastery * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="relative grid grid-cols-[40px_1fr] gap-4"
    >
      {/* Timeline rail */}
      <div className="relative flex flex-col items-center">
        {/* Node dot */}
        <div
          className={cn(
            "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-bg-base",
            step.prereqsSatisfied
              ? "border-accent shadow-[0_0_12px_rgba(244,244,245, 0.5)]"
              : "border-border-strong"
          )}
        >
          <span
            className={cn(
              "num text-sm font-semibold",
              step.prereqsSatisfied ? "text-accent" : "text-text-tertiary"
            )}
          >
            {String(step.order).padStart(2, "0")}
          </span>
        </div>

        {/* Connector line */}
        {!isLast && (
          <div
            className={cn(
              "w-px flex-1 bg-gradient-to-b",
              step.prereqsSatisfied
                ? "from-accent/40 via-border-default to-border-subtle"
                : "from-border-subtle to-transparent"
            )}
          />
        )}
      </div>

      {/* Card */}
      <div className={cn("pb-8", isLast && "pb-0")}>
        <GlassPanel glow className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-base font-medium text-text-primary">
                  {step.skillName}
                </p>
                {step.goalRelevant && (
                  <span className="label-mono shrink-0 rounded-md border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-accent">
                    Goal skill
                  </span>
                )}
                {!step.prereqsSatisfied && (
                  <span className="label-mono shrink-0 rounded-md border border-white/[0.10]/40 bg-white/[0.04] px-1.5 py-0.5 text-text-secondary">
                    Blocked
                  </span>
                )}
              </div>
              <p className="label-mono mt-1">
                Difficulty {step.difficulty}/5 · ~{formatMinutes(step.estimatedMinutes)} · impact {step.priority.toFixed(2)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="num text-sm text-text-secondary">
                {masteryPct}% → {targetPct}%
              </p>
              <p className="label-mono">mastery</p>
            </div>
          </div>

          {/* Description */}
          {step.description && (
            <p className="mt-3 text-xs text-text-tertiary">
              {step.description}
            </p>
          )}

          {/* Mastery bar with target marker */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label-mono">Progress</span>
              <span className="num text-xs text-text-secondary">
                +{targetPct - masteryPct} pts to target
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-bg-inset">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  masteryPct >= 75
                    ? "bg-emerald"
                    : masteryPct >= 50
                    ? "bg-amber"
                    : "bg-rose"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${masteryPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              {/* Target marker */}
              <div
                className="absolute top-0 h-full w-0.5 bg-text-secondary"
                style={{ left: `${targetPct}%` }}
              />
            </div>
          </div>

          {/* Reason */}
          <p className="mt-3 text-xs text-text-secondary">{step.reason}</p>

          {/* CTA */}
          <div className="mt-4 flex justify-end">
            <Link
              href={`/learn/${step.skillId}`}
              className={cn(
                "text-xs",
                step.prereqsSatisfied ? "btn-primary" : "btn-ghost"
              )}
            >
              {step.prereqsSatisfied ? "Start learning →" : "Preview material"}
            </Link>
          </div>
        </GlassPanel>
      </div>
    </motion.div>
  );
}
