"use client";

import { motion } from "framer-motion";

interface Props {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export default function StatBar({ label, value, max = 100, color = "#f7931a" }: Props) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-widest w-8" style={{ color: "#64748b" }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-[10px] font-bold w-5 text-right" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
