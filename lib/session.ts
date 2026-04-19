import { cache } from "react";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import { prisma } from "./db";

export type SessionData = {
  userId?: string;
};

const password =
  process.env.SESSION_SECRET ??
  "dev-only-insecure-password-change-me-to-at-least-32-chars";

export const sessionOptions: SessionOptions = {
  password,
  cookieName: "erp_lc_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession() {
  const jar = await cookies();
  return getIronSession<SessionData>(jar, sessionOptions);
}

// Dedupe per-request so layouts + pages don't re-query the same user.
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session.userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { access: { include: { application: true } } },
  });
  return user;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export function accessibleApplicationIds(user: CurrentUser): "ALL" | string[] {
  if (user.allApplications || user.isAdmin) return "ALL";
  return user.access.map((a) => a.applicationId);
}
