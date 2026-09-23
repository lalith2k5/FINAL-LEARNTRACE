"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { updateProfile } from "@/app/(app)/profile/actions";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

type Props = {
  initialName: string;
  email: string;
};

export function ProfileForm({ initialName, email }: Props) {
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty = name.trim() !== initialName.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateProfile({ name: name.trim() });
      if (!res.ok) {
        setError(res.error ?? "Could not update profile.");
        notify.error("Update failed", res.error ?? undefined);
        return;
      }
      setSaved(true);
      notify.success("Profile updated");
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <GlassPanel strong>
      <p className="label-mono">Identity</p>

      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className="label-mono block">Display name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border-default bg-bg-inset px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-quaternary focus:border-hover-border focus:ring-1 focus:ring-[color:var(--color-focus-ring)]"
            placeholder="Your name"
            maxLength={60}
          />
        </div>

        <div>
          <label className="label-mono block">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="mt-2 w-full cursor-not-allowed rounded-lg border border-border-subtle bg-bg-inset/40 px-3 py-2.5 text-sm text-text-tertiary"
          />
          <p className="mt-1.5 text-[10px] text-text-quaternary">
            Email cannot be changed yet.
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-text-tertiary"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!dirty || isPending}
            className={cn(
              "btn-primary text-xs",
              (!dirty || isPending) && "cursor-not-allowed opacity-40"
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </button>

          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-xs text-text-primary"
              >
                <Check className="h-3.5 w-3.5" />
                Saved
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => {
            try {
              localStorage.removeItem("lt_onboarded_v1");
            } catch {}
            window.location.reload();
          }}
          className="text-[11px] text-text-tertiary underline decoration-dotted underline-offset-4 transition-colors hover:text-accent"
        >
          Replay onboarding tour
        </button>
      </form>
    </GlassPanel>
  );
}
