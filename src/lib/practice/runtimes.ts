export type Runtime = {
  pistonLanguage: string;
  pistonVersion: string;
  fileName: string;
  displayName: string;
  localCommand: string | null;
  buildRunnable: (userCode: string, assertion: string) => string;
};

const JS_HEADER = `function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}
function assertEqual(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(msg || "expected " + e + ", got " + a);
}
`;

export const RUNTIMES: Record<string, Runtime> = {
  python: {
    pistonLanguage: "python",
    pistonVersion: "3.10.0",
    fileName: "solution.py",
    displayName: "Python 3.10",
    localCommand: "python3",
    buildRunnable: (code, assertion) =>
      `${code}\n\n# --- test ---\n${assertion}\n`,
  },
  javascript: {
    pistonLanguage: "javascript",
    pistonVersion: "18.15.0",
    fileName: "solution.js",
    displayName: "Node.js 18",
    localCommand: "node",
    buildRunnable: (code, assertion) =>
      `${JS_HEADER}\n${code}\n\n// --- test ---\n${assertion}\n`,
  },
  typescript: {
    pistonLanguage: "typescript",
    pistonVersion: "5.0.3",
    fileName: "solution.ts",
    displayName: "TypeScript 5",
    localCommand: null,
    buildRunnable: (code, assertion) =>
      `${JS_HEADER}\n${code}\n\n// --- test ---\n${assertion}\n`,
  },
};

export const DEFAULT_LANGUAGE = "python";

export function getRuntime(language: string | null | undefined): Runtime {
  if (!language) return RUNTIMES[DEFAULT_LANGUAGE];
  return RUNTIMES[language] ?? RUNTIMES[DEFAULT_LANGUAGE];
}

export function supportedLanguages(): string[] {
  return Object.keys(RUNTIMES);
}
