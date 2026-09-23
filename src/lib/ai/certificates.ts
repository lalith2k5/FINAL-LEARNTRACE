import { callJson } from "./gemini";

export type CertificateInput = {
  domainName: string;
  strongSkills: string[];
  weakSkills: string[];
  attemptedCount: number;
  avgMastery: number;
};

type Certificate = {
  title: string;
  provider: string;
  url: string;
  why: string;
};

export type CertificateResponse = {
  certificates: Certificate[];
};

const SYSTEM = `You are LearnTrace's career advisor. Recommend 3 free, well-known certificates or courses
that match the learner's current level and gaps. Prefer Google, DeepLearning.AI, Coursera (audit),
Kaggle Learn, fast.ai, Microsoft Learn, HuggingFace, and official documentation tracks.

Return ONLY valid JSON:
{
  "certificates": [
    {
      "title": "Short official title",
      "provider": "Google | DeepLearning.AI | Kaggle | Microsoft | HuggingFace | fast.ai | Coursera",
      "url": "https://...",
      "why": "1 sentence explaining why this fits their level and gaps."
    }
  ]
}

Rules:
- Exactly 3 certificates.
- Use real, stable URLs (no made-up links).
- Prefer free options.
- Total length under 100 words across all "why" fields.
- Return JSON only, no fences.`;

export async function recommendCertificates(
  input: CertificateInput
): Promise<CertificateResponse> {
  const prompt = `Domain: ${input.domainName}

Learner profile:
- ${input.attemptedCount} skills attempted
- Average mastery: ${Math.round(input.avgMastery * 100)}%
- Strongest areas: ${input.strongSkills.slice(0, 5).join(", ") || "None yet"}
- Weakest areas: ${input.weakSkills.slice(0, 5).join(", ") || "None yet"}

Recommend 3 free certificates that fit.`;

  return callJson<CertificateResponse>(prompt, {
    system: SYSTEM,
    temperature: 0.5,
  });
}
