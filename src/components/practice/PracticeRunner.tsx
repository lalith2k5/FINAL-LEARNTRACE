"use client";

import { useState, useTransition } from "react";
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { cn } from "@/lib/utils";
import { saveSubmission } from "@/app/(app)/practice/[slug]/actions";
import { notify } from "@/lib/toast";
import { celebrateSkillVerified } from "@/lib/confetti";

type TestCase = { description: string; assertion: string };
type TestResult = { description: string; passed: boolean; error?: string };

type Props = {
  taskId: string;
  taskTitle: string;
  description: string;
  difficulty: number;
  starterCode: string;
  solutionHint: string | null;
  testCases: TestCase[];
  priorCode?: string | null;
};

export function PracticeRunner({
  taskId,
  taskTitle,
  description,
  difficulty,
  starterCode,
  solutionHint,
  testCases,
  priorCode,
}: Props) {
  const [code, setCode] = useState(priorCode ?? starterCode);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function runTests() {
    if (running) return;
    setRunning(true);
    setResults(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/practice/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, testCases, taskId }),
      });

      const data = await res.json();

      if (!res.ok || !data.results) {
        setErrorMsg(data.error ?? "Execution failed");
        notify.error("Execution failed", data.error ?? undefined);
        setRunning(false);
        return;
      }

      const testResults: TestResult[] = data.results;
      setResults(testResults);
      setRunning(false);

      const passedCount = testResults.filter((r) => r.passed).length;
      const totalCount = testResults.length;

      if (passedCount === totalCount) {
        notify.success(
          "All tests passed",
          `${passedCount}/${totalCount} — nice work`
        );

        // Celebrate if a skill just crossed into verified
        if (
          Array.isArray(data.newlyVerified) &&
          data.newlyVerified.length > 0
        ) {
          const names = data.newlyVerified.map(
            (s: { name: string }) => s.name
          );
          celebrateSkillVerified();
          notify.success(
            "Skill verified",
            names.join(", ") + " — theory + practical both passed"
          );
        }
      } else if (passedCount > 0) {
        notify.warn(
          "Some tests failed",
          `${passedCount}/${totalCount} passed`
        );
      } else {
        notify.error(
          "No tests passed",
          "Review the errors and try again."
        );
      }

      startTransition(async () => {
        await saveSubmission({ taskId, code, results: testResults });
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
      notify.error("Network error");
      setRunning(false);
    }
  }

  function reset() {
    setCode(starterCode);
    setResults(null);
    setErrorMsg(null);
  }

  const passedCount = results?.filter((r) => r.passed).length ?? 0;
  const total = testCases.length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0">
        <GlassPanel strong>
          <div className="flex items-center justify-between">
            <div>
              <p className="label-mono">Difficulty {difficulty}/5</p>
              <h2 className="mt-1 text-lg font-medium text-text-primary">
                {taskTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={reset} className="btn-ghost text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
              <button
                onClick={runTests}
                disabled={running}
                className={cn(
                  "btn-primary text-xs",
                  running && "cursor-not-allowed opacity-50"
                )}
              >
                {running ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Running tests...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Run tests
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border-default">
            <div className="flex items-center gap-2 border-b border-border-subtle bg-bg-inset/60 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-white/[0.03]" />
              <span className="h-2 w-2 rounded-full bg-white/[0.04]" />
              <span className="h-2 w-2 rounded-full bg-white/[0.06]" />
              <span className="ml-2 label-mono">solution.py</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              rows={16}
              className="block w-full resize-y bg-[#0A0A0C] p-4 font-mono text-[13px] leading-relaxed text-text-primary outline-none"
              style={{
                fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                tabSize: 4,
              }}
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  const start = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  const newCode =
                    code.slice(0, start) + "    " + code.slice(end);
                  setCode(newCode);
                  requestAnimationFrame(() => {
                    e.currentTarget.selectionStart =
                      e.currentTarget.selectionEnd = start + 4;
                  });
                }
              }}
            />
          </div>

          {errorMsg && (
            <div className="mt-3 rounded-lg border-l-2 border-l-white/[0.20] bg-white/[0.03] px-3 py-2">
              <p className="text-xs text-text-tertiary">{errorMsg}</p>
            </div>
          )}
        </GlassPanel>
      </div>

      <div className="min-w-0">
        <GlassPanel>
          <p className="label-mono">Task</p>
          <p className="mt-2 text-sm text-text-secondary">{description}</p>

          {solutionHint && (
            <div className="mt-4 border-t border-border-subtle pt-4">
              <button
                onClick={() => setShowHint((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-accent transition-colors hover:text-accent-hover"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {showHint ? "Hide hint" : "Show hint"}
              </button>
              <AnimatePresence>
                {showHint && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 overflow-hidden text-xs italic text-text-tertiary"
                  >
                    {solutionHint}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </GlassPanel>

        <GlassPanel className="mt-4">
          <div className="flex items-center justify-between">
            <p className="label-mono">Test cases</p>
            {results && (
              <span
                className={cn(
                  "num text-xs",
                  passedCount === total ? "text-text-primary" : "text-text-secondary"
                )}
              >
                {passedCount} / {total} passed
              </span>
            )}
          </div>

          <ul className="mt-3 space-y-2">
            {testCases.map((tc, i) => {
              const r = results?.[i];
              return (
                <li
                  key={i}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs transition-all",
                    r?.passed
                      ? "border-white/[0.12]/30 bg-white/[0.06]"
                      : r && !r.passed
                      ? "border-white/[0.08]/30 bg-white/[0.03]"
                      : "border-border-subtle bg-bg-inset/30"
                  )}
                >
                  {r?.passed ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-primary" />
                  ) : r && !r.passed ? (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                  ) : (
                    <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border border-border-default" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-text-secondary">{tc.description}</p>
                    {r && !r.passed && r.error && (
                      <p className="mt-1 truncate text-[10px] text-text-tertiary/80">
                        {r.error}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {results && passedCount === total && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-lg border border-white/[0.12]/40 bg-white/[0.06] px-3 py-2"
            >
              <p className="text-xs text-text-primary">
                ✓ All tests passed. Mastery updated.
              </p>
            </motion.div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
