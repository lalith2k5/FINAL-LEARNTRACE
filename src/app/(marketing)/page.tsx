import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppleHero } from "@/components/marketing/AppleHero";
import { AppleDemo } from "@/components/marketing/AppleDemo";
import { ManifestoSection } from "@/components/marketing/ManifestoSection";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white [overflow-x:clip]">
      <AppleHero />
      <AppleDemo />
      <ManifestoSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] px-6 py-40 md:py-56">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(24,119,242,0.12), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="hero-type text-white">
          What should you
          <br />
          <span className="bg-gradient-to-r from-[#1877F2] via-[#5EB8FF] to-[#1877F2] bg-clip-text text-transparent">
            learn next — and why?
          </span>
        </h2>
        <p className="lead-type mx-auto mt-8 max-w-xl text-white/50">
          Find your first prerequisite gap in under two minutes.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-[15px] font-medium text-black transition-all duration-300 hover:bg-white/90"
          >
            Start learning free
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3 text-[15px] font-medium text-white/80 transition-all duration-300 hover:border-white/40 hover:text-white"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-14">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#1877F2] shadow-[0_0_10px_rgba(24,119,242,0.7)]" />
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-white/40">
            LearnTrace
          </span>
        </div>
        <p className="text-[11px] text-white/30">
          An evidence-driven learning framework.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-[11px] text-white/40 transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-[11px] text-white/40 transition-colors hover:text-white"
          >
            Get started
          </Link>
        </div>
      </div>
    </footer>
  );
}
