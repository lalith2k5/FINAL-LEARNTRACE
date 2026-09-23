import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserApi } from "@/lib/user";
import { getSkillEvidence } from "@/lib/mastery/evidence";
import { prisma } from "@/lib/db";

const Schema = z.object({
  code: z.string(),
  testCases: z.array(
    z.object({
      description: z.string(),
      assertion: z.string(),
    })
  ),
  taskId: z.string().optional(),
});

type TestResult = {
  description: string;
  passed: boolean;
  error?: string;
};

/**
 * Try Piston first (public, works anywhere). Fall back to local Python
 * subprocess if Piston is unreachable (dev-only safety).
 */

async function detectNewlyVerifiedSkills(
  userId: string,
  taskId: string | undefined,
  justSubmitted: { passed: number; total: number }[]
): Promise<{ id: string; name: string }[]> {
  if (!taskId) return [];
  // Get the skills linked to this task
  const taskSkills = await prisma.practicalTaskSkill.findMany({
    where: { taskId },
    include: { skill: true },
  });
  if (taskSkills.length === 0) return [];

  const totalPassed = justSubmitted.reduce((a, r) => a + r.passed, 0);
  const totalTests = justSubmitted.reduce((a, r) => a + r.total, 0);
  if (totalTests === 0) return [];
  const currentRate = totalPassed / totalTests;

  // For each skill, is it currently verified AND was it recently just-crossed?
  const newly: { id: string; name: string }[] = [];
  for (const ts of taskSkills) {
    const ev = await getSkillEvidence(userId, ts.skillId);
    // Currently verified?
    if (!ev.verified) continue;

    // Compute prior state: did we just cross? If the submission is a full
    // pass (100%) and the prior state on either axis was below the threshold,
    // this is a "just crossed" moment. To know the prior state, we'd query
    // historical submissions — but simplest: use the current rate to see
    // if this submission was the one that pushed practical over 0.75.
    const priorSubmissions = await prisma.practicalSubmission.findMany({
      where: { userId, taskId },
      orderBy: { createdAt: "desc" },
      take: 2,
    });
    // If the prior submission (before the current one just persisted) did not
    // have passedAll, but the current one does — we likely just crossed.
    // But since the current one is already persisted, the "prior" is [0].
    const prior = priorSubmissions[1]; // index 0 = current
    const priorVerifiedOnThisTask = prior?.passedAll ?? false;
    if (!priorVerifiedOnThisTask) {
      newly.push({ id: ts.skill.id, name: ts.skill.name });
    }
  }
  return newly;
}

export async function POST(req: Request) {
  const user = await requireUserApi();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { code, testCases, taskId } = parsed.data;

  // Try Piston first
  try {
    const results = await runOnPiston(code, testCases);
    if (results) {
      const newlyVerified = await detectNewlyVerifiedSkills(
        user.id,
        taskId,
        results.map((r) => ({ passed: r.passed ? 1 : 0, total: 1 }))
      );
      return NextResponse.json({ results, source: "piston", newlyVerified });
    }
  } catch (err) {
    console.warn("Piston failed:", err instanceof Error ? err.message : err);
  }

  // Fall back to local Python
  try {
    const results = await runLocal(code, testCases);
    const newlyVerified = await detectNewlyVerifiedSkills(
      user.id,
      taskId,
      results.map((r) => ({ passed: r.passed ? 1 : 0, total: 1 }))
    );
    return NextResponse.json({ results, source: "local", newlyVerified });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "Could not execute code. Try again or check your connection. " +
          (err instanceof Error ? err.message : ""),
      },
      { status: 500 }
    );
  }
}

// ---------- Piston executor ----------

async function runOnPiston(
  code: string,
  testCases: { description: string; assertion: string }[]
): Promise<TestResult[] | null> {
  const results: TestResult[] = [];

  for (const tc of testCases) {
    const fullCode = `${code}\n\n# --- test ---\n${tc.assertion}\n`;

    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "python",
        version: "3.10.0",
        files: [{ name: "main.py", content: fullCode }],
        stdin: "",
        run_timeout: 3000,
      }),
      // Hard client-side timeout so we don't hang if Piston stalls
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Piston returned ${res.status}`);
    }

    const data = await res.json();
    const exitCode = data?.run?.code ?? 1;

    if (exitCode === 0) {
      results.push({ description: tc.description, passed: true });
    } else {
      const stderr: string = data?.run?.stderr ?? "Test failed";
      const short = shortenPythonError(stderr);
      results.push({
        description: tc.description,
        passed: false,
        error: short,
      });
    }
  }

  return results;
}

// ---------- Local executor (dev fallback) ----------

async function runLocal(
  code: string,
  testCases: { description: string; assertion: string }[]
): Promise<TestResult[]> {
  const { spawn } = await import("node:child_process");

  const runOne = (fullCode: string): Promise<{ code: number; stderr: string }> => {
    return new Promise((resolve) => {
      const proc = spawn("python3", ["-I", "-c", fullCode], {
        timeout: 5000,
      });
      let stderr = "";
      proc.stderr.on("data", (d) => {
        stderr += d.toString();
      });
      proc.on("close", (exitCode) => {
        resolve({ code: exitCode ?? 1, stderr });
      });
      proc.on("error", () => {
        resolve({ code: 1, stderr: "Python not available locally" });
      });
    });
  };

  const results: TestResult[] = [];
  for (const tc of testCases) {
    const fullCode = `${code}\n\n# --- test ---\n${tc.assertion}\n`;
    const { code: exitCode, stderr } = await runOne(fullCode);
    if (exitCode === 0) {
      results.push({ description: tc.description, passed: true });
    } else {
      results.push({
        description: tc.description,
        passed: false,
        error: shortenPythonError(stderr),
      });
    }
  }
  return results;
}

// ---------- Helpers ----------

function shortenPythonError(stderr: string): string {
  const lines = stderr
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  // Prefer a line with AssertionError or Error:
  const errLine =
    lines.find((l) => l.includes("AssertionError")) ??
    lines.find((l) => l.includes("Error")) ??
    lines[lines.length - 1] ??
    "Test failed";
  return errLine.slice(0, 160);
}
