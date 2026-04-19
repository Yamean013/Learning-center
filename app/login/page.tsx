import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { LoginCard } from "./login-card";

export const metadata = { title: "Sign in — ERP Learning Center" };

export default async function LoginPage() {
  const session = await getSession();
  if (session.userId) redirect("/");

  const seededUsers = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { email: true, name: true, isAdmin: true, allApplications: true },
  });

  return (
    <main className="min-h-screen grid place-items-center px-6 py-16 bg-gradient-to-br from-background via-background to-primary/10">
      <LoginCard seededUsers={seededUsers} />
    </main>
  );
}
