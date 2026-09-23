"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export type MasteryDataPoint = {
  t: string;      // ISO timestamp
  v: number;      // mastery 0..1
  skillName: string;
};

type Props = {
  data: MasteryDataPoint[];
  targetMastery?: number;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function MasterySparkline({
  data,
  targetMastery = 0.75,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-text-tertiary">
        No history yet — take the diagnostic to start tracking.
      </div>
    );
  }

  // Recharts needs a category axis string; format the ISO timestamp.
  const chartData = data.map((d) => ({
    date: formatDate(d.t),
    mastery: Math.round(d.v * 100),
    skill: d.skillName,
    raw: d.t,
  }));

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
        >
          <defs>
            <linearGradient id="masteryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1877F2" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#5EB8FF" stopOpacity={0.6} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            stroke="var(--color-border-default)"
            tick={{ fill: "var(--color-text-quaternary)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={[0, 100]}
            stroke="var(--color-border-default)"
            tick={{ fill: "var(--color-text-quaternary)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <ReferenceLine
            y={targetMastery * 100}
            stroke="#F4F4F5"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
            label={{
              value: "target",
              position: "right",
              fill: "#F4F4F5",
              fontSize: 9,
            }}
          />
          <Tooltip
            contentStyle={{
              background: "color-mix(in oklab, var(--color-bg-overlay) 95%, transparent)",
              border: "1px solid var(--color-border-default)",
              borderRadius: 8,
              fontSize: 11,
              padding: "6px 10px",
              backdropFilter: "blur(12px)",
            }}
            labelStyle={{ color: "#A1A1AA", fontSize: 10 }}
            itemStyle={{ color: "#F4F4F5" }}
            formatter={(value: unknown) => [`${value ?? 0}%`, "mastery"]}
            labelFormatter={(label, payload) => {
              const item = payload?.[0]?.payload;
              return item ? `${item.date} · ${item.skill}` : label;
            }}
          />
          <Line
            type="monotone"
            dataKey="mastery"
            stroke="url(#masteryGradient)"
            strokeWidth={2}
            dot={{ r: 2, fill: "#1877F2", strokeWidth: 0 }}
            activeDot={{ r: 4, fill: "#5EB8FF", strokeWidth: 0 }}
            isAnimationActive={true}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
