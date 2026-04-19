"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewApplicationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const n = name.trim();
    if (!n) return;
    start(async () => {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n }),
      });
      if (res.ok) {
        setName("");
        router.refresh();
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Failed to create application");
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="New application name (e.g. HR Cloud)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={pending}
          />
          <Button type="submit" disabled={pending || !name.trim()} className="gap-2">
            <Plus className="h-4 w-4" /> {pending ? "Adding…" : "Add application"}
          </Button>
        </form>
        {error ? <p className="text-sm text-destructive mt-3">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
