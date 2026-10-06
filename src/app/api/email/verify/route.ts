import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumeToken } from "@/lib/auth/tokens";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = (searchParams.get("email") ?? "").trim().toLowerCase();
  const token = searchParams.get("token") ?? "";

  if (!email || !token) {
    return NextResponse.redirect(new URL("/verify?error=missing", req.url));
  }

  const ok = await consumeToken("verify", email, token);
  if (!ok) {
    return NextResponse.redirect(new URL("/verify?error=invalid", req.url));
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  return NextResponse.redirect(new URL("/verify?ok=1", req.url));
}
