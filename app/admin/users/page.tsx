import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { NewUserForm } from "./new-user-form";
import { UserRowActions } from "./user-row-actions";

export default async function AdminUsers() {
  const [currentUser, users, apps] = await Promise.all([
    getCurrentUser(),
    prisma.user.findMany({
      orderBy: [{ isAdmin: "desc" }, { createdAt: "desc" }],
      include: { access: { select: { applicationId: true } } },
    }),
    prisma.application.findMany({ orderBy: { name: "asc" } }),
  ]);

  const appChoices = apps.map((a) => ({ id: a.id, name: a.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Grant access to specific applications, promote users to admins, or
            delete accounts.
          </p>
        </div>
      </div>

      <NewUserForm applications={appChoices} />

      <Card>
        <div className="divide-y divide-border">
          {users.map((u) => {
            const appIds = u.access.map((a) => a.applicationId);
            const isSelf = currentUser?.id === u.id;
            return (
              <div
                key={u.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-accent/40 transition-colors"
              >
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary grid place-items-center font-display font-bold">
                  {initials(u.name || u.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className="font-medium truncate">{u.name}</div>
                    {isSelf ? <Badge variant="muted">You</Badge> : null}
                    {u.isAdmin ? <Badge>Admin</Badge> : null}
                    {u.allApplications && !u.isAdmin ? (
                      <Badge variant="secondary">All applications</Badge>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {u.email} · Added {formatDate(u.createdAt)}
                  </div>
                  {!u.isAdmin && !u.allApplications ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {appIds.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">
                          No application access
                        </span>
                      ) : (
                        appChoices
                          .filter((a) => appIds.includes(a.id))
                          .map((a) => (
                            <Badge key={a.id} variant="muted">
                              {a.name}
                            </Badge>
                          ))
                      )}
                    </div>
                  ) : null}
                </div>
                <UserRowActions
                  id={u.id}
                  name={u.name}
                  email={u.email}
                  isAdmin={u.isAdmin}
                  allApplications={u.allApplications}
                  appIds={appIds}
                  applications={appChoices}
                  isSelf={isSelf}
                />
              </div>
            );
          })}
          {users.length === 0 ? (
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No users yet.
            </CardContent>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function initials(label: string) {
  const parts = label.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return label.slice(0, 2).toUpperCase();
}
