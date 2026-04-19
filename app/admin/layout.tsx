import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, FileStack, Layers } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { TopNav } from "@/components/top-nav";

export const dynamic = "force-dynamic";

const tabs = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/tutorials", label: "Tutorials", icon: FileStack },
  { href: "/admin/applications", label: "Applications", icon: Layers },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/");

  return (
    <>
      <TopNav
        user={{
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          allApplications: user.allApplications,
        }}
        variant="admin"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
        <nav className="flex gap-1 border-b border-border overflow-x-auto">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 fade-up">{children}</main>
    </>
  );
}
