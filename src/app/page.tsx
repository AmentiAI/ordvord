"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLaserEyes } from "@omnisat/lasereyes";
import WalletConnect from "@/components/WalletConnect";

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: (Math.random() * 2) + 1.5,
  duration: (Math.random() * 3) + 4,
  delay: Math.random() * 5,
  tx: (Math.random() - 0.5) * 60,
  ty: (Math.random() - 0.5) * 80 - 30,
}));

const TICKER = [
  { icon: "⚡", text: "BLOCK #881,337 MINED", color: "#ffd93d" },
  { icon: "🔥", text: "SATOSHI_REAPER #469842 WON 14 BATTLES", color: "#ff6b2c" },
  { icon: "💀", text: "SAT_DRAGON #77777 IS UNDEFEATED", color: "#7d5ba6" },
  { icon: "⚔️", text: "NEW ORDINAL BATTLE STARTING", color: "#f7931a" },
  { icon: "🦍", text: "ORD_APE #214670 ENTERED THE ARENA", color: "#3b9dff" },
  { icon: "🏆", text: "TOURNAMENT SEASON 3 BEGINS", color: "#d4af37" },
];

const FIGHTER_EMOJIS = ["💀", "🔥", "🦍", "⚡", "❄️", "👾", "🧙", "🐉", "🌟", "⚔️", "💎", "🎭"];

export default function Home() {
  const router = useRouter();
  const { connected, address } = useLaserEyes();
  const [tickerIdx, setTickerIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [entered, setEntered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const target = 14892;
    const step = 500;
    const t = setInterval(() => {
      setCount((c) => {
        if (c >= target) { clearInterval(t); return target; }
        return c + step;
      });
    }, 50);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleEnter = () => {
    setEntered(true);
    setTimeout(() => router.push("/select"), 600);
  };

  const currentTicker = TICKER[tickerIdx];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Wallet Connect */}
      <div className="absolute top-6 right-6 z-20">
        <WalletConnect />
      </div>

      {/* Animated mesh gradient */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(247, 147, 26, 0.15), transparent 50%)`,
          transition: "background 0.3s ease",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(247,147,26,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(247,147,26,0.3) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="particle absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(255, 184, 46, 0.8), rgba(247, 147, 26, 0.2))`,
            boxShadow: `0 0 ${p.size * 4}px rgba(247, 147, 26, 0.6)`,
            "--duration": `${p.duration}s`,
            "--delay": `${p.delay}s`,
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            "--opacity": "0.4",
          } as React.CSSProperties}
        />
      ))}

      {/* Radial glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(247,147,26,0.12) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-8 md:gap-10 px-4 text-center"
      >
        {/* Live ticker */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          className="glass-card flex items-center gap-4 px-6 py-3 rounded-full max-w-md overflow-hidden"
        >
          <motion.div
            key={`pulse-${tickerIdx}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 rounded-full bg-green-400 flex-shrink-0 relative"
          >
            <div className="absolute inset-0 rounded-full bg-green-400 pulse-ring" />
          </motion.div>
          <motion.span
            key={`ticker-${tickerIdx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-sm font-bold tracking-wide truncate"
            style={{ color: currentTicker.color }}
          >
            {currentTicker.icon} {currentTicker.text}
          </motion.span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="relative"
        >
          {/* Glow effect behind title */}
          <div
            className="absolute inset-0 blur-3xl opacity-50"
            style={{
              background: "radial-gradient(circle, rgba(247, 147, 26, 0.6), transparent 70%)",
            }}
          />
          
          <div
            className="glitch font-black tracking-tighter leading-none relative"
            data-text="ORDVORD"
            style={{
              fontSize: "clamp(4rem, 15vw, 11rem)",
              background: "linear-gradient(180deg, #ffb82e 0%, #f7931a 50%, #d97706 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 40px rgba(247, 147, 26, 0.8)) drop-shadow(0 0 80px rgba(247, 147, 26, 0.4))",
            }}
          >
            ORDVORD
          </div>
          
          <motion.div 
            className="text-sm md:text-base tracking-[0.4em] md:tracking-[0.5em] mt-4 uppercase font-bold"
            style={{ 
              color: "#94a3b8",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Bitcoin Ordinal Battle Arena
          </motion.div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex gap-8 md:gap-12"
        >
          {[
            { label: "Battles Fought", val: count.toLocaleString(), icon: "⚔️", color: "#ff6b2c" },
            { label: "Ordinals Active", val: "8,441", icon: "🎭", color: "#3b9dff" },
            { label: "Season", val: "03", icon: "🏆", color: "#d4af37" },
          ].map((s, idx) => (
            <motion.div 
              key={s.label}
              className="glass-card px-6 py-4 rounded-xl text-center hover:scale-105 transition-transform"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + idx * 0.1 }}
            >
              <div className="text-3xl mb-1">{s.icon}</div>
              <span className="text-2xl md:text-3xl font-black block" style={{ color: s.color }}>
                {s.val}
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-widest block mt-1" style={{ color: "#64748b" }}>
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
          className="w-64 md:w-96 h-px relative"
          style={{ 
            background: "linear-gradient(90deg, transparent, #f7931a 20%, #f7931a 80%, transparent)",
          }}
        >
          <div 
            className="absolute inset-0 blur-md"
            style={{ 
              background: "linear-gradient(90deg, transparent, #f7931a, transparent)",
            }}
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, type: "spring", stiffness: 120 }}
          className="flex flex-col items-center gap-6"
        >
          <button
            onClick={handleEnter}
            className="btn-primary relative group text-lg md:text-xl"
            style={{
              clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
            }}
          >
            <span className="relative z-10 flex items-center gap-3">
              ⚔️ ENTER ARENA
            </span>
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </button>

          {connected && address ? (
            <motion.div 
              className="glass-card px-6 py-3 rounded-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 }}
            >
              <p className="text-sm font-bold tracking-wide" style={{ color: "#22c55e" }}>
                ✓ WALLET CONNECTED
              </p>
              <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                Your Ordinals will load in selection
              </p>
            </motion.div>
          ) : (
            <motion.p 
              className="text-xs tracking-widest text-center px-6 max-w-md" 
              style={{ color: "#475569" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              CONNECT WALLET (TOP RIGHT) TO USE YOUR OWN ORDINALS
            </motion.p>
          )}
        </motion.div>

        {/* Fighter emoji preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="flex gap-4 md:gap-6 flex-wrap justify-center max-w-2xl"
        >
          {FIGHTER_EMOJIS.map((e, i) => (
            <motion.div
              key={e}
              className="glass-card w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center cursor-default hover:scale-110 transition-transform"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.7, scale: 1 }}
              transition={{ delay: 1.5 + i * 0.05 }}
              whileHover={{ opacity: 1, y: -4 }}
            >
              <span className="text-2xl md:text-3xl">{e}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mt-8"
        >
          {[
            { icon: "🔗", title: "Blockchain Verified", desc: "All battles on Bitcoin" },
            { icon: "🎲", title: "Provably Fair", desc: "Transparent RNG system" },
            { icon: "🏆", title: "Real Rewards", desc: "Win with your Ordinals" },
          ].map((feature, idx) => (
            <motion.div
              key={feature.title}
              className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 + idx * 0.1 }}
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-base mb-2" style={{ color: "#f7931a" }}>
                {feature.title}
              </h3>
              <p className="text-sm" style={{ color: "#94a3b8" }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-0 left-0 right-0 glass-card border-t flex items-center justify-center px-4 py-3 overflow-x-auto"
      >
        <div className="flex gap-6 text-xs tracking-widest uppercase whitespace-nowrap font-semibold" style={{ color: "#64748b" }}>
          <span className="hover:text-bitcoin-orange transition-colors cursor-default">ORDVORD V1.0</span>
          <span>•</span>
          <span className="hover:text-bitcoin-orange transition-colors cursor-default">INSCRIPTIONS ON BITCOIN</span>
          <span>•</span>
          <span className="hover:text-bitcoin-orange transition-colors cursor-default">SEASON 3 LIVE</span>
        </div>
      </motion.div>
    </div>
  );
}
