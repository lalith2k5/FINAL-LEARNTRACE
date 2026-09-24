"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { resetProgress } from "@/app/(app)/profile/actions";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function ResetProgressSection() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleReset() {
    startTransition(async () => {
      const res = await resetProgress();
      if (!res.ok) {
        notify.error("Reset failed", "Please try again.");
        return;
      }
      notify.success("Progress reset", "All learning data has been cleared.");
      setConfirming(false);
      router.refresh();
    });
  }

  return (
    <GlassPanel className={cn(confirming && "border-l-2 border-l-white/[0.20]")}>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-inset text-text-secondary">
          <RotateCcw className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="label-mono">Reset progress</p>
          <p className="mt-1 text-sm text-text-secondary">
            Wipes your mastery, attempts, sessions, material progress, code
            submissions, and roadmap.{" "}
            <span className="text-text-tertiary">
              Domains and profile are kept.
            </span>
          </p>

          <AnimatePresence mode="wait">
            {!confirming ? (
              <motion.button
                key="trigger"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                onClick={() => setConfirming(true)}
                className="mt-4 btn-ghost text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset progress…
              </motion.button>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-4 space-y-3 rounded-lg border border-white/[0.10] bg-white/[0.02] p-3"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-secondary" />
                  <p className="text-xs leading-relaxed text-text-secondary">
                    This cannot be undone. You&apos;ll need to retake the
                    diagnostic to rebuild your learner model.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    disabled={isPending}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-md border border-white/[0.15] bg-white/[0.08] px-3 text-xs font-medium text-text-primary transition-colors hover:bg-white/[0.12]",
                      isPending && "cursor-not-allowed opacity-60"
                    )}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Resetting…
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" />
                        Yes, reset everything
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    disabled={isPending}
                    className="btn-ghost text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GlassPanel>
  );
}
