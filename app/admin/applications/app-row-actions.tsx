"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppRowActions({
  id,
  name,
  tutorialCount,
}: {
  id: string;
  name: string;
  tutorialCount: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function remove() {
    const msg =
      tutorialCount > 0
        ? `"${name}" has ${tutorialCount} tutorial${tutorialCount === 1 ? "" : "s"} that will also be deleted. Continue?`
        : `Delete "${name}"?`;
    if (!confirm(msg)) return;
    start(async () => {
      const res = await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
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
      aria-label={`Delete ${name}`}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
