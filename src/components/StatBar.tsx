"use client";

import { useEffect, useState } from "react";

interface Props {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export default function StatBar({ label, value, max = 100, color = "#f7931a" }: Props) {
  const pct = Math.min((value / max) * 100, 100);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(t);
  }, [pct]);

  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs uppercase tracking-widest w-8 shrink-0 font-bold"
        style={{ color: "#475569" }}
      >
        {label}
      </span>
      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            boxShadow: `0 0 6px ${color}66`,
          }}
        />
      </div>
      <span className="text-xs font-black w-7 text-right tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
