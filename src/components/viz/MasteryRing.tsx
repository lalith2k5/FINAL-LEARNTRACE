"use client";

import { motion } from "framer-motion";

type Props = {
  value: number;      // 0..1
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
};

export function MasteryRing({
  value,
  size = 96,
  stroke = 8,
  label,
  sublabel,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  const offset = c * (1 - pct);

  const color = pct >= 0.75 ? "#10B981" : pct >= 0.5 ? "#F59E0B" : "#F43F5E";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-border-subtle)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-lg font-semibold text-text-primary">
          {Math.round(pct * 100)}%
        </span>
        {label && <span className="label-mono mt-0.5">{label}</span>}
        {sublabel && (
          <span className="text-[10px] text-text-tertiary">{sublabel}</span>
        )}
      </div>
    </div>
  );
}