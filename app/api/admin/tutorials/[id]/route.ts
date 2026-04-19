import { NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/tutorials/[id]">) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  const tutorial = await prisma.tutorial.findUnique({ where: { id } });
  if (!tutorial) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.tutorial.delete({ where: { id } });
  if (tutorial.fileUrl.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", tutorial.fileUrl);
    await unlink(filePath).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
