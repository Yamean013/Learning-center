import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

type CreateBody = {
  email?: string;
  name?: string;
  isAdmin?: boolean;
  allApplications?: boolean;
  applicationIds?: string[];
};

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as CreateBody;
  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim();
  const isAdmin = body.isAdmin === true;
  // Admins implicitly see every application.
  const allApplications = isAdmin || body.allApplications === true;
  const applicationIds = Array.isArray(body.applicationIds)
    ? Array.from(new Set(body.applicationIds.filter((x): x is string => typeof x === "string")))
    : [];

  if (!email || !name) {
    return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 });
  }

  // If caller sent per-app ids while allApplications is true, ignore them —
  // the "all apps" flag supersedes individual grants.
  const grants = allApplications ? [] : applicationIds;

  // Ensure every referenced application actually exists before we create rows.
  if (grants.length > 0) {
    const found = await prisma.application.findMany({
      where: { id: { in: grants } },
      select: { id: true },
    });
    if (found.length !== grants.length) {
      return NextResponse.json({ error: "One or more applications no longer exist" }, { status: 400 });
    }
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      isAdmin,
      allApplications,
      access: grants.length
        ? { create: grants.map((applicationId) => ({ applicationId })) }
        : undefined,
    },
  });

  return NextResponse.json({ id: user.id });
}
