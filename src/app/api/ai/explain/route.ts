import { NextResponse } from "next/server";
import { z } from "zod";
import { explainWrongAnswer } from "@/lib/ai/explain";

const Schema = z.object({
  question: z.string().min(1),
  userAnswer: z.string().min(1),
  correctAnswer: z.string().min(1),
  skillName: z.string().min(1),
  currentMastery: z.number().min(0).max(1),
  confidence: z.number().int().min(1).max(5),
  difficulty: z.number().int().min(1).max(5),
});

// In-memory cache (survives per dev server process)
const cache = new Map<string, any>();

function key(input: any): string {
  return [
    input.question.slice(0, 80),
    input.userAnswer,
    input.correctAnswer,
    input.skillName,
  ].join("|");
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const k = key(parsed.data);
  if (cache.has(k)) {
    return NextResponse.json({ ...cache.get(k), cached: true });
  }

  try {
    const explanation = await explainWrongAnswer(parsed.data);
    cache.set(k, explanation);
    return NextResponse.json({ ...explanation, cached: false });
  } catch (err: any) {
    console.error("AI explain failed:", err?.message ?? err);
    return NextResponse.json(
      {
        whatWentWrong: "We couldn't generate a custom explanation right now.",
        relatedConcept: parsed.data.skillName,
        remediation: "Review the core definition of this concept and try a similar question.",
        encouragement: "Wrong answers are where real learning happens.",
        fallback: true,
      },
      { status: 200 }
    );
  }
}
