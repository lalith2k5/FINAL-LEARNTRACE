import { callJson } from "./gemini";

export type MisconceptionInput = {
  question: string;
  selectedOptionText: string;
  correctOptionText: string;
  skillName: string;
  justification: string;
};

export type MisconceptionAnalysis = {
  category: string;
  misconception: string;
  corrective: string;
  confidence: number;
};

/**
 * Fixed category taxonomy. Keeps grouping stable across attempts —
 * the dashboard groups by (skillId, category).
 */
export const MISCONCEPTION_CATEGORIES = [
  "sign-convention",
  "formula-confusion",
  "terminology-mixup",
  "overgeneralization",
  "memorization-error",
  "order-of-operations",
  "causation-vs-correlation",
  "boundary-case",
  "unit-error",
  "misread-question",
  "unclear",
] as const;

export type MisconceptionCategory =
  (typeof MISCONCEPTION_CATEGORIES)[number];

const SYSTEM = `You are LearnTrace's misconception analyst. A learner answered a
multiple-choice question incorrectly and wrote a short explanation of their reasoning.
Your job is to identify the underlying reasoning error — not restate the wrong answer.

Return ONLY valid JSON with this exact shape:
{
  "category": "one of the allowed categories",
  "misconception": "1 sentence describing what the learner believes",
  "corrective": "1 sentence explaining the correct reasoning",
  "confidence": 0.0
}

Allowed categories (exact string, kebab-case):
- sign-convention        (plus/minus, direction, sign flips)
- formula-confusion      (wrong formula, mixing up similar formulas)
- terminology-mixup      (confusing related terms like precision/recall)
- overgeneralization     (applying a rule outside its valid scope)
- memorization-error     (recalling a fact incorrectly)
- order-of-operations    (wrong sequence of steps)
- causation-vs-correlation (assuming causation from correlation)
- boundary-case          (missing edge cases like zero, empty, max)
- unit-error             (wrong units or scale)
- misread-question       (misinterpreted what was asked)
- unclear                (reasoning text doesn't reveal the error)

Rules:
- "confidence" is a 0.0–1.0 float reflecting how sure you are of the category.
- Total length under 60 words across misconception + corrective.
- Use plain language. No markdown.
- If the justification is empty or uninformative, category MUST be "unclear".
- Return JSON only, no fences.`;

export async function analyzeMisconception(
  input: MisconceptionInput
): Promise<MisconceptionAnalysis> {
  const prompt = `Question: ${input.question}

Correct answer: ${input.correctOptionText}
Learner picked: ${input.selectedOptionText}
Skill: ${input.skillName}

Learner's reasoning:
"${input.justification}"

Classify the underlying misconception.`;

  const result = await callJson<MisconceptionAnalysis>(prompt, {
    system: SYSTEM,
    temperature: 0.3,
  });

  // Sanitize: enforce category whitelist, clamp confidence
  const category = (MISCONCEPTION_CATEGORIES as readonly string[]).includes(
    result.category
  )
    ? result.category
    : "unclear";

  const confidence =
    typeof result.confidence === "number"
      ? Math.max(0, Math.min(1, result.confidence))
      : 0.5;

  return {
    category,
    misconception: String(result.misconception ?? "").slice(0, 240),
    corrective: String(result.corrective ?? "").slice(0, 240),
    confidence,
  };
}
