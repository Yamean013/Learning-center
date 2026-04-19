import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

// Defer Next's default body size cap so uploads have no size limit.
// Any hard limit after this point comes from the hosting platform / reverse proxy.
export const maxDuration = 300;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const title = (form.get("title") ?? "").toString().trim();
  const description = (form.get("description") ?? "").toString().trim();
  const applicationId = (form.get("applicationId") ?? "").toString();
  const type = (form.get("type") ?? "").toString().toUpperCase();
  const file = form.get("file");

  if (!title || !applicationId || !type || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (type !== "VIDEO" && type !== "PDF") {
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }
  const app = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 400 });

  const ext = path.extname(file.name) || (type === "PDF" ? ".pdf" : ".mp4");
  const safeExt = ext.replace(/[^.a-zA-Z0-9]/g, "");
  const storedName = `${randomUUID()}${safeExt}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, storedName), bytes);

  const tutorial = await prisma.tutorial.create({
    data: {
      title,
      description: description || null,
      type,
      applicationId,
      fileUrl: `/uploads/${storedName}`,
      fileName: file.name || storedName,
      fileSize: bytes.length,
    },
  });

  return NextResponse.json({ id: tutorial.id });
}
