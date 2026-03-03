"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { type Ordinal } from "@/lib/mockData";

const CONFETTI_PIECES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  color: ["#f7931a", "#a855f7", "#06b6d4", "#22c55e", "#f59e0b"][i % 5],
  delay: Math.random() * 0.8,
  duration: 1.5 + Math.random() * 1,
}));

export default function ResultPage() {
  const router = useRouter();
  const [myFighter, setMyFighter] = useState<Ordinal | null>(null);
  const [opponent, setOpponent] = useState<Ordinal | null>(null);
  const [isWinner, setIsWinner] = useState(false);
  const [xpGained] = useState(Math.floor(Math.random() * 300) + 150);
  const [satsGained] = useState(Math.floor(Math.random() * 5000) + 1000);

  useEffect(() => {
    const mf = sessionStorage.getItem("myFighter");
    const opp = sessionStorage.getItem("opponent");
    const w = sessionStorage.getItem("winner");
    if (!mf || !opp || !w) { router.push("/"); return; }
    setMyFighter(JSON.parse(mf));
    setOpponent(JSON.parse(opp));
    setIsWinner(w === "player");
  }, [router]);

  if (!myFighter || !opponent) return null;

  const fighter = isWinner ? myFighter : opponent;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#050508" }}
    >
      {/* Confetti (win only) */}
      {isWinner &&
        CONFETTI_PIECES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-2 h-2 rounded-sm pointer-events-none"
            style={{ left: `${p.x}%`, background: p.color, top: -10 }}
            animate={{ y: ["0vh", "110vh"], rotate: [0, 720], opacity: [1, 0.3] }}
            transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          />
        ))}

      {/* BG radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isWinner
            ? "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(247,147,26,0.1) 0%, transparent 70%)"
            : "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(239,68,68,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center max-w-lg w-full">
        {/* Result banner */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <div
            className="text-7xl md:text-8xl font-black tracking-widest"
            style={{
              color: isWinner ? "#f7931a" : "#ef4444",
              textShadow: `0 0 60px ${isWinner ? "rgba(247,147,26,0.8)" : "rgba(239,68,68,0.8)"}`,
            }}
          >
            {isWinner ? "VICTORY!" : "DEFEATED!"}
          </div>
          <div className="text-sm tracking-widest mt-1 uppercase" style={{ color: "#475569" }}>
            {isWinner
              ? `${myFighter.name} conquers the arena`
              : `${opponent.name} wins the battle`}
          </div>
        </motion.div>

        {/* Winner fighter big display */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-2"
        >
          <div
            className="text-9xl float-anim"
            style={{
              filter: `drop-shadow(0 0 30px ${fighter.glowColor})`,
            }}
          >
            {fighter.emoji}
          </div>
          <div className="font-black text-xl" style={{ color: "#e2e8f0" }}>
            {fighter.name}
          </div>
          <div className="text-xs" style={{ color: "#334155" }}>
            Inscription #{fighter.inscriptionNumber.toLocaleString()}
          </div>
        </motion.div>

        {/* Divider */}
        <div
          className="w-48 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${isWinner ? "#f7931a" : "#ef4444"}, transparent)` }}
        />

        {/* Rewards (win only) */}
        {isWinner && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full rounded-xl p-5"
            style={{
              background: "rgba(247,147,26,0.06)",
              border: "1px solid rgba(247,147,26,0.2)",
            }}
          >
            <div className="text-[10px] uppercase tracking-widest mb-4" style={{ color: "#475569" }}>
              Battle Rewards
            </div>
            <div className="flex justify-around">
              {[
                { icon: "⭐", label: "XP Gained", value: `+${xpGained}` },
                { icon: "₿", label: "Sats Earned", value: `+${satsGained.toLocaleString()}` },
                { icon: "🏆", label: "Win Streak", value: "1" },
              ].map((r) => (
                <div key={r.label} className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{r.icon}</span>
                  <span className="text-xl font-black" style={{ color: "#f7931a" }}>{r.value}</span>
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: "#334155" }}>{r.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Defeat message */}
        {!isWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm"
            style={{ color: "#475569" }}
          >
            Your ordinal fought bravely. Train harder and return.
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex gap-4 w-full"
        >
          <button
            onClick={() => router.push("/select")}
            className="flex-1 py-4 font-black text-sm tracking-widest uppercase cursor-pointer transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f7931a, #c27515)",
              color: "#000",
              clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
              boxShadow: "0 0 20px rgba(247,147,26,0.4)",
            }}
          >
            ⚔️ FIGHT AGAIN
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-4 font-bold text-sm tracking-widest uppercase cursor-pointer transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "#64748b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
            }}
          >
            🏠 MAIN MENU
          </button>
        </motion.div>

        {/* Inscription badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-[10px] tracking-widest uppercase"
          style={{ color: "#1e293b" }}
        >
          BATTLE RESULT INSCRIBED ON BITCOIN BLOCKCHAIN
        </motion.div>
      </div>
    </div>
  );
}
