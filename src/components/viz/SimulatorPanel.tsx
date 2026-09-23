"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { runSimulation } from "@/app/(app)/simulator/actions";
import type { SimulateResult } from "@/lib/mastery/simulate";
import { cn } from "@/lib/utils";

type SkillOption = {
  id: string;
  name: string;
  mastery: number;
  difficulty: number;
};

type Props = {
  skills: SkillOption[];
};

export function SimulatorPanel({ skills }: Props) {
  const [selectedId, setSelectedId] = useState<string>(skills[0]?.id ?? "");
  const [mode, setMode] = useState<"skip" | "improve">("skip");
  const [improveTo, setImproveTo] = useState<number>(0.9);
  const [result, setResult] = useState<SimulateResult | null>(null);
  const [skillNames, setSkillNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected = skills.find((s) => s.id === selectedId);

  function run() {
    setError(null);
    startTransition(async () => {
      const res = await runSimulation({
        skillId: selectedId,
        mode,
        targetValue: mode === "improve" ? improveTo : undefined,
      });
      if (!res.ok) {
        setError(res.error);
        setResult(null);
        return;
      }
      setResult(res.result);
      setSkillNames(res.skillNames);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* Controls */}
      <GlassPanel strong className="sticky top-4 self-start">
        <p className="label-mono">Scenario</p>

        {/* Skill picker */}
        <div className="mt-4">
          <label className="label-mono">Target skill</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border-default bg-bg-inset px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
          >
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {Math.round(s.mastery * 100)}%
              </option>
            ))}
          </select>
          {selected && (
            <p className="mt-2 text-xs text-text-tertiary">
              Difficulty {selected.difficulty}/5 · current mastery{" "}
              {Math.round(selected.mastery * 100)}%
            </p>
          )}
        </div>

        {/* Mode */}
        <div className="mt-5">
          <label className="label-mono">What if you…</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("skip")}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition-all",
                mode === "skip"
                  ? "border-white/[0.08]/50 bg-white/[0.03] text-text-tertiary"
                  : "border-border-default bg-bg-inset/40 text-text-secondary hover:border-border-strong"
              )}
            >
              Skip it entirely
            </button>
            <button
              onClick={() => setMode("improve")}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition-all",
                mode === "improve"
                  ? "border-white/[0.12]/50 bg-white/[0.06] text-text-primary"
                  : "border-border-default bg-bg-inset/40 text-text-secondary hover:border-border-strong"
              )}
            >
              Master it
            </button>
          </div>
        </div>

        {/* Improve slider */}
        {mode === "improve" && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label className="label-mono">Improve to</label>
              <span className="num text-sm text-text-primary">
                {Math.round(improveTo * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1}
              step={0.05}
              value={improveTo}
              onChange={(e) => setImproveTo(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#1877F2]"
            />
          </div>
        )}

        <button
          onClick={run}
          disabled={isPending || !selectedId}
          className={cn(
            "btn-primary mt-6 w-full justify-center",
            (isPending || !selectedId) && "cursor-not-allowed opacity-50"
          )}
        >
          {isPending ? "Simulating..." : "Run simulation →"}
        </button>

        {error && (
          <p className="mt-3 text-xs text-text-tertiary">{error}</p>
        )}
      </GlassPanel>

      {/* Results */}
      <div className="min-w-0">
        {!result ? (
          <GlassPanel className="p-8 text-center text-sm text-text-tertiary">
            Pick a skill and scenario, then run the simulation to see the
            downstream impact on your goal readiness.
          </GlassPanel>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Readiness delta */}
            <GlassPanel strong>
              <p className="label-mono">Goal readiness</p>
              <div className="mt-3 flex items-end gap-4">
                <div>
                  <p className="num text-4xl font-semibold text-text-primary">
                    {Math.round(result.goalReadinessBefore * 100)}%
                  </p>
                  <p className="label-mono mt-1">before</p>
                </div>
                <div className="pb-6 text-text-quaternary">→</div>
                <div>
                  <p
                    className={cn(
                      "num text-4xl font-semibold",
                      result.readinessDelta > 0
                        ? "text-text-primary"
                        : result.readinessDelta < 0
                        ? "text-text-tertiary"
                        : "text-text-primary"
                    )}
                  >
                    {Math.round(result.goalReadinessAfter * 100)}%
                  </p>
                  <p className="label-mono mt-1">after</p>
                </div>
                <div className="ml-auto text-right">
                  <p
                    className={cn(
                      "num text-2xl font-semibold",
                      result.readinessDelta > 0
                        ? "text-text-primary"
                        : result.readinessDelta < 0
                        ? "text-text-tertiary"
                        : "text-text-secondary"
                    )}
                  >
                    {result.readinessDelta > 0 ? "+" : ""}
                    {Math.round(result.readinessDelta * 100)} pts
                  </p>
                  <p className="label-mono mt-1">change</p>
                </div>
              </div>
            </GlassPanel>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <GlassPanel>
                <p className="label-mono">Affected</p>
                <p className="num mt-1 text-xl font-semibold text-text-primary">
                  {result.summary.skillsAffected}
                </p>
              </GlassPanel>
              <GlassPanel>
                <p className="label-mono">Regressed</p>
                <p className="num mt-1 text-xl font-semibold text-text-tertiary">
                  {result.summary.skillsRegressed}
                </p>
              </GlassPanel>
              <GlassPanel>
                <p className="label-mono">Improved</p>
                <p className="num mt-1 text-xl font-semibold text-text-primary">
                  {result.summary.skillsImproved}
                </p>
              </GlassPanel>
              <GlassPanel>
                <p className="label-mono">Goal skills hit</p>
                <p className="num mt-1 text-xl font-semibold text-accent">
                  {result.summary.goalSkillsAffected}
                </p>
              </GlassPanel>
            </div>

            {/* Affected skills list */}
            <GlassPanel>
              <p className="label-mono mb-3">Downstream effects</p>
              <div className="space-y-2">
                {result.affected.slice(0, 12).map((a) => {
                  const beforePct = Math.round(a.before * 100);
                  const afterPct = Math.round(a.after * 100);
                  const negative = a.delta < 0;
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border-subtle bg-bg-inset/40 px-3 py-2"
                    >
                      <p className="truncate text-sm text-text-primary">
                        {skillNames[a.id] ?? a.id}
                      </p>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="num text-xs text-text-tertiary">
                          {beforePct}%
                        </span>
                        <span className="text-text-quaternary">→</span>
                        <span
                          className={cn(
                            "num text-xs font-medium",
                            negative ? "text-text-tertiary" : "text-text-primary"
                          )}
                        >
                          {afterPct}%
                        </span>
                        <span
                          className={cn(
                            "num w-14 text-right text-xs",
                            negative ? "text-text-tertiary" : "text-text-primary"
                          )}
                        >
                          {a.delta > 0 ? "+" : ""}
                          {(a.delta * 100).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </div>
    </div>
  );
}
