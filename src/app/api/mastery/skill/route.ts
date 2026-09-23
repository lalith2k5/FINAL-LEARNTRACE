import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserApi } from "@/lib/user";
import { getMasteryView } from "@/lib/mastery/view";

const Schema = z.object({
  skillId: z.string(),
});

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

  const view = await getMasteryView(user.id);
  const v = view.bySkillId.get(parsed.data.skillId);

  return NextResponse.json({
    skillId: parsed.data.skillId,
    raw: v?.raw ?? 0,
    effective: v?.effective ?? 0,
    tier: v?.tier ?? "untouched",
  });
}
