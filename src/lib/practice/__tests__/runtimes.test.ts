import { describe, it, expect } from "vitest";
import {
  getRuntime,
  supportedLanguages,
  DEFAULT_LANGUAGE,
  RUNTIMES,
} from "../runtimes";

describe("getRuntime", () => {
  it("returns python for null", () => {
    expect(getRuntime(null).pistonLanguage).toBe("python");
  });

  it("returns python for undefined", () => {
    expect(getRuntime(undefined).pistonLanguage).toBe("python");
  });

  it("returns python for unknown language", () => {
    expect(getRuntime("cobol").pistonLanguage).toBe("python");
  });

  it("returns javascript runtime", () => {
    const r = getRuntime("javascript");
    expect(r.pistonLanguage).toBe("javascript");
    expect(r.fileName).toBe("solution.js");
    expect(r.localCommand).toBe("node");
  });

  it("returns typescript runtime", () => {
    const r = getRuntime("typescript");
    expect(r.pistonLanguage).toBe("typescript");
    expect(r.fileName).toBe("solution.ts");
    expect(r.localCommand).toBeNull();
  });
});

describe("supportedLanguages", () => {
  it("lists python, javascript, typescript", () => {
    const langs = supportedLanguages();
    expect(langs).toContain("python");
    expect(langs).toContain("javascript");
    expect(langs).toContain("typescript");
  });

  it("default language is in the supported set", () => {
    expect(supportedLanguages()).toContain(DEFAULT_LANGUAGE);
  });
});

describe("buildRunnable", () => {
  it("python: appends assertion as a comment block", () => {
    const r = RUNTIMES.python;
    const out = r.buildRunnable("def f(): pass", "assert f() is None");
    expect(out).toContain("def f(): pass");
    expect(out).toContain("# --- test ---");
    expect(out).toContain("assert f() is None");
  });

  it("javascript: prepends assert helpers and appends assertion", () => {
    const r = RUNTIMES.javascript;
    const out = r.buildRunnable("function f() { return 1; }", "assert(f() === 1)");
    expect(out).toContain("function assert");
    expect(out).toContain("function assertEqual");
    expect(out).toContain("function f() { return 1; }");
    expect(out).toContain("// --- test ---");
    expect(out).toContain("assert(f() === 1)");
  });

  it("typescript: same shape as javascript", () => {
    const r = RUNTIMES.typescript;
    const out = r.buildRunnable("const x = 1;", "assert(x === 1)");
    expect(out).toContain("function assert");
    expect(out).toContain("const x = 1;");
    expect(out).toContain("assert(x === 1)");
  });
});
