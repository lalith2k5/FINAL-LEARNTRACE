"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Target,
  ShieldCheck,
  Check,
  X,
  ArrowUpDown,
  Clock,
  Zap,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Tab config                                                          */
/* ------------------------------------------------------------------ */

const TABS = [
  {
    id: "mastery",
    label: "Mastery",
    icon: Sparkles,
    eyebrow: "01",
  },
  {
    id: "priorities",
    label: "Priorities",
    icon: Target,
    eyebrow: "02",
  },
  {
    id: "verification",
    label: "Verification",
    icon: ShieldCheck,
    eyebrow: "03",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ManifestoSection() {
  const [active, setActive] = useState<TabId>("mastery");

  return (
    <section className="border-t border-white/[0.06] px-6 py-32 md:py-44">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <p className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">
          The difference
        </p>
        <h2 className="display-type text-center text-white">
          Most platforms track
          <br />
          <span className="text-white/30">what you watched.</span>{" "}
          <span className="bg-gradient-to-r from-[#1877F2] via-[#5EB8FF] to-[#1877F2] bg-clip-text text-transparent">
            We track what you know.
          </span>
        </h2>

        {/* Tabs */}
        <div className="mt-16 flex justify-center">
          <div
            role="tablist"
            aria-label="The difference"
            className="relative flex h-11 items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur-xl"
          >
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = active === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(t.id)}
                  className={cn(
                    "relative z-10 flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : "text-white/40 hover:text-white/70"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="manifesto-tab-pill"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                      className="absolute inset-0 rounded-full bg-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_16px_-4px_rgba(24,119,242,0.6)]"
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panels */}
        <div className="relative mt-12 h-[440px] md:h-[380px]">
          <AnimatePresence mode="wait">
            {active === "mastery" && (
              <Panel key="mastery">
                <MasteryPanel />
              </Panel>
            )}
            {active === "priorities" && (
              <Panel key="priorities">
                <PrioritiesPanel />
              </Panel>
            )}
            {active === "verification" && (
              <Panel key="verification">
                <VerificationPanel />
              </Panel>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Panel wrapper                                                       */
/* ------------------------------------------------------------------ */

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      className="absolute inset-0"
    >
      <div className="grid h-full gap-4 md:grid-cols-2 md:gap-6">
        {children}
      </div>
    </motion.div>
  );
}

function SideLabel({
  variant,
  label,
}: {
  variant: "wrong" | "right";
  label: string;
}) {
  const isWrong = variant === "wrong";
  return (
    <div className="mb-4 flex items-center gap-2">
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full",
          isWrong ? "bg-white/[0.06]" : "bg-[#1877F2]/20"
        )}
      >
        {isWrong ? (
          <X className="h-2.5 w-2.5 text-white/40" />
        ) : (
          <Check className="h-2.5 w-2.5 text-[#5EB8FF]" />
        )}
      </span>
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.2em]",
          isWrong ? "text-white/30" : "text-[#5EB8FF]"
        )}
      >
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mastery panel                                                       */
/* ------------------------------------------------------------------ */

const EVIDENCE = [
  { label: "Correct", icon: Check, tone: "emerald" },
  { label: "Hard", icon: TrendingUp, tone: "amber" },
  { label: "Fast", icon: Zap, tone: "accent" },
  { label: "Confident", icon: Sparkles, tone: "violet" },
] as const;

function MasteryPanel() {
  const [active, setActive] = useState<number | null>(0);

  // Mastery moves depending on which evidence chip is selected
  const baseMastery = 68;
  const deltas = [0, 8, -6, 4];
  const mastery = baseMastery + (active === null ? 0 : deltas[active]);

  return (
    <>
      {/* Wrong way */}
      <div className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 backdrop-blur-xl">
        <SideLabel variant="wrong" label="Typical platforms" />

        <div className="flex flex-1 flex-col justify-center">
          <p className="text-2xl font-medium tracking-tight text-white/40 line-through decoration-white/20">
            Course complete
          </p>
          <p className="mt-6 text-5xl font-semibold tracking-tight text-white/40">
            100%
          </p>

          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div className="h-full w-full bg-white/20" />
          </div>

          <p className="mt-6 text-[13px] leading-relaxed text-white/30">
            Watched 24 lessons. Clicked &quot;complete&quot;. The platform has
            no idea whether you actually understood any of it.
          </p>
        </div>
      </div>

      {/* Right way */}
      <div className="flex h-full flex-col rounded-2xl border border-[#1877F2]/25 bg-[#1877F2]/[0.04] p-6 backdrop-blur-xl">
        <SideLabel variant="right" label="LearnTrace" />

        <div className="flex flex-1 flex-col">
          <p className="text-2xl font-medium tracking-tight text-white">
            Actual mastery
          </p>

          <div className="mt-6 flex items-end gap-4">
            <p className="font-mono text-5xl font-semibold tracking-tight text-white">
              {mastery}%
            </p>
            <span className="mb-2 font-mono text-[11px] text-white/40">
              effective
            </span>
          </div>

          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#1877F2] to-[#5EB8FF]"
              animate={{ width: `${mastery}%` }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            />
          </div>

          {/* Evidence chips — clickable */}
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
            Evidence
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {EVIDENCE.map((e, i) => {
              const Icon = e.icon;
              const isActive = active === i;
              return (
                <button
                  key={e.label}
                  onClick={() => setActive(isActive ? null : i)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all",
                    isActive
                      ? e.tone === "emerald"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-text-primary"
                        : e.tone === "amber"
                        ? "border-white/[0.10] bg-amber-500/10 text-text-secondary"
                        : e.tone === "accent"
                        ? "border-[#1877F2]/40 bg-[#1877F2]/10 text-[#5EB8FF]"
                        : "border-white/[0.10] bg-white/[0.04] text-text-secondary"
                      : "border-white/[0.08] bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/80"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {e.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] text-white/30">
            {active === null
              ? "Tap an evidence chip to see how mastery changes."
              : "Every piece of evidence updates the estimate in real time."}
          </p>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Priorities panel                                                    */
/* ------------------------------------------------------------------ */

const SKILLS = [
  { name: "Python", score: 88, mastery: 88, impact: 0.0 },
  { name: "Statistics", score: 72, mastery: 72, impact: 1.8 },
  { name: "Linear Algebra", score: 64, mastery: 64, impact: 2.3 },
  { name: "Probability", score: 34, mastery: 34, impact: 3.9 },
];

function PrioritiesPanel() {
  const [order, setOrder] = useState<"score" | "impact">("impact");

  const sorted =
    order === "score"
      ? [...SKILLS].sort((a, b) => a.score - b.score).reverse()
      : [...SKILLS].sort((a, b) => b.impact - a.impact);

  return (
    <>
      {/* Left: static "wrong way" */}
      <div className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 backdrop-blur-xl">
        <SideLabel variant="wrong" label="Typical platforms" />

        <div className="flex flex-1 flex-col">
          <p className="text-2xl font-medium tracking-tight text-white/40 line-through decoration-white/20">
            Lowest score wins
          </p>

          <ul className="mt-6 space-y-2.5">
            {[...SKILLS]
              .sort((a, b) => a.score - b.score)
              .reverse()
              .map((s, i) => (
                <li
                  key={s.name}
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-white/30">
                      #{i + 1}
                    </span>
                    <span className="text-sm text-white/50">{s.name}</span>
                  </div>
                  <span className="font-mono text-xs text-white/40">
                    {s.score}%
                  </span>
                </li>
              ))}
          </ul>

          <p className="mt-auto pt-6 text-[13px] leading-relaxed text-white/30">
            Sorts by raw score. Misses that a low prerequisite blocks
            everything downstream.
          </p>
        </div>
      </div>

      {/* Right: interactive */}
      <div className="flex h-full flex-col rounded-2xl border border-[#1877F2]/25 bg-[#1877F2]/[0.04] p-6 backdrop-blur-xl">
        <SideLabel variant="right" label="LearnTrace" />

        <div className="flex flex-1 flex-col">
          <p className="text-2xl font-medium tracking-tight text-white">
            Highest impact first
          </p>

          {/* Toggle */}
          <div className="mt-5 inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.02] p-0.5 text-[10px]">
            {(
              [
                { v: "score", label: "By score" },
                { v: "impact", label: "By impact" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setOrder(opt.v)}
                className={cn(
                  "rounded-full px-3 py-1 font-medium uppercase tracking-[0.1em] transition-all",
                  order === opt.v
                    ? "bg-white/[0.08] text-white"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <ul className="mt-5 space-y-2.5">
            <AnimatePresence initial={false} mode="popLayout">
              {sorted.map((s, i) => {
                const isTop =
                  i === 0 && order === "impact" && s.name === "Probability";
                return (
                  <motion.li
                    key={s.name}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.19, 1, 0.22, 1],
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-4 py-3 transition-colors",
                      isTop
                        ? "border-[#1877F2]/40 bg-[#1877F2]/[0.08]"
                        : "border-white/[0.06] bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "font-mono text-[10px]",
                          isTop ? "text-[#5EB8FF]" : "text-white/30"
                        )}
                      >
                        #{i + 1}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          isTop ? "text-white" : "text-white/60"
                        )}
                      >
                        {s.name}
                      </span>
                      {isTop && (
                        <span className="rounded-full bg-[#1877F2]/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#5EB8FF]">
                          Fix first
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-mono text-xs",
                        isTop ? "text-white" : "text-white/40"
                      )}
                    >
                      {s.score}%
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <p className="mt-auto pt-6 text-[13px] leading-relaxed text-white/50">
            {order === "impact"
              ? "Probability scores 34% AND blocks Statistics, Model Evaluation, and Supervised Learning. Highest impact = fix first."
              : "Same data, sorted by raw score. Now compare which list makes the better recommendation."}
          </p>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Verification panel                                                  */
/* ------------------------------------------------------------------ */

function VerificationPanel() {
  const [theory, setTheory] = useState(true);
  const [practical, setPractical] = useState(false);

  const verified = theory && practical;

  return (
    <>
      {/* Wrong way */}
      <div className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 backdrop-blur-xl">
        <SideLabel variant="wrong" label="Typical platforms" />

        <div className="flex flex-1 flex-col justify-center">
          <p className="text-2xl font-medium tracking-tight text-white/40 line-through decoration-white/20">
            One quiz, one pass
          </p>

          <div className="mt-8 space-y-2.5">
            <CheckRow label="Quiz passed" checked={true} variant="muted" />
            <CheckRow label="Practical task" checked={false} variant="disabled" />
          </div>

          <div className="mt-8 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
              Status
            </p>
            <p className="mt-1 text-sm text-white/40">
              &ldquo;Skill completed&rdquo; &mdash; but can the learner
              actually use it?
            </p>
          </div>

          <p className="mt-auto pt-6 text-[13px] leading-relaxed text-white/30">
            One correct quiz doesn&apos;t prove understanding. And even
            understanding doesn&apos;t prove application.
          </p>
        </div>
      </div>

      {/* Right way — interactive checkboxes */}
      <div className="flex h-full flex-col rounded-2xl border border-[#1877F2]/25 bg-[#1877F2]/[0.04] p-6 backdrop-blur-xl">
        <SideLabel variant="right" label="LearnTrace" />

        <div className="flex flex-1 flex-col">
          <p className="text-2xl font-medium tracking-tight text-white">
            Theory and practice
          </p>

          <div className="mt-8 space-y-2.5">
            <CheckRow
              label="Theory — quizzes"
              checked={theory}
              onClick={() => setTheory((v) => !v)}
              variant="interactive"
            />
            <CheckRow
              label="Practical — code tasks"
              checked={practical}
              onClick={() => setPractical((v) => !v)}
              variant="interactive"
            />
          </div>

          <motion.div
            layout
            className={cn(
              "mt-8 rounded-lg border px-4 py-3 transition-colors",
              verified
                ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                : "border-white/[0.06] bg-white/[0.02]"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full",
                  verified ? "bg-emerald-500/20" : "bg-white/[0.06]"
                )}
              >
                {verified ? (
                  <Check className="h-2.5 w-2.5 text-text-primary" />
                ) : (
                  <Clock className="h-2.5 w-2.5 text-white/40" />
                )}
              </span>
              <p
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.15em]",
                  verified ? "text-emerald-400" : "text-white/30"
                )}
              >
                {verified ? "Verified" : "Not verified"}
              </p>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={verified ? "v" : "nv"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "mt-1 text-sm",
                  verified ? "text-white" : "text-white/40"
                )}
              >
                {verified
                  ? "Theory and practical both passed. Skill verified."
                  : theory
                  ? "Theory passed. Needs a practical to verify."
                  : practical
                  ? "Practical passed. Needs theory to verify."
                  : "Not enough evidence. Complete both to verify."}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          <p className="mt-auto pt-6 text-[13px] leading-relaxed text-white/50">
            Tap the checkboxes above. A skill only becomes{" "}
            <span className="text-emerald-400">verified</span> when both
            evidence types pass.
          </p>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Check row                                                           */
/* ------------------------------------------------------------------ */

function CheckRow({
  label,
  checked,
  onClick,
  variant,
}: {
  label: string;
  checked: boolean;
  onClick?: () => void;
  variant: "muted" | "disabled" | "interactive";
}) {
  const clickable = variant === "interactive" && onClick;

  return (
    <button
      onClick={onClick}
      disabled={!clickable}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all",
        variant === "interactive"
          ? checked
            ? "cursor-pointer border-emerald-500/30 bg-emerald-500/[0.04] hover:border-emerald-500/50"
            : "cursor-pointer border-white/[0.08] bg-white/[0.02] hover:border-white/20"
          : checked
          ? "border-white/[0.06] bg-white/[0.02]"
          : "border-white/[0.04] bg-transparent opacity-50"
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          checked
            ? variant === "interactive"
              ? "border-emerald-500/40 bg-emerald-500/20"
              : "border-white/20 bg-white/10"
            : "border-white/[0.1] bg-transparent"
        )}
      >
        {checked && (
          <Check
            className={cn(
              "h-3 w-3",
              variant === "interactive" ? "text-text-primary" : "text-white/50"
            )}
          />
        )}
      </span>
      <span
        className={cn(
          "text-sm",
          variant === "interactive"
            ? checked
              ? "text-white"
              : "text-white/60"
            : checked
            ? "text-white/50"
            : "text-white/30"
        )}
      >
        {label}
      </span>
    </button>
  );
}
