"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { MasteryBar } from "./MasteryBar";
import type { MasteryView } from "@/lib/mastery/view";
import { cn } from "@/lib/utils";

export type MasteryBarItem = {
  skillId: string;
  name: string;
  value: number;
  view?: MasteryView;
};

type Props = {
  items: MasteryBarItem[];
  label: string;
  options?: number[];       // 0 means "All"
  defaultValue?: number;
};

export function MasteryBarList({
  items,
  label,
  options = [3, 5, 10, 0],
  defaultValue = 3,
}: Props) {
  const [count, setCount] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const visible = count === 0 ? items : items.slice(0, count);
  const displayLabel = count === 0 ? "All" : `Top ${count}`;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="label-mono">{label}</p>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex h-6 items-center gap-1.5 rounded-md border border-border-default bg-bg-inset/60 px-2 text-[11px] text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            <span>{displayLabel}</span>
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform duration-200",
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
                  role="listbox"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-1 w-24 overflow-hidden rounded-md border border-border-default bg-bg-overlay py-1 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)]"
                >
                  {options.map((opt) => {
                    const optLabel = opt === 0 ? "All" : `Top ${opt}`;
                    const active = count === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setCount(opt);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between px-2.5 py-1 text-left text-[11px] transition-colors",
                          active
                            ? "bg-bg-inset text-text-primary"
                            : "text-text-secondary hover:bg-bg-inset hover:text-text-primary"
                        )}
                      >
                        <span>{optLabel}</span>
                        {active && (
                          <span className="h-1 w-1 rounded-full bg-accent" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <GlassPanel className="divide-y divide-border-subtle py-0">
        {visible.map((item, i) => (
          <MasteryBar
            key={item.skillId}
            name={item.name}
            value={item.value}
            view={item.view}
            index={i}
          />
        ))}
      </GlassPanel>
    </div>
  );
}
