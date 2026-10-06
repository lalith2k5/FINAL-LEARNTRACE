"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Check, AlertCircle } from "lucide-react";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { cn } from "@/lib/utils";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!email || !token) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose/40 bg-rose/10 text-rose">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          Invalid reset link
        </h1>
        <p className="mt-2 text-sm text-white/50">
          This reset link is missing required parameters.
        </p>
        <Link
          href="/forgot-password"
          className="mt-8 inline-flex rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-white/90"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald/40 bg-emerald/10 text-emerald">
          <Check className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          Password updated
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Sign in with your new password.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-white/90"
        >
          Sign in
        </Link>
      </motion.div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/email/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't reset password");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
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
          Choose a new password
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Setting a new password for{" "}
          <span className="text-white/80">{email}</span>.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="New password"
          autoComplete="new-password"
          minLength={8}
          showStrength
        />

        <div>
          <label
            htmlFor="confirm"
            className="mb-2 block text-xs font-medium text-white/60"
          >
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            className={cn(
              "w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-sm text-white outline-none",
              "transition-all duration-200 placeholder:text-white/20",
              "hover:border-white/[0.14]",
              "focus:border-accent/60 focus:bg-white/[0.04] focus:ring-4 focus:ring-accent/10"
            )}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-rose-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all duration-200",
            "hover:bg-white/90",
            submitting && "cursor-not-allowed opacity-60"
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update password"
          )}
        </button>
      </form>
    </motion.div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
