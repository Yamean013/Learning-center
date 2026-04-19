import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

type PatchBody = {
  isAdmin?: boolean;
  allApplications?: boolean;
  applicationIds?: string[];
};

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  const me = await getCurrentUser();
  if (!me?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as PatchBody;
  const isAdmin = body.isAdmin === true;
  const allApplications = isAdmin || body.allApplications === true;
  const applicationIds = Array.isArray(body.applicationIds)
    ? Array.from(new Set(body.applicationIds.filter((x): x is string => typeof x === "string")))
    : [];

  // Safety rail: an admin can't remove their own admin flag via this endpoint.
  // Prevents accidentally locking yourself out of the admin surface.
  if (target.id === me.id && target.isAdmin && !isAdmin) {
    return NextResponse.json(
      { error: "You can't remove your own admin rights." },
      { status: 400 },
    );
  }

  const grants = allApplications ? [] : applicationIds;
  if (grants.length > 0) {
    const found = await prisma.application.findMany({
      where: { id: { in: grants } },
      select: { id: true },
    });
    if (found.length !== grants.length) {
      return NextResponse.json({ error: "One or more applications no longer exist" }, { status: 400 });
    }
  }

  // Replace the access set in a single transaction: wipe old rows, insert new ones,
  // then flip the flags. Keeps the user row and its access rows consistent.
  await prisma.$transaction([
    prisma.userAppAccess.deleteMany({ where: { userId: id } }),
    ...(grants.length > 0
      ? [
          prisma.userAppAccess.createMany({
            data: grants.map((applicationId) => ({ userId: id, applicationId })),
          }),
        ]
      : []),
    prisma.user.update({
      where: { id },
      data: { isAdmin, allApplications },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  const me = await getCurrentUser();
  if (!me?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  if (id === me.id) {
    return NextResponse.json(
      { error: "You can't delete your own account." },
      { status: 400 },
    );
  }
  // Cascade on UserAppAccess / View / Download is already declared in schema,
  // so a plain delete cleans everything up.
  await prisma.user.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
