import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/transport";
import { verifyEmail } from "@/lib/email/templates";

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
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const token = await createToken("verify", email);
  const origin = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
  const url = `${origin}/api/email/verify?email=${encodeURIComponent(email)}&token=${token}`;

  await sendEmail(verifyEmail({ to: email, url }));

  return NextResponse.json({ ok: true });
}
