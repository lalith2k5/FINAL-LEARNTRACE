"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { setActiveDomain } from "@/app/(app)/domains/actions";
import { notify } from "@/lib/toast";

type Domain = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type Props = {
  domains: Domain[];
};

export function DomainSwitcher({ domains }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const active = domains.find((d) => d.isActive) ?? domains[0];

  if (!active) return null;

  if (domains.length === 1) {
    return (
      <span className="flex h-8 items-center gap-1.5 rounded-lg border border-border-default bg-bg-elevated/40 px-2.5 text-[11px] text-text-tertiary">
        <Layers className="h-3 w-3" />
        <span className="max-w-[140px] truncate">{active.name}</span>
      </span>
    );
  }

  function switchTo(id: string) {
    if (id === active.id) {
      setOpen(false);
      return;
    }
    setOpen(false);
    startTransition(async () => {
      const res = await setActiveDomain(id);
      if (!res.ok) {
        notify.error("Couldn't switch domain", res.error);
        return;
      }
      router.refresh();
      const next = domains.find((d) => d.id === id);
      if (next) notify.success(`Switched to ${next.name}`);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border border-border-default bg-bg-elevated/40 px-2.5 text-[11px] text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary",
          isPending && "cursor-wait opacity-60"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Layers className="h-3 w-3 text-text-tertiary" />
        <span className="max-w-[140px] truncate">{active.name}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-text-tertiary transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border-default bg-bg-overlay/95 p-1 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
              role="menu"
            >
              <p className="label-mono px-2 py-1.5 text-[10px] text-text-quaternary">
                Switch domain
              </p>
              {domains.map((d) => {
                const isCurrent = d.id === active.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    role="menuitem"
                    onClick={() => switchTo(d.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                      isCurrent
                        ? "bg-bg-inset text-text-primary"
                        : "text-text-secondary hover:bg-bg-inset/60 hover:text-text-primary"
                    )}
                  >
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                      {isCurrent && (
                        <Check className="h-3 w-3 text-accent" />
                      )}
                    </span>
                    <span className="truncate">{d.name}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
