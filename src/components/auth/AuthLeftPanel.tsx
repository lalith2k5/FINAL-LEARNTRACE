"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Target,
  Sparkles,
  Route,
  Check,
  Circle,
  Lock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_DURATION_MS = 3200;

/* ------------------------------------------------------------------ */
/* Steps — each is a chapter                                           */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    n: "01",
    title: "Pick your track",
    detail: "One active domain at a time.",
    icon: Target,
  },
  {
    n: "02",
    title: "Take the diagnostic",
    detail: "15 adaptive questions with an AI tutor on every mistake.",
    icon: Sparkles,
  },
  {
    n: "03",
    title: "Follow your plan",
    detail: "Ranked by downstream impact, not lowest score.",
    icon: Route,
  },
] as const;

export function AuthLeftPanel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // ONE timer drives everything
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive((s) => (s + 1) % STEPS.length);
    }, STEP_DURATION_MS);
    return () => clearInterval(t);
  }, [paused, active]);

  return (
    <div
      className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.06] bg-black p-12 lg:flex"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 40% 30%, black, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 40% 30%, black, transparent 80%)",
        }}
      />

      {/* Ambient glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full"
        animate={{
          background: [
            "radial-gradient(circle, rgba(24,119,242,0.55), transparent 70%)",
            "radial-gradient(circle, rgba(94,184,255,0.5), transparent 70%)",
            "radial-gradient(circle, rgba(24,119,242,0.6), transparent 70%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "blur(80px)" }}
      />

      {/* ---------------- Brand ---------------- */}
      <Link href="/" className="relative flex items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-white/60">
          LearnTrace
        </span>
      </Link>

      {/* ---------------- Main ---------------- */}
      <div className="relative flex-1 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
            Welcome
          </p>
          <h2 className="mt-5 text-3xl font-medium leading-tight tracking-tight text-white md:text-4xl">
            Your learning,{" "}
            <span className="bg-gradient-to-r from-[#1877F2] via-[#5EB8FF] to-[#1877F2] bg-clip-text text-transparent">
              traced.
            </span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/50">
            Three steps. Two minutes. A personalized map of what you know —
            and what&apos;s blocking you.
          </p>
        </motion.div>

        {/* Steps + Preview — master-detail */}
        <div className="mt-10 grid gap-8">
          {/* Steps list */}
          <div className="space-y-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = active === i;
              return (
                <button
                  key={s.n}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={cn(
                    "group flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left transition-all duration-300",
                    isActive ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-semibold transition-all duration-300",
                      isActive
                        ? "border-accent/60 bg-accent/10 text-accent shadow-[0_0_12px_-2px_rgba(24,119,242,0.6)]"
                        : "border-white/[0.08] bg-white/[0.02] text-white/30"
                    )}
                  >
                    {s.n}
                  </span>

                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-colors duration-300",
                        isActive ? "text-accent" : "text-white/25"
                      )}
                    />
                    <p
                      className={cn(
                        "truncate text-sm font-medium transition-colors duration-300",
                        isActive ? "text-white" : "text-white/50"
                      )}
                    >
                      {s.title}
                    </p>
                  </div>

                  {/* Progress bar for active step only */}
                  <span className="relative h-0.5 w-12 overflow-hidden rounded-full bg-white/[0.06]">
                    {isActive && !paused && (
                      <motion.span
                        key={`bar-${s.n}-${active}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: STEP_DURATION_MS / 1000,
                          ease: "linear",
                        }}
                        className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-accent"
                      />
                    )}
                    {isActive && paused && (
                      <span className="absolute inset-y-0 left-0 w-full rounded-full bg-accent/40" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Preview stage — swaps with active step */}
          <div className="relative h-56 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
            {/* Label */}
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
                {STEPS[active].title}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-accent" />
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
                  Live
                </span>
              </span>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
                transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
                className="h-[calc(100%-2rem)]"
              >
                {active === 0 && <TrackPreview />}
                {active === 1 && <DiagnosticPreview />}
                {active === 2 && <RoadmapPreview />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ---------------- Bottom ---------------- */}
      <div className="relative">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
          Free · No credit card · 30 seconds to start
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/* STEP 01 — Pick your track                                           */
/* ================================================================== */

const TRACKS = [
  { label: "Python", sub: "Fundamentals" },
  { label: "Data Science", sub: "Analysis" },
  { label: "Machine Learning", sub: "Engineering", active: true },
];

function TrackPreview() {
  return (
    <div className="grid h-full grid-cols-3 gap-3">
      {TRACKS.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className={cn(
            "flex flex-col justify-between rounded-xl border p-3.5 transition-colors",
            t.active
              ? "border-accent/50 bg-accent/[0.08] shadow-[0_0_20px_-8px_rgba(24,119,242,0.8)]"
              : "border-white/[0.06] bg-white/[0.02]"
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full border",
                t.active
                  ? "border-accent bg-accent"
                  : "border-white/[0.15]"
              )}
            >
              {t.active && <Check className="h-2.5 w-2.5 text-white" />}
            </span>
          </div>
          <div>
            <p
              className={cn(
                "text-[12px] font-medium",
                t.active ? "text-white" : "text-white/60"
              )}
            >
              {t.label}
            </p>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-white/30">
              {t.sub}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ================================================================== */
/* STEP 02 — Diagnostic                                                */
/* ================================================================== */

function DiagnosticPreview() {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/30">
          Question 3 / 15 · Probability
        </p>
        <p className="mt-2 text-[13px] leading-snug text-white">
          A fair coin is flipped twice. What is the probability of getting
          heads both times?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {[
          { id: "A", text: "1/2" },
          { id: "B", text: "1/3" },
          { id: "C", text: "1/4", correct: true },
          { id: "D", text: "1/8" },
        ].map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-2.5 py-1.5",
              o.correct
                ? "border-emerald-500/50 bg-emerald-500/10"
                : "border-white/[0.06] bg-white/[0.02]"
            )}
          >
            <span
              className={cn(
                "font-mono text-[9px] font-medium",
                o.correct ? "text-text-primary" : "text-white/40"
              )}
            >
              {o.id}
            </span>
            <span
              className={cn(
                "text-[11px]",
                o.correct ? "text-white" : "text-white/50"
              )}
            >
              {o.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/* STEP 03 — Roadmap                                                   */
/* ================================================================== */

const ROADMAP = [
  { n: "01", name: "Probability", state: "Ready now", ready: true },
  { n: "02", name: "Conditional Probability", state: "Ready now", ready: true },
  { n: "03", name: "Statistics", state: "Unlocks after 02", ready: false },
  { n: "04", name: "Model Evaluation", state: "Unlocks after 03", ready: false },
];

function RoadmapPreview() {
  return (
    <div className="flex h-full flex-col justify-center gap-1.5">
      {ROADMAP.map((r, i) => (
        <motion.div
          key={r.n}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.35 }}
          className="flex items-center gap-3"
        >
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] font-semibold",
              r.ready
                ? "border-accent/60 bg-accent/10 text-accent"
                : "border-white/[0.1] bg-white/[0.02] text-white/30"
            )}
          >
            {r.n}
          </span>
          <p
            className={cn(
              "flex-1 truncate text-[11px] font-medium",
              r.ready ? "text-white" : "text-white/50"
            )}
          >
            {r.name}
          </p>
          <span
            className={cn(
              "shrink-0 font-mono text-[9px] uppercase tracking-wider",
              r.ready ? "text-text-primary" : "text-white/30"
            )}
          >
            {r.state}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
