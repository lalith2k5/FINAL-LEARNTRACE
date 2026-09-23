"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { cn } from "@/lib/utils";

function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Account created, but sign-in failed. Try logging in.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
    >
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to home
      </Link>

      <div className="mb-8 flex items-center gap-2 lg:hidden">
        <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(24,119,242,0.7)]" />
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-white/60">
          LearnTrace
        </span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Start tracing your learning journey.
        </p>
      </div>

      <GoogleButton label="Sign up with Google" />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[0.08]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
          or
        </span>
        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="name"
              className="text-xs font-medium text-white/60"
            >
              Name
            </label>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25">
              Optional
            </span>
          </div>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className={cn(
              "w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-sm text-white outline-none",
              "transition-all duration-200",
              "placeholder:text-white/20",
              "hover:border-white/[0.14]",
              "focus:border-accent/60 focus:bg-white/[0.04] focus:ring-4 focus:ring-accent/10"
            )}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-medium text-white/60"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={cn(
              "w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-sm text-white outline-none",
              "transition-all duration-200",
              "placeholder:text-white/20",
              "hover:border-white/[0.14]",
              "focus:border-accent/60 focus:bg-white/[0.04] focus:ring-4 focus:ring-accent/10"
            )}
          />
        </div>

        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
          showStrength
        />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/50 bg-rose-500/10 px-3.5 py-3 shadow-[0_0_0_1px_rgba(244,63,94,0.15),0_8px_24px_-12px_rgba(244,63,94,0.4)]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                <p className="text-sm font-medium leading-relaxed text-rose-300">
                  {error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all duration-200",
            "hover:bg-white/90",
            loading && "cursor-not-allowed opacity-60"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-white/30">
        By creating an account, you agree to our{" "}
        <span className="text-white/50">Terms</span> and{" "}
        <span className="text-white/50">Privacy Policy</span>.
      </p>

      <p className="mt-6 text-center text-xs text-white/40">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-white transition-colors hover:text-accent"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
