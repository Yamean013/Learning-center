"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TutorialPlayer({
  id,
  type,
  fileUrl,
  fileName,
}: {
  id: string;
  type: string;
  fileUrl: string;
  fileName: string;
}) {
  const viewedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (type !== "VIDEO") return;
    const el = videoRef.current;
    if (!el) return;
    function onPlay() {
      if (viewedRef.current) return;
      viewedRef.current = true;
      fetch(`/api/tutorials/${id}/view`, { method: "POST" }).catch(() => {});
    }
    el.addEventListener("play", onPlay, { once: true });
    return () => el.removeEventListener("play", onPlay);
  }, [id, type]);

  if (type === "VIDEO") {
    return (
      <div className="rounded-xl overflow-hidden bg-black shadow-xl ring-1 ring-border">
        <video
          ref={videoRef}
          src={fileUrl}
          controls
          className="w-full aspect-video"
          controlsList="nodownload"
          preload="metadata"
        />
      </div>
    );
  }

  return <PdfDownload id={id} fileUrl={fileUrl} fileName={fileName} />;
}

function PdfDownload({
  id,
  fileUrl,
  fileName,
}: {
  id: string;
  fileUrl: string;
  fileName: string;
}) {
  const [, start] = useTransition();
  const [count, setCount] = useState<number | null>(null);

  async function onDownload() {
    start(async () => {
      try {
        await fetch(`/api/tutorials/${id}/download`, { method: "POST" });
      } catch {
        /* best-effort tracking */
      }
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setCount((c) => (c ?? 0) + 1);
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-10 text-center space-y-4">
      <div className="h-16 w-16 rounded-full bg-primary/10 text-primary grid place-items-center mx-auto">
        <Download className="h-7 w-7" />
      </div>
      <div>
        <h3 className="font-display text-xl font-semibold">{fileName}</h3>
        <p className="text-sm text-muted-foreground mt-1">PDF guide</p>
      </div>
      <Button size="lg" onClick={onDownload} className="gap-2">
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
      {count ? (
        <p className="text-xs text-muted-foreground">
          Downloaded {count} time{count === 1 ? "" : "s"} this session.
        </p>
      ) : null}
    </div>
  );
}
