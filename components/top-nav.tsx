import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MtccMark } from "./mtcc-mark";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function TopNav({
  user,
  variant = "home",
}: {
  user: { name: string; email: string; isAdmin: boolean; allApplications: boolean };
  variant?: "home" | "admin";
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="h-9 w-9 rounded-lg overflow-hidden ring-1 ring-border group-hover:-rotate-6 transition-transform">
            <MtccMark size={36} className="h-full w-full object-cover" />
          </span>
          <span className="font-display text-sm font-semibold hidden sm:inline">
            {variant === "admin" ? "Admin · ERP Learning Center" : "ERP Learning Center"}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {user.isAdmin ? (
            variant === "admin" ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/">Exit admin</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="gap-1.5">
                <Link href="/admin">
                  <ShieldCheck className="h-4 w-4" /> Admin
                </Link>
              </Button>
            )
          ) : null}
          <ThemeToggle />
          <UserMenu
            name={user.name}
            email={user.email}
            isAdmin={user.isAdmin}
            allApplications={user.allApplications}
          />
        </div>
      </div>
    </header>
  );
}
