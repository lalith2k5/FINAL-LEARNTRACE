import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/transport";
import { resetPassword } from "@/lib/email/templates";

const Schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return ok to avoid account enumeration. Only send if user
  // exists AND has a password (OAuth-only users can't reset).
  if (user && user.passwordHash) {
    const token = await createToken("reset", email);
    const origin =
      process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
    const url = `${origin}/reset?email=${encodeURIComponent(email)}&token=${token}`;

    try {
      await sendEmail(resetPassword({ to: email, url }));
    } catch (err) {
      console.error(
        "Reset email failed:",
        err instanceof Error ? err.message : err
      );
    }
  }

  return NextResponse.json({ ok: true });
}
