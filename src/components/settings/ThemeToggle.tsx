"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";

type Option = "light" | "dark" | "system";

const OPTIONS: { value: Option; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch — server doesn't know the theme
  if (!mounted) {
    return (
      <div className="flex h-10 w-full max-w-sm items-center justify-between rounded-lg border border-border-default bg-bg-inset p-1">
        {OPTIONS.map((o) => (
          <div key={o.value} className="h-8 flex-1 rounded-md" />
        ))}
      </div>
    );
  }

  const active = (theme ?? "system") as Option;

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="relative flex h-10 w-full max-w-sm items-center rounded-lg border border-border-default bg-bg-inset p-1"
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = active === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => {
              setTheme(opt.value);
              notify.info(`Switched to ${opt.label.toLowerCase()} mode`);
            }}
            className={cn(
              "relative z-10 flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors duration-200",
              isActive
                ? "text-text-primary"
                : "text-text-tertiary hover:text-text-secondary"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="theme-toggle-pill"
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 34,
                }}
                className="absolute inset-0 rounded-md bg-bg-elevated shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_0_0_1px_var(--color-border-default)]"
                style={{ zIndex: -1 }}
              />
            )}
            <Icon className="h-3.5 w-3.5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
