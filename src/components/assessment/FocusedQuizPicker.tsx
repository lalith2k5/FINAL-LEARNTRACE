"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { cn } from "@/lib/utils";
import { startAssessment } from "@/app/(app)/assessment/actions";

type Skill = {
  id: string;
  name: string;
  difficulty: number;
};

type Props = {
  skills: Skill[];
};

const MAX_SKILLS = 3;

export function FocusedQuizPicker({ skills }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(skillId: string) {
    setError(null);
    const next = new Set(selected);
    if (next.has(skillId)) {
      next.delete(skillId);
    } else {
      if (next.size >= MAX_SKILLS) {
        setError(`Pick at most ${MAX_SKILLS} skills for a focused quiz.`);
        return;
      }
      next.add(skillId);
    }
    setSelected(next);
  }

  function start() {
    if (selected.size === 0) return;
    startTransition(async () => {
      await startAssessment(Array.from(selected));
    });
  }

  const count = selected.size;
  const totalQuestions = count * 5;

  return (
    <GlassPanel className="flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="label-mono text-text-tertiary">Mode 2</span>
          </div>
          <p className="mt-3 text-lg font-medium text-text-primary">
            Focused quiz
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Pick 1–{MAX_SKILLS} skills. Get up to 5 questions per skill.
          </p>
        </div>
        <div className="text-right">
          <p className="num text-lg font-semibold text-text-primary">
            {count} / {MAX_SKILLS}
          </p>
          <p className="label-mono">selected</p>
        </div>
      </div>

      {/* Skill grid */}
      <div className="mt-4 max-h-[320px] overflow-y-auto rounded-lg border border-border-subtle bg-bg-inset/40 p-2">
        <div className="grid grid-cols-1 gap-1">
          {skills.map((s) => {
            const isOn = selected.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-xs transition-all",
                  isOn
                    ? "border-accent bg-accent/10 text-text-primary shadow-[0_0_0_1px_rgba(24, 119, 242, 0.3)]"
                    : "border-transparent text-text-secondary hover:border-border-default hover:bg-bg-inset/60 hover:text-text-primary"
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    isOn
                      ? "border-accent bg-accent text-white"
                      : "border-border-default"
                  )}
                >
                  {isOn && <Check className="h-2.5 w-2.5" />}
                </span>
                <span className="truncate">{s.name}</span>
                <span className="ml-auto shrink-0 text-[10px] text-text-quaternary">
                  D{s.difficulty}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-xs text-text-secondary"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-text-tertiary">
          {count === 0
            ? "Select at least one skill to begin."
            : `~${totalQuestions} questions in this session`}
        </p>
        <button
          onClick={start}
          disabled={count === 0 || isPending}
          className={cn(
            "btn-primary text-xs",
            (count === 0 || isPending) && "cursor-not-allowed opacity-40"
          )}
        >
          {isPending ? "Starting..." : "Start focused quiz →"}
        </button>
      </div>
    </GlassPanel>
  );
}
