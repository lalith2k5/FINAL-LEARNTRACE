import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY missing — check .env.local");
}

const ai = new GoogleGenAI({ apiKey });

const MODEL_PRIMARY = "gemini-3.5-flash";
const MODEL_FALLBACK = "gemini-flash-latest";
const MODEL_FALLBACK_2 = "gemini-3.5-flash-lite";
const REQUEST_TIMEOUT_MS = 3000;

/**
 * JSON-mode call with retry on 503/429.
 */
export async function callJson<T>(
  prompt: string,
  options: { system?: string; temperature?: number; maxRetries?: number } = {}
): Promise<T> {
  const { system, temperature = 0.7 } = options;

  // Cascade across models on transient failures. Each model runs on a
  // different capacity pool, and a 3s hard timeout prevents hanging on
  // Google's degraded endpoints.
  const models = [MODEL_PRIMARY, MODEL_FALLBACK, MODEL_FALLBACK_2];

  let lastErr: unknown;
  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );
    try {
      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature,
          systemInstruction: system,
          abortSignal: controller.signal,
        },
      });
      clearTimeout(timeout);
      const text = res.text ?? "";
      return JSON.parse(text) as T;
    } catch (err: any) {
      clearTimeout(timeout);
      lastErr = err;
      // AbortError (from our timeout) counts as transient
      const status = err?.status ?? (err?.name === "AbortError" ? 503 : 0);
      const transient = status === 503 || status === 500;
      if (!transient) throw err;
      const label = err?.name === "AbortError" ? "timeout" : status;
      console.log(`   ⏭  ${model} → ${label}, trying next...`);
    }
  }

  throw lastErr;
}
