import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/user";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["application/pdf"];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  const user = await requireUserApi();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { materialId } = await params;

  const material = await prisma.material.findUnique({
    where: { id: materialId },
  });
  if (!material) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only PDF files are supported" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_SIZE_BYTES / 1024 / 1024} MB)` },
      { status: 400 }
    );
  }

  // Save to ./uploads/materials/{materialId}.pdf
  const uploadsDir = join(process.cwd(), "uploads", "materials");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const filename = `${materialId}.pdf`;
  const filePath = join(uploadsDir, filename);

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(arrayBuffer));

  // Store a public-facing URL served by our file API route
  const servedUrl = `/api/materials/${materialId}/file`;

  await prisma.material.update({
    where: { id: materialId },
    data: { pdfUrl: servedUrl },
  });

  return NextResponse.json({
    ok: true,
    pdfUrl: servedUrl,
    size: file.size,
    filename: file.name,
  });
}
