"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { notify } from "@/lib/toast";

type Props = {
  email: string;
};

export function EmailVerificationBanner({ email }: Props) {
  const [open, setOpen] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  async function resend() {
    setSending(true);
    try {
      const res = await fetch("/api/email/verify-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        notify.error("Couldn't send verification email");
        return;
      }
      setSent(true);
      notify.success("Verification email sent", "Check your inbox.");
    } catch {
      notify.error("Network error");
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mb-6"
    >
      <GlassPanel className="border-l-2 border-l-amber">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber/40 bg-amber/10 text-amber">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="label-mono text-amber">Verify your email</p>
            <p className="mt-1 text-sm text-text-secondary">
              {sent
                ? `We sent a fresh link to ${email}. Check your inbox.`
                : `Confirm ${email} to unlock password recovery and secure your account.`}
            </p>
            {!sent && (
              <button
                onClick={resend}
                disabled={sending}
                className="mt-2 text-xs font-medium text-accent transition-colors hover:text-accent-hover disabled:opacity-60"
              >
                {sending ? "Sending..." : "Resend verification email →"}
              </button>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="shrink-0 rounded-md p-1 text-text-tertiary transition-colors hover:bg-bg-inset hover:text-text-primary"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
