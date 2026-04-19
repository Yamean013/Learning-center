"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type AppChoice = { id: string; name: string };
type Mode = "APP_ACCESS" | "ALL_APPS" | "ADMIN";

export function UserRowActions({
  id,
  name,
  email,
  isAdmin,
  allApplications,
  appIds,
  applications,
  isSelf,
}: {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  allApplications: boolean;
  appIds: string[];
  applications: AppChoice[];
  isSelf: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(
    isAdmin ? "ADMIN" : allApplications ? "ALL_APPS" : "APP_ACCESS",
  );
  const [chosen, setChosen] = useState<string[]>(appIds);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();

  function toggle(appId: string) {
    setChosen((cur) =>
      cur.includes(appId) ? cur.filter((x) => x !== appId) : [...cur, appId],
    );
  }

  function save() {
    setError(null);
    const body = {
      isAdmin: mode === "ADMIN",
      allApplications: mode === "ALL_APPS" || mode === "ADMIN",
      applicationIds: mode === "APP_ACCESS" ? chosen : [],
    };
    startSave(async () => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        setError(b.error ?? "Failed to save changes");
      }
    });
  }

  function remove() {
    if (isSelf) {
      alert("You can't delete your own account.");
      return;
    }
    if (!confirm(`Delete ${name} (${email})? This cannot be undone.`)) return;
    startDelete(async () => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        alert(b.error ?? "Failed to delete user");
      }
    });
  }

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setMode(isAdmin ? "ADMIN" : allApplications ? "ALL_APPS" : "APP_ACCESS");
          setChosen(appIds);
          setError(null);
          setOpen(true);
        }}
        aria-label={`Edit access for ${name}`}
        className="text-muted-foreground hover:text-foreground"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={remove}
        disabled={deleting || isSelf}
        aria-label={`Delete ${name}`}
        className="text-muted-foreground hover:text-destructive disabled:opacity-40"
        title={isSelf ? "You can't delete yourself" : `Delete ${name}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit access</DialogTitle>
            <DialogDescription>
              {name} · {email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Access level</Label>
              <div className="grid sm:grid-cols-3 gap-2">
                <RadioCard
                  checked={mode === "APP_ACCESS"}
                  onSelect={() => setMode("APP_ACCESS")}
                  title="Per application"
                  description="Pick specific apps."
                />
                <RadioCard
                  checked={mode === "ALL_APPS"}
                  onSelect={() => setMode("ALL_APPS")}
                  title="All applications"
                  description="See everything."
                />
                <RadioCard
                  checked={mode === "ADMIN"}
                  onSelect={() => setMode("ADMIN")}
                  title="Admin"
                  description="Full control."
                  disabled={isSelf && isAdmin}
                  disabledHint={
                    isSelf && isAdmin
                      ? "You can't demote yourself"
                      : undefined
                  }
                />
              </div>
              {isSelf && isAdmin && mode !== "ADMIN" ? (
                <p className="text-xs text-destructive">
                  You can&apos;t remove your own admin rights.
                </p>
              ) : null}
            </div>

            {mode === "APP_ACCESS" ? (
              <div className="space-y-2">
                <Label>Applications</Label>
                {applications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No applications exist yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {applications.map((a) => {
                      const on = chosen.includes(a.id);
                      return (
                        <button
                          type="button"
                          key={a.id}
                          onClick={() => toggle(a.id)}
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

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={saving || (isSelf && isAdmin && mode !== "ADMIN")}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RadioCard({
  checked,
  onSelect,
  title,
  description,
  disabled,
  disabledHint,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  disabled?: boolean;
  disabledHint?: string;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      title={disabled ? disabledHint : undefined}
      className={`text-left rounded-lg border p-3 transition-colors ${
        disabled
          ? "opacity-50 cursor-not-allowed border-border"
          : checked
            ? "border-primary bg-primary/5 ring-1 ring-primary"
            : "border-border hover:bg-accent/60"
      }`}
    >
      <div className="font-medium text-sm">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
    </button>
  );
}
