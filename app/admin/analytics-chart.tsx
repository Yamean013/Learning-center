"use client";

import { useId, useMemo, useState } from "react";

type Point = { label: string; views: number; downloads: number };

const WIDTH = 800;
const HEIGHT = 260;
const PAD = { top: 16, right: 16, bottom: 28, left: 36 };

export function AnalyticsChart({ data }: { data: Point[] }) {
  const viewsGrad = useId();
  const downloadsGrad = useId();
  const [hover, setHover] = useState<number | null>(null);

  const { viewsPath, viewsArea, downloadsPath, downloadsArea, xs, yTicks, maxY } = useMemo(() => {
    const innerW = WIDTH - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const n = data.length;
    const localMax = data.reduce((m, p) => Math.max(m, p.views, p.downloads), 0);
    const max = Math.max(4, localMax);

    const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

    const toPath = (key: "views" | "downloads") => {
      if (!data.length) return "";
      return data
        .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(p[key]).toFixed(2)}`)
        .join(" ");
    };
    const toArea = (key: "views" | "downloads") => {
      if (!data.length) return "";
      const line = toPath(key);
      const last = `L ${x(data.length - 1).toFixed(2)} ${(PAD.top + innerH).toFixed(2)}`;
      const first = `L ${x(0).toFixed(2)} ${(PAD.top + innerH).toFixed(2)}`;
      return `${line} ${last} ${first} Z`;
    };

    const step = max <= 8 ? 1 : Math.ceil(max / 4);
    const ticks: number[] = [];
    for (let v = 0; v <= max; v += step) ticks.push(v);

    return {
      xs: data.map((_, i) => x(i)),
      yTicks: ticks.map((v) => ({ v, y: y(v) })),
      maxY: max,
      viewsPath: toPath("views"),
      viewsArea: toArea("views"),
      downloadsPath: toPath("downloads"),
      downloadsArea: toArea("downloads"),
    };
  }, [data]);

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPos = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < xs.length; i++) {
      const d = Math.abs(xs[i] - xPos);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
    }
    setHover(nearest);
  }

  const tickEvery = data.length > 10 ? Math.ceil(data.length / 6) : 1;

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-2 text-xs text-muted-foreground">
        <Legend color="var(--color-chart-1)" label="Views" />
        <Legend color="var(--color-chart-3)" label="Downloads" />
        <span className="ml-auto tabular-nums">Peak: {maxY}</span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="w-full h-[260px]"
        onMouseLeave={() => setHover(null)}
        onMouseMove={handleMove}
        role="img"
        aria-label="Activity over time"
      >
        <defs>
          <linearGradient id={viewsGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={downloadsGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
          </linearGradient>
        </defs>

        {yTicks.map((t) => (
          <g key={t.v}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={t.y}
              y2={t.y}
              stroke="var(--color-border)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={t.y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              fill="var(--color-muted-foreground)"
            >
              {t.v}
            </text>
          </g>
        ))}

        <path d={viewsArea} fill={`url(#${viewsGrad})`} />
        <path
          d={viewsPath}
          fill="none"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path d={downloadsArea} fill={`url(#${downloadsGrad})`} />
        <path
          d={downloadsPath}
          fill="none"
          stroke="var(--color-chart-3)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((p, i) => {
          if (i % tickEvery !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={i}
              x={xs[i]}
              y={HEIGHT - PAD.bottom + 16}
              textAnchor="middle"
              fontSize={11}
              fill="var(--color-muted-foreground)"
            >
              {p.label}
            </text>
          );
        })}

        {hover !== null && data[hover] ? (
          <g>
            <line
              x1={xs[hover]}
              x2={xs[hover]}
              y1={PAD.top}
              y2={HEIGHT - PAD.bottom}
              stroke="var(--color-muted-foreground)"
              strokeOpacity={0.4}
              strokeDasharray="4 4"
            />
            <circle cx={xs[hover]} cy={PAD.top} r={0} />
          </g>
        ) : null}
      </svg>
      {hover !== null && data[hover] ? (
        <div className="mt-1 text-xs text-muted-foreground flex justify-between tabular-nums">
          <span>{data[hover].label}</span>
          <span>
            <span className="text-chart-1">Views {data[hover].views}</span>
            <span className="mx-2 opacity-40">·</span>
            <span>Downloads {data[hover].downloads}</span>
          </span>
        </div>
      ) : (
        <div className="mt-1 text-xs text-muted-foreground">Hover to inspect</div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
