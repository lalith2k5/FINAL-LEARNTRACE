"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Mail } from "lucide-react";

function VerifyStatus() {
  const params = useSearchParams();
  const ok = params.get("ok");
  const error = params.get("error");

  if (ok) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald/40 bg-emerald/10 text-emerald">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          Email verified
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Your email has been confirmed. You can continue learning.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90"
        >
          Go to dashboard
        </Link>
      </motion.div>
    );
  }

  if (error) {
    const missing = error === "missing";
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose/40 bg-rose/10 text-rose">
          <XCircle className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          {missing ? "Invalid link" : "Verification failed"}
        </h1>
        <p className="mt-2 text-sm text-white/50">
          {missing
            ? "This verification link is missing required parameters."
            : "The link has expired or was already used."}
        </p>
        <Link
          href="/verify-request"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90"
        >
          Request a new link
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-white/40">
        <Mail className="h-5 w-5" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
        Verifying your email
      </h1>
      <p className="mt-2 text-sm text-white/50">
        Hold on, this should only take a moment.
      </p>
    </motion.div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyStatus />
    </Suspense>
  );
}
