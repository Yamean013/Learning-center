"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MicrosoftLogo } from "@/components/microsoft-logo";
import { Separator } from "@/components/ui/separator";

type SeededUser = {
  email: string;
  name: string;
  isAdmin: boolean;
  allApplications: boolean;
};

export function LoginCard({ seededUsers }: { seededUsers: SeededUser[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  function signIn(next: string) {
    setError(null);
    start(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: next }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Sign-in failed");
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-md shadow-xl fade-up">
      <CardHeader className="space-y-3 items-center text-center">
        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center font-display text-xl font-extrabold">
          E
        </div>
        <CardTitle className="font-display text-2xl">ERP Learning Center</CardTitle>
        <CardDescription>
          Sign in with your Microsoft work account to access tutorials.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            signIn(email);
          }}
          className="space-y-3"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@mtcc.mv"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full h-11 gap-3">
            <MicrosoftLogo className="h-4 w-4" />
            {isPending ? "Signing in…" : "Sign in with Microsoft"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </form>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Demo accounts
          </span>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-2">
          {seededUsers.map((u) => (
            <button
              key={u.email}
              type="button"
              onClick={() => signIn(u.email)}
              disabled={isPending}
              className="w-full flex items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 text-left hover:bg-accent hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <div>
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
              </div>
              <div className="flex gap-1 text-[10px] uppercase tracking-wider">
                {u.isAdmin ? (
                  <span className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                    Admin
                  </span>
                ) : null}
                {u.allApplications ? (
                  <span className="px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
                    All apps
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Real Microsoft Entra ID login wires in through this same endpoint — swap the
          mock for an MSAL redirect callback when ready.
        </p>
      </CardContent>
    </Card>
  );
}
