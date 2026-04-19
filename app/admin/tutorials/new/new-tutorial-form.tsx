"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBytes } from "@/lib/utils";

type App = { id: string; name: string };

export function NewTutorialForm({ applications }: { applications: App[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [applicationId, setApplicationId] = useState(applications[0]?.id ?? "");
  const [type, setType] = useState<"VIDEO" | "PDF">("VIDEO");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const acceptAttr = type === "VIDEO" ? "video/*" : "application/pdf";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }
    if (!applicationId) {
      setError("Please select an application.");
      return;
    }
    start(() => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/tutorials", true);
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("applicationId", applicationId);
      form.append("type", type);
      form.append("file", file);
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          setProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      };
      xhr.onload = () => {
        setProgress(null);
        if (xhr.status >= 200 && xhr.status < 300) {
          router.push("/admin/tutorials");
          router.refresh();
        } else {
          try {
            const body = JSON.parse(xhr.responseText) as { error?: string };
            setError(body.error ?? "Upload failed");
          } catch {
            setError("Upload failed");
          }
        }
      };
      xhr.onerror = () => {
        setProgress(null);
        setError("Network error during upload");
      };
      xhr.send(form);
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Creating a purchase order"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="application">Application</Label>
              <Select value={applicationId} onValueChange={setApplicationId}>
                <SelectTrigger id="application">
                  <SelectValue placeholder="Select an application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Format</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  setType(v as "VIDEO" | "PDF");
                  setFile(null);
                }}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short description (optional)</Label>
            <Textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Walkthrough of the end-to-end PO creation flow."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              accept={acceptAttr}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
            {file ? (
              <p className="text-xs text-muted-foreground">
                {file.name} · {formatBytes(file.size)}
              </p>
            ) : null}
          </div>

          {progress !== null ? (
            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Uploading… {progress}%</p>
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/admin/tutorials")}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Uploading…" : "Add tutorial"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
