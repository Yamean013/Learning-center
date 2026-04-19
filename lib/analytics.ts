import { prisma } from "./db";

export type Granularity = "day" | "week" | "month";

function startOf(d: Date, granularity: Granularity) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  if (granularity === "week") {
    const day = out.getDay();
    const diff = (day + 6) % 7;
    out.setDate(out.getDate() - diff);
  } else if (granularity === "month") {
    out.setDate(1);
  }
  return out;
}

function add(d: Date, granularity: Granularity, n: number) {
  const out = new Date(d);
  if (granularity === "day") out.setDate(out.getDate() + n);
  else if (granularity === "week") out.setDate(out.getDate() + 7 * n);
  else out.setMonth(out.getMonth() + n);
  return out;
}

function bucketKey(d: Date, granularity: Granularity) {
  const s = startOf(d, granularity);
  return s.toISOString();
}

function labelFor(d: Date, granularity: Granularity) {
  if (granularity === "month") {
    return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }
  if (granularity === "week") {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export async function getAnalytics(granularity: Granularity, buckets: number) {
  const now = new Date();
  const end = add(startOf(now, granularity), granularity, 1);
  const start = add(end, granularity, -buckets);

  const [views, downloads] = await Promise.all([
    prisma.view.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: { createdAt: true },
    }),
    prisma.download.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: { createdAt: true },
    }),
  ]);

  const viewsMap = new Map<string, number>();
  const downloadsMap = new Map<string, number>();
  for (const v of views) {
    const k = bucketKey(v.createdAt, granularity);
    viewsMap.set(k, (viewsMap.get(k) ?? 0) + 1);
  }
  for (const d of downloads) {
    const k = bucketKey(d.createdAt, granularity);
    downloadsMap.set(k, (downloadsMap.get(k) ?? 0) + 1);
  }

  const series: { label: string; views: number; downloads: number }[] = [];
  for (let i = 0; i < buckets; i++) {
    const d = add(start, granularity, i);
    const k = bucketKey(d, granularity);
    series.push({
      label: labelFor(d, granularity),
      views: viewsMap.get(k) ?? 0,
      downloads: downloadsMap.get(k) ?? 0,
    });
  }
  return series;
}

export async function getTopTutorials(limit = 5) {
  const tutorials = await prisma.tutorial.findMany({
    include: {
      application: true,
      _count: { select: { views: true, downloads: true } },
    },
  });
  return tutorials
    .map((t) => ({
      id: t.id,
      title: t.title,
      application: t.application.name,
      type: t.type,
      views: t._count.views,
      downloads: t._count.downloads,
      total: t._count.views + t._count.downloads,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export async function getAllTimeTotals() {
  const [views, downloads, tutorials, users] = await Promise.all([
    prisma.view.count(),
    prisma.download.count(),
    prisma.tutorial.count(),
    prisma.user.count(),
  ]);
  return { views, downloads, tutorials, users };
}
