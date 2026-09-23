import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  const { materialId } = await params;

  const material = await prisma.material.findUnique({
    where: { id: materialId },
  });
  if (!material || !material.pdfUrl) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = join(
    process.cwd(),
    "uploads",
    "materials",
    `${materialId}.pdf`
  );

  try {
    const file = await readFile(filePath);
    return new Response(file as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${material.title.replace(
          /"/g,
          ""
        )}.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("File not found on disk", { status: 404 });
  }
}
