import { NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/applications/[id]">) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  const tutorials = await prisma.tutorial.findMany({
    where: { applicationId: id },
    select: { fileUrl: true },
  });
  await prisma.application.delete({ where: { id } });

  for (const t of tutorials) {
    if (t.fileUrl.startsWith("/uploads/")) {
      await unlink(path.join(process.cwd(), "public", t.fileUrl)).catch(() => {});
    }
  }
  return NextResponse.json({ ok: true });
}
