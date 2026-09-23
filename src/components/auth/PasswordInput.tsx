"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  showStrength?: boolean;
  id?: string;
  label?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  function PasswordInput(
    {
      value,
      onChange,
      placeholder = "Password",
      autoComplete = "current-password",
      required = true,
      minLength,
      showStrength = false,
      id = "password",
      label = "Password",
    },
    ref
  ) {
    const [visible, setVisible] = useState(false);

    const strength = computeStrength(value);
    const strengthLabel = ["Weak", "Fair", "Good", "Strong"][strength];

    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor={id} className="text-xs font-medium text-white/60">
            {label}
          </label>
          {showStrength && value.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.span
                key={strengthLabel}
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.15em]",
                  strength === 0 && "text-rose-400",
                  strength === 1 && "text-amber-400",
                  strength === 2 && "text-sky-400",
                  strength === 3 && "text-emerald-400"
                )}
              >
                {strengthLabel}
              </motion.span>
            </AnimatePresence>
          )}
        </div>

        <div className="group relative">
          <input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            minLength={minLength}
            className={cn(
              "w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 pr-11 text-sm text-white outline-none",
              "transition-all duration-200",
              "placeholder:text-white/20",
              "hover:border-white/[0.14]",
              "focus:border-accent/60 focus:bg-white/[0.04] focus:ring-4 focus:ring-accent/10"
            )}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/30 transition-colors hover:text-white/60"
          >
            {visible ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Strength meter */}
        {showStrength && value.length > 0 && (
          <div className="mt-2.5 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{
                  opacity: 1,
                  scaleX: 1,
                }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors duration-300",
                  i <= strength
                    ? strength === 0
                      ? "bg-rose-400"
                      : strength === 1
                      ? "bg-amber-400"
                      : strength === 2
                      ? "bg-sky-400"
                      : "bg-emerald-400"
                    : "bg-white/[0.06]"
                )}
              />
            ))}
          </div>
        )}

        {showStrength && value.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {[
              { met: value.length >= 8, label: "8+ characters" },
              { met: /[A-Z]/.test(value), label: "One uppercase letter" },
              { met: /[0-9]/.test(value), label: "One number" },
            ].map((rule) => (
              <div
                key={rule.label}
                className={cn(
                  "flex items-center gap-2 text-[11px] transition-colors",
                  rule.met ? "text-emerald-400/80" : "text-white/30"
                )}
              >
                <span
                  className={cn(
                    "flex h-3 w-3 items-center justify-center rounded-full transition-colors",
                    rule.met ? "bg-emerald-500/20" : "bg-white/[0.04]"
                  )}
                >
                  {rule.met && <Check className="h-2 w-2" />}
                </span>
                {rule.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

function computeStrength(pw: string): 0 | 1 | 2 | 3 {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length < 8) return 0;
  return Math.min(3, Math.max(0, score - 1)) as 0 | 1 | 2 | 3;
}
