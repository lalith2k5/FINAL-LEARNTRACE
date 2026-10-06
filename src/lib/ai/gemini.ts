import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY missing — check .env.local");
}

const ai = new GoogleGenAI({ apiKey });

const GEMINI_MODEL_PRIMARY = "gemini-3.5-flash";
const GEMINI_MODEL_FALLBACK = "gemini-flash-latest";
const GEMINI_MODEL_FALLBACK_2 = "gemini-3.5-flash-lite";
const REQUEST_TIMEOUT_MS = 3000;

const GROQ_URL = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const OPENROUTER_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

type CallOptions = {
  system?: string;
  temperature?: number;
};

/**
 * Tier 1: Gemini. Tries 3 models in order on transient failures.
 */
async function callGeminiJson<T>(
  prompt: string,
  options: CallOptions
): Promise<T> {
  const { system, temperature = 0.7 } = options;
  const models = [
    GEMINI_MODEL_PRIMARY,
    GEMINI_MODEL_FALLBACK,
    GEMINI_MODEL_FALLBACK_2,
  ];

  let lastErr: unknown;
  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
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
      const status = err?.status ?? (err?.name === "AbortError" ? 503 : 0);
      const transient = status === 503 || status === 500;
      if (!transient) throw err;
      const label = err?.name === "AbortError" ? "timeout" : status;
      console.log(`   ⏭  ${model} → ${label}, trying next...`);
    }
  }
  throw lastErr;
}

/**
 * Generic OpenAI-compatible chat completions call.
 * Works for Groq, OpenRouter, Cerebras, and many others.
 */
async function callOpenAICompatible<T>(args: {
  baseUrl: string;
  apiKey: string;
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  extraHeaders?: Record<string, string>;
}): Promise<T> {
  const {
    baseUrl,
    apiKey,
    model,
    prompt,
    system,
    temperature = 0.7,
    extraHeaders,
  } = args;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(extraHeaders ?? {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system ?? "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
        temperature,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 160)}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    return JSON.parse(content) as T;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Multi-provider cascade. Callers import this — the fallback order is
 * transparent to them.
 *
 *   1. Gemini (3 models)
 *   2. Groq (if GROQ_API_KEY is set)
 *   3. OpenRouter (if OPENROUTER_API_KEY is set)
 */
export async function callJson<T>(
  prompt: string,
  options: CallOptions = {}
): Promise<T> {
  const errors: string[] = [];

  try {
    return await callGeminiJson<T>(prompt, options);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`gemini: ${msg}`);
    console.log(`   ⏭  Gemini cascade exhausted → trying Groq`);
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const out = await callOpenAICompatible<T>({
        baseUrl: GROQ_URL,
        apiKey: groqKey,
        model: GROQ_MODEL,
        prompt,
        system: options.system,
        temperature: options.temperature,
      });
      console.log(`   ✓  Groq succeeded (${GROQ_MODEL})`);
      return out;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`groq: ${msg}`);
      console.log(`   ⏭  Groq → ${msg}`);
    }
  }

  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    try {
      const out = await callOpenAICompatible<T>({
        baseUrl: OPENROUTER_URL,
        apiKey: orKey,
        model: OPENROUTER_MODEL,
        prompt,
        system: options.system,
        temperature: options.temperature,
        extraHeaders: {
          "HTTP-Referer": process.env.NEXTAUTH_URL ?? "https://learntrace.app",
          "X-Title": "LearnTrace",
        },
      });
      console.log(`   ✓  OpenRouter succeeded (${OPENROUTER_MODEL})`);
      return out;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`openrouter: ${msg}`);
      console.log(`   ⏭  OpenRouter → ${msg}`);
    }
  }

  throw new Error(`All AI providers exhausted: ${errors.join(" | ")}`);
}
