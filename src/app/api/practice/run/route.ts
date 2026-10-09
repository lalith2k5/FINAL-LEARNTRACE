import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserApi } from "@/lib/user";
import { getSkillEvidence } from "@/lib/mastery/evidence";
import { prisma } from "@/lib/db";
import { getRuntime, type Runtime } from "@/lib/practice/runtimes";

const Schema = z.object({
  code: z.string(),
  language: z.string().optional(),
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

async function detectNewlyVerifiedSkills(
  userId: string,
  taskId: string | undefined,
  results: { passed: boolean }[]
): Promise<{ id: string; name: string }[]> {
  if (!taskId) return [];
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  if (total === 0) return [];

  const taskSkills = await prisma.practicalTaskSkill.findMany({
    where: { taskId },
    include: { skill: true },
  });
  if (taskSkills.length === 0) return [];

  const newly: { id: string; name: string }[] = [];
  for (const ts of taskSkills) {
    const before = await getSkillEvidence(userId, ts.skillId);
    if (before.verified) continue;

    const after = await getSkillEvidence(userId, ts.skillId, {
      taskId,
      passed,
      total,
    });
    if (after.verified) {
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
  const runtime = getRuntime(parsed.data.language);

  try {
    const results = await runOnPiston(code, testCases, runtime);
    if (results) {
      const newlyVerified = await detectNewlyVerifiedSkills(
        user.id,
        taskId,
        results
      );
      return NextResponse.json({
        results,
        source: "piston",
        language: runtime.pistonLanguage,
        newlyVerified,
      });
    }
  } catch (err) {
    console.warn(
      "Piston failed:",
      err instanceof Error ? err.message : err
    );
  }

  try {
    const results = await runLocal(code, testCases, runtime);
    const newlyVerified = await detectNewlyVerifiedSkills(
      user.id,
      taskId,
      results
    );
    return NextResponse.json({
      results,
      source: "local",
      language: runtime.pistonLanguage,
      newlyVerified,
    });
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

async function runOnPiston(
  code: string,
  testCases: { description: string; assertion: string }[],
  runtime: Runtime
): Promise<TestResult[] | null> {
  const results: TestResult[] = [];

  for (const tc of testCases) {
    const fullCode = runtime.buildRunnable(code, tc.assertion);

    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: runtime.pistonLanguage,
        version: runtime.pistonVersion,
        files: [{ name: runtime.fileName, content: fullCode }],
        stdin: "",
        run_timeout: 3000,
      }),
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
      results.push({
        description: tc.description,
        passed: false,
        error: shortenError(stderr),
      });
    }
  }

  return results;
}

async function runLocal(
  code: string,
  testCases: { description: string; assertion: string }[],
  runtime: Runtime
): Promise<TestResult[]> {
  if (!runtime.localCommand) {
    throw new Error(
      `Local execution is not available for ${runtime.displayName}. Piston is required.`
    );
  }
  const { spawn } = await import("node:child_process");
  const { join } = await import("node:path");
  const cmd = runtime.localCommand;
  const env = {
    ...process.env,
    PATH: `${join(process.cwd(), "node_modules", ".bin")}:${process.env.PATH ?? ""}`,
  };

  const runOne = (
    fullCode: string
  ): Promise<{ code: number; stderr: string }> => {
    return new Promise((resolve) => {
      const proc = spawn(cmd, ["-e", fullCode], { timeout: 5000, env });
      let stderr = "";
      proc.stderr.on("data", (d) => {
        stderr += d.toString();
      });
      proc.on("close", (exitCode) => {
        resolve({ code: exitCode ?? 1, stderr });
      });
      proc.on("error", () => {
        resolve({ code: 1, stderr: `${cmd} not available locally` });
      });
    });
  };

  const results: TestResult[] = [];
  for (const tc of testCases) {
    const fullCode = runtime.buildRunnable(code, tc.assertion);
    const { code: exitCode, stderr } = await runOne(fullCode);
    if (exitCode === 0) {
      results.push({ description: tc.description, passed: true });
    } else {
      results.push({
        description: tc.description,
        passed: false,
        error: shortenError(stderr),
      });
    }
  }
  return results;
}

function shortenError(stderr: string): string {
  const lines = stderr
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const errLine =
    lines.find((l) => l.includes("AssertionError")) ??
    lines.find((l) => l.includes("AssertionError")) ??
    lines.find((l) => l.includes("Error")) ??
    lines[lines.length - 1] ??
    "Test failed";
  return errLine.slice(0, 160);
}
