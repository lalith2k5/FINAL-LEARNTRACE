import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY missing — check .env.local");
}

const ai = new GoogleGenAI({ apiKey });

const MODEL_FLASH = "gemini-3.5-flash";

/**
 * JSON-mode call with retry on 503/429.
 */
export async function callJson<T>(
  prompt: string,
  options: { system?: string; temperature?: number; maxRetries?: number } = {}
): Promise<T> {
  const { system, temperature = 0.7, maxRetries = 1 } = options;

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
      // 429 = quota. Do NOT retry — quota doesn't recover in seconds.
      const retryable = status === 503 || status === 500;
      if (!retryable || attempt >= maxRetries) throw err;
      const wait = 1000;
      console.log(`   ⏳ AI retry ${attempt}/${maxRetries} after ${wait}ms (status ${status})`);
      await new Promise((r) => setTimeout(r, wait));
      attempt++;
    }
  }
}
