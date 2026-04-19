import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const exists = await prisma.application.findUnique({ where: { name } });
  if (exists) {
    return NextResponse.json({ error: "An application with that name already exists" }, { status: 409 });
  }

  const app = await prisma.application.create({ data: { name } });
  return NextResponse.json({ id: app.id, name: app.name });
}
