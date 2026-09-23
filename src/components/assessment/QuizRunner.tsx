"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { MasteryRing } from "@/components/viz/MasteryRing";
import type { PublicQuestion } from "@/types/assessment";
import { cn } from "@/lib/utils";

type Props = {
  sessionId: string;
  sessionKind: string;
};

type AdaptiveInfo = {
  targetDifficulty: number;
  reason: string;
};

type ProgressInfo = {
  served: number;
  total: number;
};

type NextResponse =
  | { done: true; reason: string }
  | {
      done: false;
      question: PublicQuestion;
      adaptive: AdaptiveInfo;
      progress: ProgressInfo;
    };

type AiExplanation = {
  whatWentWrong: string;
  relatedConcept: string;
  remediation: string;
  encouragement: string;
  loading?: boolean;
  fallback?: boolean;
};

type Comparison = {
  skillId: string;
  before: number;
  after: number;
  delta: number;
};

/**
 * Parse session kind.
 *   "diagnostic"                            → standard
 *   "focused"                               → focused quiz
 *   "reassessment:<skillId>:<priorMastery>" → reassessment
 */
function parseKind(kind: string): {
  mode: "reassessment" | "diagnostic" | "focused";
  skillId?: string;
  prior?: number;
} {
  if (kind.startsWith("reassessment:")) {
    const parts = kind.split(":");
    return {
      mode: "reassessment",
      skillId: parts[1],
      prior: parseFloat(parts[2]) || 0,
    };
  }
  if (kind === "focused") return { mode: "focused" };
  return { mode: "diagnostic" };
}

export function QuizRunner({ sessionId, sessionKind }: Props) {
  const router = useRouter();
  const kind = parseKind(sessionKind);

  const [current, setCurrent] = useState<PublicQuestion | null>(null);
  const [adaptive, setAdaptive] = useState<AdaptiveInfo | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [loadingNext, setLoadingNext] = useState(true);
  const [done, setDone] = useState(false);

  const [selected, setSelected] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    explanation?: string;
    correctOptionId?: string;
  } | null>(null);
  const [aiExplanation, setAiExplanation] = useState<AiExplanation | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  // Reassessment comparison — fetched when done
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  const startTime = useRef<number>(Date.now());

  const fetchNext = useCallback(async () => {
    setLoadingNext(true);
    setSelected(null);
    setConfidence(null);
    setFeedback(null);
    setAiExplanation(null);

    try {
      const res = await fetch("/api/assessment/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data: NextResponse = await res.json();

      if (data.done) {
        setDone(true);
        setLoadingNext(false);

        // If reassessment, fetch the new mastery for comparison
        if (kind.mode === "reassessment" && kind.skillId) {
          setComparisonLoading(true);
          try {
            const mRes = await fetch("/api/mastery/skill", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ skillId: kind.skillId }),
            });
            const mData = await mRes.json();
            const before = kind.prior ?? 0;
            const after = mData.effective ?? 0;
            setComparison({
              skillId: kind.skillId,
              before,
              after,
              delta: after - before,
            });
          } catch {
            // ignore — comparison is optional
          } finally {
            setComparisonLoading(false);
          }
        }
        return;
      }

      setCurrent(data.question);
      setAdaptive(data.adaptive);
      setProgress(data.progress);
      startTime.current = Date.now();
    } catch {
      setCurrent(null);
    } finally {
      setLoadingNext(false);
    }
  }, [sessionId, kind.mode, kind.skillId, kind.prior]);

  useEffect(() => {
    fetchNext();
  }, [fetchNext]);

  async function submit() {
    if (!current || !selected || !confidence || submitting) return;
    setSubmitting(true);
    const timeTakenMs = Date.now() - startTime.current;

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: current.id,
          selectedOptionId: selected,
          timeTakenMs,
          confidence,
        }),
      });
      const data = await res.json();
      setFeedback({
        correct: data.correct,
        explanation: data.explanation ?? undefined,
        correctOptionId: data.correctId,
      });

      if (!data.correct) {
        setShakeKey((k) => k + 1);
      }

      if (!data.correct) {
        setAiExplanation({
          whatWentWrong: "",
          relatedConcept: "",
          remediation: "",
          encouragement: "",
          loading: true,
        });
        try {
          const aiRes = await fetch("/api/ai/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: data.questionText,
              userAnswer: data.userAnswer,
              correctAnswer: data.correctAnswer,
              skillName: data.skillName,
              currentMastery: data.currentMastery,
              confidence,
              difficulty: data.difficulty,
            }),
          });
          const aiData = await aiRes.json();
          setAiExplanation({
            whatWentWrong: aiData.whatWentWrong,
            relatedConcept: aiData.relatedConcept,
            remediation: aiData.remediation,
            encouragement: aiData.encouragement,
            fallback: aiData.fallback,
          });
        } catch {
          setAiExplanation(null);
        }
      }
    } catch {
      setFeedback({ correct: false, explanation: "Network error." });
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    fetchNext();
  }

  function finish() {
    router.push("/dashboard");
  }

  // Loading state
  if (loadingNext && !current && !done) {
    return (
      <div className="mx-auto max-w-3xl">
        <GlassPanel className="p-8">
          <div className="space-y-3">
            <div className="h-3 w-1/3 animate-pulse rounded bg-bg-inset" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-bg-inset" />
            <div className="h-10 w-full animate-pulse rounded bg-bg-inset" />
            <div className="h-10 w-full animate-pulse rounded bg-bg-inset" />
          </div>
        </GlassPanel>
      </div>
    );
  }

  // Session complete
  if (done) {
    const isReassessment = kind.mode === "reassessment";

    return (
      <div className="mx-auto max-w-3xl">
        <GlassPanel strong className="p-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-text-primary">
              {isReassessment ? "Reassessment complete" : "Session complete"}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {isReassessment
                ? "Here's how your mastery changed."
                : "You answered all questions in this session. Your mastery has been updated."}
            </p>
          </div>

          {/* Reassessment comparison */}
          {isReassessment && (
            <div className="mt-8">
              {comparisonLoading && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 animate-pulse rounded-xl bg-bg-inset" />
                  <div className="h-32 animate-pulse rounded-xl bg-bg-inset" />
                </div>
              )}

              {!comparisonLoading && comparison && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border-subtle bg-bg-inset/40 p-5 text-center">
                      <p className="label-mono">Before</p>
                      <div className="mt-3 flex justify-center">
                        <MasteryRing
                          value={comparison.before}
                          size={100}
                          stroke={8}
                        />
                      </div>
                    </div>
                    <div className="rounded-xl border border-border-subtle bg-bg-inset/40 p-5 text-center">
                      <p className="label-mono">After</p>
                      <div className="mt-3 flex justify-center">
                        <MasteryRing
                          value={comparison.after}
                          size={100}
                          stroke={8}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "mt-6 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm",
                      comparison.delta > 0.01
                        ? "border-white/[0.12]/40 bg-white/[0.06] text-text-primary"
                        : comparison.delta < -0.01
                        ? "border-white/[0.08]/40 bg-white/[0.03] text-text-tertiary"
                        : "border-border-default bg-bg-inset/40 text-text-secondary"
                    )}
                  >
                    {comparison.delta > 0.01 && (
                      <TrendingUp className="h-4 w-4" />
                    )}
                    {comparison.delta < -0.01 && (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(comparison.delta) <= 0.01 && (
                      <Minus className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {comparison.delta > 0 ? "+" : ""}
                      {Math.round(comparison.delta * 100)} points
                    </span>
                    <span className="text-xs opacity-80">
                      {comparison.delta > 0.01
                        ? "Mastery increased"
                        : comparison.delta < -0.01
                        ? "Mastery dropped — review the materials again"
                        : "No change — keep practicing"}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">
            <button onClick={finish} className="btn-primary">
              Back to dashboard →
            </button>
            {isReassessment && (
              <button onClick={() => router.refresh()} className="btn-ghost">
                Refresh
              </button>
            )}
          </div>
        </GlassPanel>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-3xl">
        <GlassPanel className="p-6 text-center text-sm text-text-tertiary">
          Could not load the next question. Please refresh the page.
        </GlassPanel>
      </div>
    );
  }

  const pct =
    progress && progress.total > 0
      ? (progress.served / progress.total) * 100
      : 0;

  const isLast = progress ? progress.served + 1 >= progress.total : false;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="label-mono">
            {kind.mode === "reassessment" ? "Reassessment · " : ""}
            Question {progress ? progress.served + 1 : "?"} /{" "}
            {progress?.total ?? "?"}
          </span>
          <span className="label-mono">
            {current.skillNames.slice(0, 2).join(" · ")}
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-bg-inset">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-cyan"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Adaptive indicator */}
      {adaptive && (
        <div className="mb-4 flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-accent">
            <Sparkles className="h-3 w-3" />
            Adaptive
            <span className="num ml-1 text-text-secondary">
              D{adaptive.targetDifficulty}
            </span>
          </span>
          <span className="text-text-tertiary">{adaptive.reason}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <GlassPanel className="p-6">
            <p className="label-mono">Difficulty {current.difficulty}/5</p>
            <h2 className="mt-2 text-xl font-medium leading-relaxed text-text-primary">
              {current.prompt}
            </h2>

            <div className="mt-6 space-y-2">
              {current.options.map((o) => {
                const isSelected = selected === o.id;
                const isDisabled = !!feedback;
                const isCorrect = feedback?.correctOptionId === o.id;
                const isWrongPick =
                  isDisabled && isSelected && feedback?.correct === false;

                return (
                  <button
                    key={o.id}
                    disabled={isDisabled}
                    onClick={() => setSelected(o.id)}
                    className={cn(
                      "relative w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors duration-200",
                      isWrongPick && "animate-lt-shake",
                      // -- Locked states after feedback (no hover, no blending) --
                      isDisabled && isCorrect &&
                        "border-emerald/40 bg-emerald/[0.06] text-text-primary shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_0_16px_-8px_rgba(16,185,129,0.3)]",
                      isDisabled && isWrongPick &&
                        "border-rose/40 bg-rose/[0.06] text-text-primary shadow-[0_0_0_1px_rgba(244,63,94,0.15),0_0_16px_-8px_rgba(244,63,94,0.3)]",
                      isDisabled && !isCorrect && !isWrongPick &&
                        "cursor-not-allowed border-border-subtle bg-bg-inset/30 text-text-tertiary opacity-40",
                      // -- Interactive states before feedback --
                      !isDisabled && isSelected &&
                        "border-accent bg-accent/10 text-text-primary shadow-[0_0_0_1px_rgba(244,244,245,0.3),0_0_16px_-4px_rgba(16,185,129,0.4)]",
                      !isDisabled && !isSelected &&
                        "border-border-default bg-bg-inset/40 text-text-secondary hover:border-border-strong hover:text-text-primary"
                    )}
                  >
                    <span className="num mr-3 text-xs text-text-tertiary">
                      {o.id.toUpperCase()}
                    </span>
                    {o.text}

                    {/* Status icon on the right */}
                    {isDisabled && isCorrect && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-emerald"
                        aria-hidden
                      >
                        ✓
                      </motion.span>
                    )}
                    {isWrongPick && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-rose"
                        aria-hidden
                      >
                        ✗
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>
          </GlassPanel>
        </motion.div>
      </AnimatePresence>

      {/* Confidence picker */}
      {!feedback && (
        <GlassPanel className="mt-4">
          <p className="label-mono">How confident are you?</p>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((c) => (
              <button
                key={c}
                onClick={() => setConfidence(c)}
                className={cn(
                  "h-10 flex-1 rounded-lg border text-sm transition-all",
                  confidence === c
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border-default bg-bg-inset/40 text-text-secondary hover:border-border-strong"
                )}
              >
                <span className="num">{c}</span>
                <span className="ml-1 text-xs text-text-tertiary">
                  {["Guessing", "Unsure", "Maybe", "Sure", "Certain"][c - 1]}
                </span>
              </button>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* Submit / Next */}
      <div className="mt-6 flex justify-end">
        {!feedback ? (
          <button
            onClick={submit}
            disabled={!selected || !confidence || submitting}
            className={cn(
              "btn-primary",
              (!selected || !confidence || submitting) &&
                "cursor-not-allowed opacity-40"
            )}
          >
            {submitting ? "Saving..." : "Submit answer →"}
          </button>
        ) : (
          <button onClick={next} className="btn-primary">
            {isLast ? "Finish session" : "Next question →"}
          </button>
        )}
      </div>

      {/* Feedback + AI Tutor */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-4"
        >
          <GlassPanel
            className={cn(
              "border-l-2",
              feedback.correct
                ? "border-l-emerald shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_0_24px_-8px_rgba(16,185,129,0.4)]"
                : "border-l-rose shadow-[0_0_0_1px_rgba(244,63,94,0.2),0_0_24px_-8px_rgba(244,63,94,0.4)]"
            )}
          >
            <p className="label-mono">
              {feedback.correct ? "✓ Correct" : "✗ Incorrect"}
            </p>
            {feedback.explanation && (
              <p className="mt-2 text-sm text-text-secondary">
                {feedback.explanation}
              </p>
            )}
          </GlassPanel>

          {!feedback.correct && aiExplanation && (
            <GlassPanel
              strong
              className="border-l-2 border-l-accent shadow-[0_0_0_1px_rgba(24,119,242,0.15),0_0_28px_-10px_rgba(24,119,242,0.5)]"
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_#1877F2]" />
                <p className="label-mono text-accent">AI Tutor</p>
              </div>

              {aiExplanation.loading ? (
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-bg-inset" />
                  <div className="h-3 w-full animate-pulse rounded bg-bg-inset" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-bg-inset" />
                  <p className="pt-1 text-xs text-text-tertiary">
                    Analyzing your answer...
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <p className="label-mono mb-1">What went wrong</p>
                    <p className="text-text-secondary">
                      {aiExplanation.whatWentWrong}
                    </p>
                  </div>
                  <div>
                    <p className="label-mono mb-1">Review this concept</p>
                    <p className="text-text-secondary">
                      {aiExplanation.relatedConcept}
                    </p>
                  </div>
                  <div>
                    <p className="label-mono mb-1">Next step</p>
                    <p className="text-text-secondary">
                      {aiExplanation.remediation}
                    </p>
                  </div>
                  <div className="border-t border-border-subtle pt-3">
                    <p className="text-xs italic text-text-tertiary">
                      {aiExplanation.encouragement}
                    </p>
                  </div>
                </div>
              )}
            </GlassPanel>
          )}
        </motion.div>
      )}
    </div>
  );
}
