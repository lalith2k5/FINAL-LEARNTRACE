import crypto from "node:crypto";
import { prisma } from "@/lib/db";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

function randomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function key(kind: "verify" | "reset", email: string): string {
  return `${kind}:${email.toLowerCase().trim()}`;
}

export async function createToken(
  kind: "verify" | "reset",
  email: string
): Promise<string> {
  const identifier = key(kind, email);
  const token = randomToken();
  const ttl = kind === "verify" ? VERIFY_TTL_MS : RESET_TTL_MS;
  const expires = new Date(Date.now() + ttl);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}

export async function consumeToken(
  kind: "verify" | "reset",
  email: string,
  token: string
): Promise<boolean> {
  const identifier = key(kind, email);
  const row = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });
  if (!row) return false;
  if (row.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    return false;
  }
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  return true;
}
