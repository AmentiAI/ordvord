"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLaserEyes } from "@omnisat/lasereyes";
import WalletConnect from "@/components/WalletConnect";

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: (i * 17 + 5) % 100,
  y: (i * 23 + 10) % 100,
  size: (i % 3) + 1.5,
  duration: (i % 4) + 4,
  delay: (i % 5) * 0.8,
}));

const TICKER = [
  "⚡ BLOCK #881,337 MINED",
  "🔥 SATOSHI_REAPER #469842 WON 14 BATTLES",
  "💀 SAT_DRAGON #77777 IS UNDEFEATED",
  "⚡ NEW ORDINAL BATTLE STARTING",
  "🦍 ORD_APE #214670 ENTERED THE ARENA",
  "🏆 TOURNAMENT SEASON 3 BEGINS",
];

export default function Home() {
  const router = useRouter();
  const { connected, address } = useLaserEyes();
  const [tickerIdx, setTickerIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER.length), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const target = 14892;
    const step = 250;
    const t = setInterval(() => {
      setCount((c) => {
        if (c >= target) { clearInterval(t); return target; }
        return c + step;
      });
    }, 30);
    return () => clearInterval(t);
  }, []);

  const handleEnter = () => {
    setEntered(true);
    setTimeout(() => router.push("/select"), 600);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Top-right wallet connect */}
      <div className="absolute top-4 right-4 z-20">
        <WalletConnect />
      </div>

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(247,147,26,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(247,147,26,0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-orange-400 opacity-30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Center radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(247,147,26,0.07) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-8 px-4 text-center"
      >
        {/* Live ticker */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 border rounded px-4 py-2 text-xs"
          style={{
            background: "rgba(0,0,0,0.6)",
            borderColor: "rgba(247,147,26,0.3)",
            color: "#fb923c",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <motion.span
            key={tickerIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {TICKER[tickerIdx]}
          </motion.span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
        >
          <div
            className="glitch font-black tracking-tighter leading-none"
            data-text="ORDVORD"
            style={{
              fontSize: "clamp(5rem, 15vw, 10rem)",
              color: "#f7931a",
              textShadow: "0 0 40px rgba(247,147,26,0.6), 0 0 80px rgba(247,147,26,0.3)",
            }}
          >
            ORDVORD
          </div>
          <div className="text-sm tracking-[0.4em] mt-2 uppercase" style={{ color: "#64748b" }}>
            Bitcoin Ordinal Battle Arena
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-8 text-center"
        >
          {[
            { label: "Battles Fought", val: count.toLocaleString() },
            { label: "Ordinals Active", val: "8,441" },
            { label: "Season", val: "03" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="text-2xl font-black" style={{ color: "#f7931a" }}>{s.val}</span>
              <span className="text-xs uppercase tracking-widest" style={{ color: "#475569" }}>{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="w-64 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #f7931a, transparent)" }}
        />

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={handleEnter}
            className="relative group px-12 py-4 text-lg font-black tracking-widest uppercase overflow-hidden cursor-pointer transition-all duration-200 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f7931a, #c27515)",
              color: "#000",
              clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              boxShadow: "0 0 30px rgba(247,147,26,0.5), 0 0 60px rgba(247,147,26,0.2)",
            }}
          >
            <span className="relative z-10">⚔️ ENTER ARENA</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-white" />
          </button>

          {connected && address ? (
            <p className="text-xs tracking-widest" style={{ color: "#22c55e" }}>
              ✓ WALLET CONNECTED — YOUR ORDINALS WILL LOAD IN SELECTION
            </p>
          ) : (
            <p className="text-xs tracking-widest" style={{ color: "#334155" }}>
              CONNECT WALLET (TOP RIGHT) TO USE YOUR OWN ORDINALS
            </p>
          )}
        </motion.div>

        {/* Fighter emoji preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex gap-4"
        >
          {["💀", "🔥", "🦍", "⚡", "❄️", "👾", "🧙", "🐉"].map((e, i) => (
            <motion.span
              key={e}
              className="text-2xl select-none cursor-default"
              style={{ opacity: 0.35 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {e}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom bar */}
      <div
        className="absolute bottom-0 left-0 right-0 border-t flex items-center px-4"
        style={{ height: 32, background: "rgba(0,0,0,0.6)", borderColor: "rgba(247,147,26,0.1)" }}
      >
        <div className="flex gap-6 text-[10px] tracking-widest uppercase" style={{ color: "#431a04" }}>
          <span>BLOCKCHAIN VERIFIED</span>
          <span>•</span>
          <span>PROVABLY FAIR</span>
          <span>•</span>
          <span>INSCRIPTIONS ON BITCOIN</span>
          <span>•</span>
          <span>ORDVORD V1.0</span>
        </div>
      </div>
    </div>
  );
}
