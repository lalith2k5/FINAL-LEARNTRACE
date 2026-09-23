import { callJson } from "./gemini";

export type ExplanationInput = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  skillName: string;
  currentMastery: number;  // 0..1
  confidence: number;      // 1..5
  difficulty: number;      // 1..5
};

export type Explanation = {
  whatWentWrong: string;
  relatedConcept: string;
  remediation: string;
  encouragement: string;
};

const SYSTEM = `You are LearnTrace's AI tutor. A learner answered a multiple-choice question incorrectly.
Your job is to help them understand — not to lecture. Be specific, kind, and concise.

Return ONLY valid JSON with this exact shape:
{
  "whatWentWrong": "1-2 sentences explaining the likely reasoning error.",
  "relatedConcept": "The specific concept or sub-skill to review.",
  "remediation": "One concrete next step — a definition, example, or pointer.",
  "encouragement": "A short, genuine, non-generic message."
}

Rules:
- Total length under 130 words across all 4 fields.
- Never say "Great job!" or generic praise.
- Never guess if the question is unclear — say what's ambiguous.
- Use plain language, no markdown.
- Return JSON only, no fences.`;

export async function explainWrongAnswer(
  input: ExplanationInput
): Promise<Explanation> {
  const masteryPct = Math.round(input.currentMastery * 100);

  const prompt = `Question: ${input.question}

Learner answered: ${input.userAnswer}
Correct answer: ${input.correctAnswer}

Context:
- Skill being tested: ${input.skillName}
- Learner's current mastery in this skill: ${masteryPct}%
- Confidence when answering (1=guessing, 5=certain): ${input.confidence}
- Question difficulty (1-5): ${input.difficulty}

Generate the JSON response.`;

  return callJson<Explanation>(prompt, { system: SYSTEM, temperature: 0.6 });
}
