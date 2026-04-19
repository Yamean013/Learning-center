"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TutorialRowActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function remove() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    start(async () => {
      const res = await fetch(`/api/admin/tutorials/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("Failed to delete");
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={remove}
      disabled={pending}
      aria-label={`Delete ${title}`}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
