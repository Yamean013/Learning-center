"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AppChoice = { id: string; name: string };

type Mode = "APP_ACCESS" | "ALL_APPS" | "ADMIN";

export function NewUserForm({ applications }: { applications: AppChoice[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode>("APP_ACCESS");
  const [appIds, setAppIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function toggleApp(id: string) {
    setAppIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const e2 = email.trim().toLowerCase();
    const n = name.trim();
    if (!e2 || !n) {
      setError("Email and name are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e2)) {
      setError("Enter a valid email");
      return;
    }
    const body = {
      email: e2,
      name: n,
      isAdmin: mode === "ADMIN",
      allApplications: mode === "ALL_APPS" || mode === "ADMIN",
      applicationIds: mode === "APP_ACCESS" ? appIds : [],
    };
    start(async () => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEmail("");
        setName("");
        setAppIds([]);
        setMode("APP_ACCESS");
        router.refresh();
      } else {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        setError(b.error ?? "Failed to add user");
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-user-name">Name</Label>
              <Input
                id="new-user-name"
                placeholder="Ali Rasheed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-user-email">Email</Label>
              <Input
                id="new-user-email"
                type="email"
                placeholder="ali.rasheed@mtcc.mv"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={pending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Access level</Label>
            <div className="grid sm:grid-cols-3 gap-2">
              <RadioCard
                checked={mode === "APP_ACCESS"}
                onSelect={() => setMode("APP_ACCESS")}
                title="Per application"
                description="Pick which apps they can see."
              />
              <RadioCard
                checked={mode === "ALL_APPS"}
                onSelect={() => setMode("ALL_APPS")}
                title="All applications"
                description="See every application."
              />
              <RadioCard
                checked={mode === "ADMIN"}
                onSelect={() => setMode("ADMIN")}
                title="Admin"
                description="Full access + manage content."
              />
            </div>
          </div>

          {mode === "APP_ACCESS" ? (
            <div className="space-y-2">
              <Label>Applications</Label>
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Add an application first to grant per-app access.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {applications.map((a) => {
                    const on = appIds.includes(a.id);
                    return (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => toggleApp(a.id)}
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                          on
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={pending || !email.trim() || !name.trim()}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {pending ? "Adding…" : "Add user"}
            </Button>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function RadioCard({
  checked,
  onSelect,
  title,
  description,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-lg border p-3 transition-colors ${
        checked
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:bg-accent/60"
      }`}
    >
      <div className="font-medium text-sm">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
    </button>
  );
}
