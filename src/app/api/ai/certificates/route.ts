import { NextResponse } from "next/server";
import { z } from "zod";
import { recommendCertificates } from "@/lib/ai/certificates";

const Schema = z.object({
  domainName: z.string(),
  strongSkills: z.array(z.string()),
  weakSkills: z.array(z.string()),
  attemptedCount: z.number(),
  avgMastery: z.number(),
});

const cache = new Map<string, any>();

// Hardcoded fallback used when Gemini is rate-limited.
function fallbackCerts(weakSkills: string[]) {
  const focus =
    weakSkills.slice(0, 3).join(", ") || "core ML foundations";
  return {
    certificates: [
      {
        title: "Machine Learning Crash Course",
        provider: "Google",
        url: "https://developers.google.com/machine-learning/crash-course",
        why: `Free Google course covering ML fundamentals — strong match for ${focus}.`,
      },
      {
        title: "Kaggle Learn — Intro to Machine Learning",
        provider: "Kaggle",
        url: "https://www.kaggle.com/learn/intro-to-machine-learning",
        why: "Hands-on, notebook-based intro to core ML workflows. Free and practical.",
      },
      {
        title: "DeepLearning.AI — Machine Learning Specialization (audit)",
        provider: "DeepLearning.AI",
        url: "https://www.coursera.org/specializations/machine-learning-introduction",
        why: "Audit for free. Covers regression, classification, and evaluation end-to-end.",
      },
    ],
  };
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const k = JSON.stringify({
    d: parsed.data.domainName,
    s: parsed.data.strongSkills.slice(0, 3),
    w: parsed.data.weakSkills.slice(0, 3),
    a: Math.round(parsed.data.avgMastery * 10),
  });

  if (cache.has(k)) return NextResponse.json({ ...cache.get(k), cached: true });

  try {
    const result = await recommendCertificates(parsed.data);
    if (
      !result ||
      !Array.isArray(result.certificates) ||
      result.certificates.length === 0
    ) {
      throw new Error("Empty response from AI");
    }
    cache.set(k, result);
    return NextResponse.json({ ...result, cached: false });
  } catch (err: any) {
    console.error(
      "Certificates AI failed, using fallback:",
      err?.message ?? err
    );
    const fb = fallbackCerts(parsed.data.weakSkills);
    return NextResponse.json({ ...fb, fallback: true });
  }
}