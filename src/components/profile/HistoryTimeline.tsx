"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Code2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Clock,
} from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { cn } from "@/lib/utils";

export type HistoryEvent = {
  id: string;
  kind: "attempt" | "submission";
  title: string;
  subtitle: string;
  correct: boolean;
  timeTakenMs?: number;
  confidence?: number;
  passed?: number;
  total?: number;
  createdAt: string;
};

type Props = {
  events: HistoryEvent[];
};

const PAGE_SIZE = 30;

function groupByDay(events: HistoryEvent[]): Record<string, HistoryEvent[]> {
  const groups: Record<string, HistoryEvent[]> = {};
  for (const e of events) {
    const d = new Date(e.createdAt);
    const key = d.toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return groups;
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function HistoryTimeline({ events }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? events : events.slice(0, PAGE_SIZE);
  const grouped = groupByDay(visible);

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([day, list]) => (
        <section key={day}>
          <div className="mb-3 flex items-center gap-3">
            <p className="label-mono">{dayLabel(day)}</p>
            <div className="h-px flex-1 bg-border-subtle" />
            <span className="label-mono text-text-quaternary">
              {list.length} {list.length === 1 ? "event" : "events"}
            </span>
          </div>

          <div className="space-y-2">
            {list.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </div>
        </section>
      ))}

      {!expanded && events.length > PAGE_SIZE && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setExpanded(true)}
            className="btn-ghost text-xs"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            Show {events.length - PAGE_SIZE} more
          </button>
        </div>
      )}
    </div>
  );
}

function EventRow({ event }: { event: HistoryEvent }) {
  const isQuiz = event.kind === "attempt";
  const Icon = isQuiz ? BookOpen : Code2;
  const time = new Date(event.createdAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <GlassPanel glow className="relative overflow-hidden">
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-0.5",
            event.correct
              ? "bg-white/[0.08] shadow-[0_0_8px_#F4F4F5]"
              : "bg-white/[0.04] shadow-[0_0_8px_rgba(244,244,245,0.28)]"
          )}
        />
        <div className="flex items-start gap-3 pl-3">
          <div
            className={cn(
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
              isQuiz
                ? "border-white/[0.10]/30 bg-white/[0.05] text-text-secondary"
                : "border-accent/30 bg-accent/10 text-accent"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {event.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-text-tertiary">
                  {event.subtitle}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {event.correct ? (
                  <CheckCircle2 className="h-4 w-4 text-text-primary" />
                ) : (
                  <XCircle className="h-4 w-4 text-text-tertiary" />
                )}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-text-quaternary">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {time}
              </span>
              {isQuiz && event.timeTakenMs !== undefined && (
                <span className="num">
                  {(event.timeTakenMs / 1000).toFixed(1)}s
                </span>
              )}
              {isQuiz && event.confidence !== undefined && (
                <span>confidence {event.confidence}/5</span>
              )}
              {!isQuiz && event.total !== undefined && (
                <span className="num">
                  {event.passed}/{event.total} passed
                </span>
              )}
            </div>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
