"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/email/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError("Couldn't process your request.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-white/50">
          If an account exists for{" "}
          <span className="text-white/80">{email}</span>, a reset link is on
          its way.
        </p>
        <p className="mt-1 text-xs text-white/30">
          In dev mode, check the server terminal for the link.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white"
        >
          Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link
        href="/login"
        className="mb-8 inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to sign in
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={cn(
              "w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-sm text-white outline-none",
              "transition-all duration-200 placeholder:text-white/20",
              "hover:border-white/[0.14]",
              "focus:border-accent/60 focus:bg-white/[0.04] focus:ring-4 focus:ring-accent/10"
            )}
          />
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={sending}
          className={cn(
            "group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all duration-200",
            "hover:bg-white/90",
            sending && "cursor-not-allowed opacity-60"
          )}
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </motion.div>
  );
}
