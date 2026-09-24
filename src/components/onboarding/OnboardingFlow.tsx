"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  LayoutGrid,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lt_onboarded_v1";

type Step = {
  n: number;
  title: string;
  body: string;
  icon: typeof Sparkles;
  cta?: { label: string; href: string };
  tone: "accent" | "emerald" | "amber";
};

const STEPS: Step[] = [
  {
    n: 1,
    title: "Welcome to LearnTrace",
    body: "LearnTrace models skills as a knowledge graph, tracks mastery from real evidence, and tells you what to learn next — and why. It's not a course library; it's a personalized learning system.",
    icon: Sparkles,
    tone: "accent",
  },
  {
    n: 2,
    title: "Pick a domain",
    body: "Choose up to 3 learning domains. One is active at a time and filters the entire app — dashboard, graph, roadmap, and gaps all reflect your current goal.",
    icon: LayoutGrid,
    tone: "emerald",
    cta: { label: "Pick a domain", href: "/domains" },
  },
  {
    n: 3,
    title: "Take the diagnostic",
    body: "A 15-question diagnostic (with AI tutor explanations on every wrong answer) estimates your starting mastery. From there, LearnTrace finds your highest-impact skill gaps and builds your path.",
    icon: ClipboardCheck,
    tone: "amber",
    cta: { label: "Start diagnostic", href: "/assessment" },
  },
];

export function OnboardingFlow() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Skip on the domain picker — the user is already doing that
    // task. The modal will open when they land on /dashboard.
    if (pathname === "/domains") return;
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        // Small delay so the app shell renders first
        const t = setTimeout(() => setOpen(true), 700);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage blocked (incognito) — skip onboarding
    }
  }, [pathname]);

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (!mounted) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const toneClass = {
    accent: {
      bg: "bg-accent/10",
      text: "text-accent",
      border: "border-accent/40",
      glow: "shadow-[0_0_32px_-12px_rgba(244,244,245,0.7)]",
    },
    emerald: {
      bg: "bg-white/[0.06]",
      text: "text-text-primary",
      border: "border-white/[0.12]/40",
      glow: "shadow-[0_0_32px_-12px_rgba(244,244,245,0.7)]",
    },
    amber: {
      bg: "bg-white/[0.04]",
      text: "text-text-secondary",
      border: "border-white/[0.10]/40",
      glow: "shadow-[0_0_32px_-12px_rgba(244,244,245,0.7)]",
    },
  }[current.tone];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative w-full max-w-lg overflow-hidden rounded-2xl border bg-bg-elevated shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9)]",
              toneClass.border,
              toneClass.glow
            )}
          >
            {/* Skip */}
            <button
              onClick={finish}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-bg-inset hover:text-text-primary"
              aria-label="Skip onboarding"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Icon */}
            <div className="px-8 pt-8">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl border",
                  toneClass.bg,
                  toneClass.border,
                  toneClass.text
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            {/* Content */}
            <div className="px-8 pt-6 pb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.n}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                    {current.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {current.body}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Optional CTA */}
              {current.cta && (
                <Link
                  href={current.cta.href}
                  onClick={finish}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  {current.cta.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {/* Footer — progress + nav */}
            <div className="flex items-center justify-between border-t border-border-subtle bg-bg-base/50 px-6 py-3.5">
              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((s, i) => (
                  <button
                    key={s.n}
                    onClick={() => setStep(i)}
                    aria-label={`Go to step ${s.n}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === step
                        ? cn("w-6", toneClass.bg.replace("/10", ""))
                        : i < step
                        ? "w-1.5 bg-border-strong"
                        : "w-1.5 bg-border-default"
                    )}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={back}
                    className="btn-ghost text-xs"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                )}
                <button onClick={next} className="btn-primary text-xs">
                  {isLast ? "Get started" : "Next"}
                  {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
