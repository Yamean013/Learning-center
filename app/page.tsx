import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, PlayCircle } from "lucide-react";
import { getCurrentUser, accessibleApplicationIds } from "@/lib/session";
import { prisma } from "@/lib/db";
import { TopNav } from "@/components/top-nav";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const access = accessibleApplicationIds(user);
  const apps = await prisma.application.findMany({
    where: access === "ALL" ? {} : { id: { in: access } },
    include: {
      tutorials: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const totalTutorials = apps.reduce((sum, a) => sum + a.tutorials.length, 0);

  return (
    <>
      <TopNav
        user={{
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          allApplications: user.allApplications,
        }}
      />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-24 fade-up">
        <section className="text-center space-y-4 mb-16">
          <h1 className="font-display font-extrabold tracking-tight text-primary text-5xl sm:text-6xl md:text-7xl leading-none">
            <span className="haptic-hover inline-block">ERP Learning Center</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Video and PDF guides for the applications you use every day.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Badge variant="muted">{apps.length} applications</Badge>
            <Badge variant="muted">{totalTutorials} tutorials</Badge>
          </div>
        </section>

        {apps.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-14">
            {apps.map((app) => (
              <section key={app.id}>
                <div className="flex items-baseline justify-between mb-5">
                  <h2 className="font-display text-2xl font-bold tracking-tight">
                    {app.name}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {app.tutorials.length} tutorial
                    {app.tutorials.length === 1 ? "" : "s"}
                  </span>
                </div>
                {app.tutorials.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                    No tutorials yet for {app.name}.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {app.tutorials.map((t) => (
                      <TutorialTile
                        key={t.id}
                        id={t.id}
                        title={t.title}
                        description={t.description}
                        type={t.type}
                        createdAt={t.createdAt}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function TutorialTile({
  id,
  title,
  description,
  type,
  createdAt,
}: {
  id: string;
  title: string;
  description: string | null;
  type: string;
  createdAt: Date;
}) {
  const isVideo = type === "VIDEO";
  return (
    <Link
      href={`/tutorial/${id}`}
      className="group relative flex flex-col rounded-xl border border-border bg-card p-5 hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`h-11 w-11 rounded-lg grid place-items-center transition-transform group-hover:scale-110 ${
            isVideo ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"
          }`}
        >
          {isVideo ? <PlayCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
        </div>
        <Badge variant={isVideo ? "default" : "secondary"}>
          {isVideo ? "Video" : "PDF"}
        </Badge>
      </div>
      <h3 className="font-semibold text-base leading-snug mb-1.5 group-hover:text-primary transition-colors">
        {title}
      </h3>
      {description ? (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
      ) : (
        <div className="mb-3" />
      )}
      <p className="mt-auto text-xs text-muted-foreground">Added {formatDate(createdAt)}</p>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border p-16 text-center">
      <h3 className="font-display text-xl font-semibold">No tutorials available yet</h3>
      <p className="text-muted-foreground mt-2">
        You don&apos;t have access to any applications, or nothing has been uploaded. Contact
        an administrator to get access.
      </p>
    </div>
  );
}
