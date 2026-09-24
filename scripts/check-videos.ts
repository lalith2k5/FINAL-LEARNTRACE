import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mirrors VideoEmbed.tsx logic exactly
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const list = u.searchParams.get("list");
      if (u.pathname === "/playlist" && list) {
        return `https://www.youtube.com/embed/videoseries?list=${list}`;
      }
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const m = u.pathname.match(/^\/(\d+)/);
      if (m) return `https://player.vimeo.com/video/${m[1]}`;
    }
  } catch {}
  return null;
}

async function headOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const rows = await prisma.material.findMany({
    where: { type: "video" },
    include: { skills: { include: { skill: true } } },
    orderBy: { title: "asc" },
  });

  console.log(`\n📺 Checking ${rows.length} video materials\n`);
  console.log("STATUS   SKILL                              EMBED?  TITLE");
  console.log("─".repeat(100));

  let inline = 0;
  let external = 0;
  let broken = 0;

  for (const m of rows) {
    const skill = m.skills[0]?.skill.name ?? "?";
    const embed = m.url ? toEmbedUrl(m.url) : null;
    const em = embed ? "yes" : "no ";
    const good = embed ? await headOk(embed) : false;

    let status: string;
    if (embed && good) {
      status = "✓ PLAY ";
      inline++;
    } else if (!embed) {
      status = "→ LINK ";
      external++;
    } else {
      status = "✗ BROKE";
      broken++;
    }

    console.log(
      `${status}  ${skill.padEnd(34).slice(0, 34)} ${em}     ${m.title}`
    );
  }

  console.log("─".repeat(100));
  console.log(`\n📊 Summary:`);
  console.log(`   Plays inline:            ${inline}`);
  console.log(`   Opens externally (link): ${external}`);
  console.log(`   Broken:                  ${broken}`);
  if (external > 0) {
    console.log(
      `\nℹ️  ${external} videos use YouTube playlist URLs, which VideoEmbed`
    );
    console.log(
      `   doesn't parse. Fix: teach toEmbedUrl() to handle /playlist?list=.`
    );
  }
}

main()
  .catch((e) => {
    console.error("❌", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
