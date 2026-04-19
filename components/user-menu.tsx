"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserMenu({
  name,
  email,
  isAdmin,
  allApplications,
}: {
  name: string;
  email: string;
  isAdmin: boolean;
  allApplications: boolean;
}) {
  const router = useRouter();
  const [, start] = useTransition();

  function initials(s: string) {
    return s
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }

  function logout() {
    start(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 py-1 hover:bg-accent transition-colors cursor-pointer"
          aria-label="Account"
        >
          <Avatar className="h-7 w-7 bg-primary text-primary-foreground">
            <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-semibold">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:inline max-w-[140px] truncate">
            {name}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="font-medium text-foreground text-sm">{name}</div>
          <div className="text-xs text-muted-foreground font-normal">{email}</div>
          <div className="flex gap-1 mt-1.5">
            {isAdmin ? (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                Admin
              </span>
            ) : null}
            {allApplications ? (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
                All apps
              </span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
