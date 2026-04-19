import Link from "next/link";
import { FileText, PlayCircle, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBytes, formatDate } from "@/lib/utils";
import { TutorialRowActions } from "./tutorial-row-actions";

export default async function AdminTutorials() {
  const [tutorials, apps] = await Promise.all([
    prisma.tutorial.findMany({
      include: {
        application: true,
        _count: { select: { views: true, downloads: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Tutorials</h1>
          <p className="text-muted-foreground">
            Manage video and PDF guides across all applications.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/tutorials/new">
            <Plus className="h-4 w-4" /> Add tutorial
          </Link>
        </Button>
      </div>

      {apps.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Create an application first on the{" "}
            <Link href="/admin/applications" className="text-primary underline">
              Applications
            </Link>{" "}
            tab.
          </CardContent>
        </Card>
      ) : null}

      {tutorials.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <h3 className="font-display text-lg font-semibold">No tutorials yet</h3>
            <p className="text-muted-foreground mt-1 mb-5">
              Add your first tutorial to get started.
            </p>
            <Button asChild>
              <Link href="/admin/tutorials/new">
                <Plus className="h-4 w-4 mr-1.5" /> Add tutorial
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {tutorials.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-accent/40 transition-colors"
              >
                <div
                  className={`h-10 w-10 shrink-0 rounded-lg grid place-items-center ${
                    t.type === "VIDEO"
                      ? "bg-primary/10 text-primary"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  {t.type === "VIDEO" ? (
                    <PlayCircle className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium truncate">{t.title}</div>
                    <Badge variant="muted">{t.application.name}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {t.fileName} · {formatBytes(t.fileSize)} · Added {formatDate(t.createdAt)}
                  </div>
                </div>
                <div className="hidden sm:block text-xs text-muted-foreground tabular-nums text-right min-w-[90px]">
                  {t.type === "VIDEO"
                    ? `${t._count.views} views`
                    : `${t._count.downloads} downloads`}
                </div>
                <TutorialRowActions id={t.id} title={t.title} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
