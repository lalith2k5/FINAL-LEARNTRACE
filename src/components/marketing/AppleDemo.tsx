"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Zap, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SCENE_DURATION_MS = 2500; // 2.5 seconds per scene
const SCENE_COUNT = 3;

const SCENES = [
  {
    id: 0,
    n: "01",
    label: "Knowledge graph",
    heading: (
      <>
        Every skill depends on others.
        <br />
        <span className="text-white/40">We map those dependencies.</span>
      </>
    ),
  },
  {
    id: 1,
    n: "02",
    label: "Adaptive difficulty",
    heading: (
      <>
        We keep you at the edge
        <br />
        <span className="text-white/40">of what you can do.</span>
      </>
    ),
  },
  {
    id: 2,
    n: "03",
    label: "Real code execution",
    heading: (
      <>
        A skill isn&apos;t learned
        <br />
        <span className="text-white/40">until theory and practice pass.</span>
      </>
    ),
  },
] as const;

/* Horizontal variants — enter from right, exit to left, with overlap */
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 120 : -120,
    opacity: 0,
    filter: "blur(10px)",
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -120 : 120,
    opacity: 0,
    filter: "blur(10px)",
    scale: 0.98,
  }),
};

export function AppleDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);

  // Pause the carousel when the section isn't visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-advance every 3s while in view and not paused
  useEffect(() => {
    if (!inView || paused) return;
    const t = setInterval(() => {
      setDirection(1);
      setActive((v) => (v + 1) % SCENE_COUNT);
    }, SCENE_DURATION_MS);
    return () => clearInterval(t);
  }, [inView, paused, active]);

  // Pause when the tab is hidden
  useEffect(() => {
    function onVis() {
      setPaused(document.hidden);
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  function goTo(next: number) {
    // Determine direction: forward if next > active (mod wrap)
    const forward =
      next === active
        ? 1
        : next > active
        ? 1
        : next === 0 && active === SCENE_COUNT - 1
        ? 1
        : -1;
    setDirection(forward);
    setActive(next);
    setPaused(false);
  }

  return (
    <section
      ref={containerRef}
      id="demo"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24"
    >
      {/* Persistent backdrop — grid + radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(24,119,242,0.08), transparent 70%), radial-gradient(ellipse 40% 40% at 15% 20%, rgba(94,184,255,0.05), transparent 60%), radial-gradient(ellipse 40% 40% at 85% 80%, rgba(24,119,242,0.05), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent 80%)",
        }}
      />

      {/* Progress rail */}
      <ProgressRail
        active={active}
        onSelect={goTo}
        paused={paused}
        onTogglePause={() => setPaused((p) => !p)}
      />

      {/* Scene content — horizontal carousel with overlapping fades */}
      <div className="relative flex h-[560px] w-full max-w-5xl items-center justify-center">
        {/* Custom AnimatePresence mode: both children stay in DOM during transition */}
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.div
            key={active}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: {
                type: "spring",
                stiffness: 260,
                damping: 30,
                mass: 0.8,
              },
              opacity: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
              filter: { duration: 0.55, ease: [0.19, 1, 0.22, 1] },
              scale: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
            }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <SceneHeading
              n={SCENES[active].n}
              label={SCENES[active].label}
              heading={SCENES[active].heading}
            />

            {active === 0 && <GraphVisual />}
            {active === 1 && <AdaptiveVisual />}
            {active === 2 && <CodeVisual />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scene heading                                                       */
/* ------------------------------------------------------------------ */

function SceneHeading({
  n,
  label,
  heading,
}: {
  n: string;
  label: string;
  heading: ReactNode;
}) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-[#1877F2]">{n}</span>
        <span className="h-px w-6 bg-white/20" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
          {label}
        </span>
      </div>
      <h2 className="display-type mt-6 max-w-3xl text-center text-white">
        {heading}
      </h2>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Progress rail                                                       */
/* ------------------------------------------------------------------ */

function ProgressRail({
  active,
  onSelect,
  paused,
  onTogglePause,
}: {
  active: number;
  onSelect: (i: number) => void;
  paused: boolean;
  onTogglePause: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-end gap-6 md:flex">
      <div className="flex flex-col items-end gap-4">
        {SCENES.map((s, i) => {
          const isActive = i === active;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(i)}
              className="group flex items-center gap-3 transition-opacity"
              aria-label={`Go to scene ${s.n}`}
            >
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.15em] transition-colors",
                  isActive
                    ? "text-white"
                    : "text-white/30 group-hover:text-white/60"
                )}
              >
                {s.label}
              </span>
              <span className="relative flex h-2 w-2 items-center justify-center">
                {isActive && (
                  <motion.span
                    layoutId="demo-dot"
                    className="absolute inset-0 rounded-full bg-[#1877F2] shadow-[0_0_10px_rgba(24,119,242,0.9)]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {!isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20 group-hover:bg-white/40" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onTogglePause}
        className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white/60"
        aria-label={paused ? "Resume" : "Pause"}
      >
        {paused ? "▶ Play" : "❚❚ Pause"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Visuals                                                             */
/* ------------------------------------------------------------------ */

function GraphVisual() {
  return (
    <div className="mt-14 w-full max-w-2xl">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-4">
          {[
            { label: "Probability", pct: 34, tone: "rgba(244,244,245,0.28)" },
            { label: "Linear Algebra", pct: 64, tone: "rgba(244,244,245,0.55)" },
            { label: "Statistics", pct: 72, tone: "rgba(244,244,245,0.55)" },
            { label: "Python", pct: 88, tone: "#F4F4F5" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
              className="flex-1"
            >
              <div
                className="mb-2 h-1 rounded-full"
                style={{ background: s.tone }}
              />
              <p className="text-[10px] font-medium text-white/60">
                {s.label}
              </p>
              <p className="mt-0.5 font-mono text-lg font-semibold text-white">
                {s.pct}%
              </p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/[0.06] pt-5">
          <Network className="h-3 w-3 text-white/30" />
          <span className="font-mono text-[10px] text-white/30">
            68 prerequisite edges · 30 skills
          </span>
        </div>
      </div>
    </div>
  );
}

function AdaptiveVisual() {
  return (
    <div className="mt-14 w-full max-w-md space-y-3">
      {[
        { label: "3 / 3 correct", action: "Difficulty ↑", tone: "emerald" },
        { label: "2 / 3 correct", action: "Hold", tone: "white" },
        { label: "1 / 3 correct", action: "Difficulty ↓", tone: "amber" },
        { label: "0 / 3 correct", action: "Difficulty ↓↓", tone: "rose" },
      ].map((r, i) => (
        <motion.div
          key={r.label}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 + i * 0.08 }}
          className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-3.5 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <Zap className="h-3.5 w-3.5 text-white/30" />
            <span className="text-sm text-white/60">{r.label}</span>
          </div>
          <span
            className={cn(
              "font-mono text-xs font-medium",
              r.tone === "emerald" && "text-emerald-400",
              r.tone === "amber" && "text-amber-400",
              r.tone === "rose" && "text-rose-400",
              r.tone === "white" && "text-white/60"
            )}
          >
            {r.action}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function CodeVisual() {
  return (
    <div className="mt-14 grid w-full max-w-3xl gap-4 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl"
      >
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-black/30 px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-[#FF5F57]/70" />
          <span className="h-2 w-2 rounded-full bg-[#FEBC2E]/70" />
          <span className="h-2 w-2 rounded-full bg-[#28C840]/70" />
          <span className="ml-2 flex items-center gap-1.5 font-mono text-[10px] text-white/40">
            <Code2 className="h-3 w-3" />
            solution.py
          </span>
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-white/80">
{`def bayes(prior, likelihood, evidence):
    return (likelihood * prior) / evidence

assert abs(bayes(0.3, 0.8, 0.5) - 0.48) < 1e-9`}
        </pre>
      </motion.div>

      <div className="space-y-2">
        {[
          "bayes(0.5, 0.5, 0.5) returns 0.5",
          "bayes(0.3, 0.8, 0.5) returns 0.48",
          "Returns a float, not an int",
          "Does not mutate inputs",
        ].map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-3"
          >
            <span className="text-text-primary">✓</span>
            <span className="text-[12px] text-white/70">{t}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
