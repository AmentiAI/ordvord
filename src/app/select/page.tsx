"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ORDINALS, RARITY_COLORS, ELEMENT_ICONS, type Ordinal } from "@/lib/mockData";
import StatBar from "@/components/StatBar";

export default function SelectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Ordinal | null>(null);
  const [hovering, setHovering] = useState<Ordinal | null>(null);
  const [locked, setLocked] = useState(false);

  const preview = hovering ?? selected;

  const handleLock = () => {
    if (!selected) return;
    setLocked(true);
    // store in sessionStorage so battle page can read it
    sessionStorage.setItem("myFighter", JSON.stringify(selected));
    setTimeout(() => router.push("/lobby"), 800);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050508" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: "rgba(247,147,26,0.15)", background: "rgba(0,0,0,0.6)" }}
      >
        <button
          onClick={() => router.push("/")}
          className="text-xs tracking-widest uppercase cursor-pointer transition-colors hover:opacity-80"
          style={{ color: "#64748b" }}
        >
          ← BACK
        </button>
        <div className="text-xs tracking-widest uppercase" style={{ color: "#64748b" }}>
          Season 03 · Round 1
        </div>
      </div>

      {/* Title */}
      <div className="text-center pt-8 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black tracking-widest uppercase"
          style={{ color: "#f7931a", textShadow: "0 0 30px rgba(247,147,26,0.4)" }}
        >
          Choose Your Fighter
        </motion.h1>
        <p className="text-xs tracking-widest mt-2 uppercase" style={{ color: "#334155" }}>
          Select your Bitcoin Ordinal to enter the arena
        </p>
      </div>

      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Fighter grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {ORDINALS.map((ord, i) => {
              const isSelected = selected?.id === ord.id;
              const rarityColor = RARITY_COLORS[ord.rarity];
              return (
                <motion.div
                  key={ord.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setSelected(ord)}
                  onMouseEnter={() => setHovering(ord)}
                  onMouseLeave={() => setHovering(null)}
                  className="relative cursor-pointer rounded-lg overflow-hidden card-hover"
                  style={{
                    background: `linear-gradient(135deg, #0d0d14, #0a0a12)`,
                    border: `1px solid ${isSelected ? ord.glowColor : "rgba(255,255,255,0.06)"}`,
                    boxShadow: isSelected
                      ? `0 0 20px ${ord.glowColor}44, 0 0 40px ${ord.glowColor}22`
                      : "none",
                  }}
                >
                  {/* Rarity stripe */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: rarityColor }}
                  />

                  {/* Selected indicator */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at center, ${ord.glowColor}15, transparent 70%)`,
                      }}
                    />
                  )}

                  {/* Fighter visual */}
                  <div
                    className={`relative flex items-center justify-center text-6xl py-6 ${isSelected ? "float-anim" : ""}`}
                    style={{
                      background: `linear-gradient(135deg, ${ord.glowColor}10, transparent)`,
                    }}
                  >
                    {ord.emoji}
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ border: `1px solid ${ord.glowColor}` }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black tracking-wide" style={{ color: "#e2e8f0" }}>
                        {ord.name}
                      </span>
                      <span className="text-[9px]" style={{ color: rarityColor }}>
                        {ELEMENT_ICONS[ord.element]}
                      </span>
                    </div>
                    <div className="text-[9px] mb-2" style={{ color: "#334155" }}>
                      #{ord.inscriptionNumber.toLocaleString()}
                    </div>
                    <div
                      className="text-[9px] px-1.5 py-0.5 rounded inline-block mb-2"
                      style={{
                        background: `${rarityColor}22`,
                        color: rarityColor,
                        border: `1px solid ${rarityColor}44`,
                      }}
                    >
                      {ord.rarity}
                    </div>

                    {/* Mini stat bars */}
                    <div className="space-y-1">
                      <StatBar label="ATK" value={ord.atk} color={ord.glowColor} />
                      <StatBar label="DEF" value={ord.def} color={ord.glowColor} />
                      <StatBar label="SPD" value={ord.spd} color={ord.glowColor} />
                    </div>
                  </div>

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                      style={{ background: ord.glowColor, color: "#000" }}
                    >
                      ✓
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Side panel — Fighter detail */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-72 flex-shrink-0 border-l flex flex-col"
              style={{
                borderColor: "rgba(247,147,26,0.1)",
                background: "rgba(0,0,0,0.4)",
              }}
            >
              <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Big fighter display */}
                <div
                  className="relative rounded-lg flex items-center justify-center"
                  style={{
                    height: 180,
                    background: `linear-gradient(135deg, ${preview.glowColor}18, transparent)`,
                    border: `1px solid ${preview.glowColor}33`,
                  }}
                >
                  <span className="text-8xl float-anim">{preview.emoji}</span>
                  <div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      boxShadow: `inset 0 0 30px ${preview.glowColor}22`,
                    }}
                  />
                </div>

                {/* Details */}
                <div>
                  <h2 className="text-xl font-black" style={{ color: "#e2e8f0" }}>
                    {preview.name}
                  </h2>
                  <p className="text-xs" style={{ color: "#475569" }}>
                    Inscription #{preview.inscriptionNumber.toLocaleString()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded"
                      style={{
                        background: `${RARITY_COLORS[preview.rarity]}22`,
                        color: RARITY_COLORS[preview.rarity],
                        border: `1px solid ${RARITY_COLORS[preview.rarity]}44`,
                      }}
                    >
                      {preview.rarity}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded capitalize"
                      style={{ background: "#1e293b", color: "#64748b" }}
                    >
                      {ELEMENT_ICONS[preview.element]} {preview.element}
                    </span>
                  </div>
                </div>

                {/* Full stats */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#334155" }}>
                    Stats
                  </div>
                  <StatBar label="HP" value={preview.hp} color="#22c55e" />
                  <StatBar label="ATK" value={preview.atk} color={preview.glowColor} />
                  <StatBar label="DEF" value={preview.def} color={preview.glowColor} />
                  <StatBar label="SPD" value={preview.spd} color={preview.glowColor} />
                </div>

                {/* Special move */}
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: `${preview.glowColor}0d`,
                    border: `1px solid ${preview.glowColor}22`,
                  }}
                >
                  <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#475569" }}>
                    Special Move
                  </div>
                  <div className="text-sm font-bold" style={{ color: preview.glowColor }}>
                    ⚡ {preview.special}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                    {preview.specialDesc}
                  </div>
                </div>

                <div className="flex-1" />

                {/* Battle button */}
                {selected && selected.id === preview.id && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleLock}
                    disabled={locked}
                    className="w-full py-4 font-black text-sm tracking-widest uppercase cursor-pointer transition-all"
                    style={{
                      background: locked
                        ? "#1e293b"
                        : `linear-gradient(135deg, ${preview.glowColor}, ${preview.glowColor}99)`,
                      color: locked ? "#475569" : "#000",
                      clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                      boxShadow: locked ? "none" : `0 0 20px ${preview.glowColor}44`,
                    }}
                  >
                    {locked ? "ENTERING ARENA..." : "⚔️ GO TO BATTLE"}
                  </motion.button>
                )}

                {selected && selected.id !== preview.id && (
                  <button
                    onClick={() => setSelected(preview)}
                    className="w-full py-3 font-bold text-xs tracking-widest uppercase cursor-pointer transition-opacity hover:opacity-80"
                    style={{
                      background: "rgba(247,147,26,0.08)",
                      color: "#f7931a",
                      border: "1px solid rgba(247,147,26,0.2)",
                      borderRadius: 4,
                    }}
                  >
                    SELECT THIS FIGHTER
                  </button>
                )}

                {!selected && (
                  <button
                    onClick={() => setSelected(preview)}
                    className="w-full py-3 font-bold text-xs tracking-widest uppercase cursor-pointer transition-opacity hover:opacity-80"
                    style={{
                      background: "rgba(247,147,26,0.08)",
                      color: "#f7931a",
                      border: "1px solid rgba(247,147,26,0.2)",
                      borderRadius: 4,
                    }}
                  >
                    SELECT THIS FIGHTER
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
