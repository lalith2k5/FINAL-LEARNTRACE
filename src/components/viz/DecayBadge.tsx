"use client";

import { AlertTriangle, Clock, Sparkles } from "lucide-react";
import type { MasteryView } from "@/lib/mastery/view";
import { cn } from "@/lib/utils";

type Props = {
  view: MasteryView;
  /** Show days-since-practiced when applicable */
  showDays?: boolean;
  /** Compact mode hides the label text and shows only the icon */
  compact?: boolean;
  className?: string;
};

function daysLabel(days: number): string {
  if (days < 1) return "today";
  if (days < 2) return "1d ago";
  if (days < 30) return `${Math.floor(days)}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function DecayBadge({
  view,
  showDays = true,
  compact = false,
  className,
}: Props) {
  // Fresh + no meaningful decay → hide entirely to avoid noise
  if (view.tier === "fresh" && view.decayRatio < 0.05) return null;

  const config = {
    fresh: {
      icon: Sparkles,
      label: "Fresh",
      color: "text-emerald",
      border: "border-white/[0.12]/40",
      bg: "bg-white/[0.06]",
      glow: "shadow-[0_0_10px_-2px_rgba(244,244,245,0.5)]",
    },
    decaying: {
      icon: Clock,
      label: "Decaying",
      color: "text-amber",
      border: "border-white/[0.10]/40",
      bg: "bg-white/[0.04]",
      glow: "shadow-[0_0_10px_-2px_rgba(244,244,245,0.5)]",
    },
    stale: {
      icon: AlertTriangle,
      label: "Stale",
      color: "text-rose",
      border: "border-white/[0.08]/40",
      bg: "bg-white/[0.03]",
      glow: "shadow-[0_0_10px_-2px_rgba(244,244,245,0.5)]",
    },
    untouched: {
      icon: Clock,
      label: "New",
      color: "text-text-tertiary",
      border: "border-border-default",
      bg: "bg-bg-inset",
      glow: "",
    },
  }[view.tier];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition-colors",
        config.color,
        config.border,
        config.bg,
        config.glow,
        className
      )}
      title={`Raw ${Math.round(view.raw * 100)}% · Effective ${Math.round(
        view.effective * 100
      )}% · ${view.daysSince.toFixed(1)} days since practice`}
    >
      <Icon className="h-3 w-3" />
      {!compact && <span>{config.label}</span>}
      {!compact && showDays && view.tier !== "untouched" && (
        <span className="text-text-quaternary">
          · {daysLabel(view.daysSince)}
        </span>
      )}
    </span>
  );
}
