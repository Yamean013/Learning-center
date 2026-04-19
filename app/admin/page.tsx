import { Eye, Download, FileStack, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllTimeTotals, getAnalytics, getTopTutorials } from "@/lib/analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AnalyticsChart } from "./analytics-chart";

export default async function AdminDashboard() {
  const [totals, daily, weekly, monthly, top] = await Promise.all([
    getAllTimeTotals(),
    getAnalytics("day", 14),
    getAnalytics("week", 12),
    getAnalytics("month", 12),
    getTopTutorials(5),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">All-time activity across the Learning Center.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Video views" value={totals.views} icon={<Eye className="h-4 w-4" />} />
        <Stat
          label="PDF downloads"
          value={totals.downloads}
          icon={<Download className="h-4 w-4" />}
        />
        <Stat
          label="Tutorials"
          value={totals.tutorials}
          icon={<FileStack className="h-4 w-4" />}
        />
        <Stat label="Users" value={totals.users} icon={<Users className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Views and downloads over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="day" className="w-full">
            <TabsList>
              <TabsTrigger value="day">Daily</TabsTrigger>
              <TabsTrigger value="week">Weekly</TabsTrigger>
              <TabsTrigger value="month">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="day">
              <AnalyticsChart data={daily} />
            </TabsContent>
            <TabsContent value="week">
              <AnalyticsChart data={weekly} />
            </TabsContent>
            <TabsContent value="month">
              <AnalyticsChart data={monthly} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top tutorials</CardTitle>
          <CardDescription>Ranked by total views + downloads.</CardDescription>
        </CardHeader>
        <CardContent>
          {top.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {top.map((t, i) => (
                <li key={t.id} className="flex items-center gap-4 py-3">
                  <span className="h-7 w-7 rounded-full bg-muted text-muted-foreground grid place-items-center text-xs font-semibold">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.application}</div>
                  </div>
                  <Badge variant={t.type === "VIDEO" ? "default" : "secondary"}>
                    {t.type === "VIDEO" ? "Video" : "PDF"}
                  </Badge>
                  <div className="text-sm tabular-nums text-muted-foreground min-w-[110px] text-right">
                    {t.type === "VIDEO" ? (
                      <>
                        <Eye className="inline h-3.5 w-3.5 mr-1" />
                        {t.views}
                      </>
                    ) : (
                      <>
                        <Download className="inline h-3.5 w-3.5 mr-1" />
                        {t.downloads}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="hover:-translate-y-0.5 transition-transform">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2 text-muted-foreground">
          <span className="text-xs uppercase tracking-wider">{label}</span>
          {icon}
        </div>
        <div className="font-display text-3xl font-bold tabular-nums">
          {value.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
