import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { accessibleApplicationIds, getCurrentUser } from "@/lib/session";

export async function POST(_req: Request, ctx: RouteContext<"/api/tutorials/[id]/download">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tutorial = await prisma.tutorial.findUnique({ where: { id } });
  if (!tutorial) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const access = accessibleApplicationIds(user);
  if (access !== "ALL" && !access.includes(tutorial.applicationId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (tutorial.type !== "PDF") {
    return NextResponse.json({ error: "Not a PDF" }, { status: 400 });
  }

  await prisma.download.create({ data: { tutorialId: id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
