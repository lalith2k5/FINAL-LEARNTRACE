import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY missing — check .env.local");
}

const ai = new GoogleGenAI({ apiKey });

const MODEL_FLASH = "gemini-3.6-flash";

/**
 * JSON-mode call with retry on 503/429.
 */
export async function callJson<T>(
  prompt: string,
  options: { system?: string; temperature?: number; maxRetries?: number } = {}
): Promise<T> {
  const { system, temperature = 0.7, maxRetries = 4 } = options;

  let attempt = 1;
  while (true) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL_FLASH,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature,
          systemInstruction: system,
        },
      });
      const text = res.text ?? "";
      return JSON.parse(text) as T;
    } catch (err: any) {
      const status = err?.status ?? 0;
      const retryable = status === 503 || status === 429 || status === 500;
      if (!retryable || attempt >= maxRetries) throw err;
      const wait = Math.min(30, 3 * 2 ** (attempt - 1));
      console.log(`   ⏳ AI retry ${attempt}/${maxRetries} after ${wait}s (status ${status})`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      attempt++;
    }
  }
}
