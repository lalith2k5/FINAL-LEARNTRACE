import { describe, it, expect, vi, beforeEach } from "vitest";

const storage = new Map<string, { identifier: string; token: string; expires: Date }>();

vi.mock("@/lib/db", () => ({
  prisma: {
    verificationToken: {
      deleteMany: vi.fn(async ({ where }: { where: { identifier: string } }) => {
        let count = 0;
        for (const [k, v] of storage) {
          if (v.identifier === where.identifier) {
            storage.delete(k);
            count++;
          }
        }
        return { count };
      }),
      create: vi.fn(async ({ data }: { data: { identifier: string; token: string; expires: Date } }) => {
        storage.set(`${data.identifier}:${data.token}`, data);
        return data;
      }),
      findUnique: vi.fn(async ({ where }: { where: { identifier_token: { identifier: string; token: string } } }) => {
        const k = `${where.identifier_token.identifier}:${where.identifier_token.token}`;
        return storage.get(k) ?? null;
      }),
    },
  },
}));

import { createToken, consumeToken } from "../tokens";

beforeEach(() => {
  storage.clear();
});

describe("createToken", () => {
  it("creates a token in storage", async () => {
    const t = await createToken("verify", "u@example.com");
    expect(t).toMatch(/^[0-9a-f]{64}$/);
    expect(storage.size).toBe(1);
  });

  it("normalizes email case", async () => {
    const t = await createToken("verify", "Mixed@Example.com");
    const ok = await consumeToken("verify", "mixed@example.com", t);
    expect(ok).toBe(true);
  });

  it("replaces prior tokens for the same identifier", async () => {
    await createToken("verify", "u@example.com");
    await createToken("verify", "u@example.com");
    expect(storage.size).toBe(1);
  });

  it("uses separate namespaces for verify vs reset", async () => {
    await createToken("verify", "u@example.com");
    await createToken("reset", "u@example.com");
    expect(storage.size).toBe(2);
  });
});

describe("consumeToken", () => {
  it("accepts a valid token", async () => {
    const t = await createToken("verify", "u@example.com");
    expect(await consumeToken("verify", "u@example.com", t)).toBe(true);
    expect(storage.size).toBe(0);
  });

  it("rejects a wrong token", async () => {
    await createToken("verify", "u@example.com");
    expect(await consumeToken("verify", "u@example.com", "wrong")).toBe(false);
  });

  it("rejects a token used twice", async () => {
    const t = await createToken("verify", "u@example.com");
    await consumeToken("verify", "u@example.com", t);
    expect(await consumeToken("verify", "u@example.com", t)).toBe(false);
  });

  it("rejects a token for the wrong kind", async () => {
    const t = await createToken("verify", "u@example.com");
    expect(await consumeToken("reset", "u@example.com", t)).toBe(false);
  });

  it("rejects an expired token", async () => {
    const t = await createToken("verify", "u@example.com");
    const entry = [...storage.values()][0];
    entry.expires = new Date(Date.now() - 1000);
    expect(await consumeToken("verify", "u@example.com", t)).toBe(false);
    expect(storage.size).toBe(0);
  });
});
