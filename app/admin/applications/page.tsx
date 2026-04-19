import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { NewApplicationForm } from "./new-application-form";
import { AppRowActions } from "./app-row-actions";

export default async function AdminApplications() {
  const apps = await prisma.application.findMany({
    include: { _count: { select: { tutorials: true, access: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Add or remove applications. Tutorials are grouped by the application they belong
            to.
          </p>
        </div>
      </div>

      <NewApplicationForm />

      <Card>
        <div className="divide-y divide-border">
          {apps.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-accent/40 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center font-display font-bold">
                {a.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground">
                  Added {formatDate(a.createdAt)}
                </div>
              </div>
              <Badge variant="muted">
                {a._count.tutorials} tutorial{a._count.tutorials === 1 ? "" : "s"}
              </Badge>
              <AppRowActions
                id={a.id}
                name={a.name}
                tutorialCount={a._count.tutorials}
              />
            </div>
          ))}
          {apps.length === 0 ? (
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No applications yet.
            </CardContent>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
