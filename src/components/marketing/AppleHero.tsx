"use client";

import Link from "next/link";
import { useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export function AppleHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const previewScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const previewY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const scrollToDemo = useCallback(() => {
    const target = document.getElementById("demo");
    if (!target) return;
    const targetY =
      target.getBoundingClientRect().top + window.scrollY - 40;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }, []);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
    >
      {/* Dark void background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(24,119,242,0.08), transparent 65%), #000",
        }}
      />

      {/* Subtle star field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 80% 20%, rgba(255,255,255,0.25), transparent), radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.2), transparent), radial-gradient(1px 1px at 45% 15%, rgba(255,255,255,0.3), transparent)",
          backgroundSize: "100% 100%",
        }}
      />

      {/* Hero copy */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="mx-auto max-w-4xl text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40"
        >
          Built on evidence, not completion
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(16px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="hero-type text-white"
        >
          Learning that
          <br />
          <span className="bg-gradient-to-r from-[#1877F2] via-[#22D3EE] to-[#1877F2] bg-clip-text text-transparent">
            knows what you know.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="lead-type mx-auto mt-8 max-w-2xl text-white/60"
        >
          LearnTrace finds the one prerequisite that&apos;s blocking the most, ranks
          it against your goal, and builds a plan around evidence — not
          completion.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-[15px] font-medium text-black transition-all duration-300 hover:bg-white/90"
          >
            Start learning free
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <button
            type="button"
            onClick={scrollToDemo}
            className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3 text-[15px] font-medium text-white/80 transition-all duration-300 hover:border-white/40 hover:text-white"
          >
            <Play className="h-3.5 w-3.5" />
            See how it works
          </button>
        </motion.div>
      </motion.div>

      {/* Floating dashboard preview */}
      <motion.div
        style={{ scale: previewScale, y: previewY }}
        initial={{ opacity: 0, y: 80, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.4,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.9,
        }}
        className="relative mx-auto mt-20 w-full max-w-5xl"
      >
        {/* Ambient glow behind preview */}
        <div
          aria-hidden
          className="absolute inset-x-20 -bottom-10 -top-10 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(244,244,245,0.35), transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Glass dashboard mockup */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[0_60px_120px_-40px_rgba(0,0,0,1),0_0_0_1px_rgba(255,255,255,0.05)_inset] backdrop-blur-2xl">
          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] bg-black/40 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/80" />
            <span className="ml-4 rounded bg-white/[0.06] px-2.5 py-0.5 font-mono text-[10px] text-white/40">
              learntrace.app/dashboard
            </span>
          </div>

          <DashboardPreviewBody />
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        style={{ opacity: heroOpacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-2 w-1 rounded-full bg-white/60"
          />
        </div>
      </motion.div>
    </section>
  );
}

function DashboardPreviewBody() {
  return (
    <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-[180px_1fr_220px]">
      {/* Sidebar */}
      <div className="hidden flex-col gap-1 md:flex">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.15em] text-white/30">
          Learn
        </p>
        {["Dashboard", "Assessment", "Knowledge Graph"].map((l, i) => (
          <div
            key={l}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] ${
              i === 0
                ? "bg-white/[0.06] text-white"
                : "text-white/40"
            }`}
          >
            {i === 0 && <span className="h-1 w-0.5 rounded-full bg-[#1877F2]" />}
            {l}
          </div>
        ))}
        <p className="mb-2 mt-4 font-mono text-[9px] uppercase tracking-[0.15em] text-white/30">
          Progress
        </p>
        {["Skill Gaps", "Roadmap", "Practice"].map((l) => (
          <div
            key={l}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] text-white/40"
          >
            {l}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
              Dashboard
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              Your learning state
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] text-white/40">
            ML TRACK
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Mastery", value: "58%", tone: "text-white" },
            { label: "Verified", value: "3", tone: "text-text-primary" },
            { label: "Gaps", value: "12", tone: "text-text-tertiary" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/30">
                {s.label}
              </p>
              <p className={`mt-1.5 text-xl font-semibold ${s.tone}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/30">
              Mastery over time
            </p>
            <span className="font-mono text-[9px] text-white/20">last 30d</span>
          </div>
          <svg viewBox="0 0 300 60" className="h-16 w-full">
            <defs>
              <linearGradient id="appleLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1877F2" />
                <stop offset="100%" stopColor="#5EB8FF" />
              </linearGradient>
              <linearGradient id="appleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1877F2" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1877F2" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,50 C 40,45 60,32 100,30 C 140,28 160,20 200,15 C 240,10 260,12 300,6"
              fill="none"
              stroke="url(#appleLineGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 0,50 C 40,45 60,32 100,30 C 140,28 160,20 200,15 C 240,10 260,12 300,6 L 300,60 L 0,60 Z"
              fill="url(#appleAreaGrad)"
            />
          </svg>
        </div>
      </div>

      {/* Right rail */}
      <div className="hidden flex-col gap-3 md:flex">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white/[0.08]-400" />
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-primary">
              Verified
            </p>
          </div>
          <p className="mt-2 text-xs font-medium text-white">
            Python Programming
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-white/40">
            Theory + practical both passed
          </p>
        </div>

        <div className="rounded-xl border border-[#1877F2]/25 bg-[#1877F2]/[0.05] p-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1877F2]" />
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5EB8FF]">
              AI Tutor
            </p>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-white/60">
            Bayes&apos; denominator is P(B), not P(A). Review the law of total
            probability.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/30">
            Next up
          </p>
          <p className="mt-2 text-xs font-medium text-white">
            Conditional Probability
          </p>
          <p className="mt-1 text-[10px] text-white/40">Unlocks Statistics</p>
        </div>
      </div>
    </div>
  );
}
