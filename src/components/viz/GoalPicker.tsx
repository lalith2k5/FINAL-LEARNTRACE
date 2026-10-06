"use client";

import { useState, useTransition } from "react";
import { Check, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { setDomainGoals } from "@/app/(app)/domains/actions";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

type Skill = { id: string; name: string; difficulty: number };

type Props = {
  domainId: string;
  domainName: string;
  skills: Skill[];
  initialGoalIds: string[];
};

const MAX_GOALS = 3;

export function GoalPicker({
  domainId,
  domainName,
  skills,
  initialGoalIds,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialGoalIds)
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(skillId: string) {
    setError(null);
    const next = new Set(selected);
    if (next.has(skillId)) {
      next.delete(skillId);
    } else {
      if (next.size >= MAX_GOALS) {
        setError(`Pick at most ${MAX_GOALS} goal skills.`);
        return;
      }
      next.add(skillId);
    }
    setSelected(next);
  }

  function save() {
    startTransition(async () => {
      const res = await setDomainGoals(domainId, Array.from(selected));
      if (!res.ok) {
        setError(res.error ?? "Save failed.");
        notify.error("Couldn't save goals");
        return;
      }
      notify.success(
        selected.size === 0
          ? "Goals cleared — using default"
          : `Saved ${selected.size} goal${selected.size === 1 ? "" : "s"}`
      );
    });
  }

  const dirty =
    selected.size !== initialGoalIds.length ||
    Array.from(selected).some((id) => !initialGoalIds.includes(id));

  return (
    <GlassPanel glow>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-accent" />
            <p className="label-mono text-accent">Goal skills</p>
          </div>
          <p className="mt-1 text-sm font-medium text-text-primary">
            What do you want to be able to do in {domainName}?
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            Pick up to {MAX_GOALS}. LearnTrace prioritizes gaps that block
            these skills. Empty = auto-pick the 3 hardest.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="num text-lg font-semibold text-text-primary">
            {selected.size}
          </p>
          <p className="label-mono">selected</p>
        </div>
      </div>

      <div className="mt-4 max-h-[280px] overflow-y-auto rounded-lg border border-border-subtle bg-bg-inset/40 p-2">
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
                    ? "border-accent bg-accent/10 text-text-primary shadow-[0_0_0_1px_rgba(24,119,242,0.3)]"
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

      <div className="mt-4 flex items-center justify-end gap-3">
        {dirty && (
          <span className="text-[10px] text-text-quaternary">
            Unsaved changes
          </span>
        )}
        <button
          onClick={save}
          disabled={!dirty || isPending}
          className={cn(
            "btn-primary text-xs",
            (!dirty || isPending) && "cursor-not-allowed opacity-40"
          )}
        >
          {isPending ? "Saving..." : "Save goals"}
        </button>
      </div>
    </GlassPanel>
  );
}
