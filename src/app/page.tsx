"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLaserEyes } from "@omnisat/lasereyes";
import WalletConnect from "@/components/WalletConnect";

const TICKER = [
  "BLOCK #881,337 MINED",
  "SATOSHI_REAPER #469842 WON 14 BATTLES",
  "SAT_DRAGON #77777 IS UNDEFEATED",
  "NEW ORDINAL BATTLE STARTING",
  "ORD_APE #214670 ENTERED THE ARENA",
  "TOURNAMENT SEASON 3 BEGINS",
];


export default function Home() {
  const router = useRouter();
  const { connected, address } = useLaserEyes();
  const [tickerIdx, setTickerIdx] = useState(0);
  const [battles, setBattles] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const target = 14892;
    const step = 300;
    const t = setInterval(() => {
      setBattles((c) => { if (c >= target) { clearInterval(t); return target; } return c + step; });
    }, 30);
    return () => clearInterval(t);
  }, []);

  const handleEnter = () => {
    setEntered(true);
    setTimeout(() => router.push("/select"), 500);
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "#050508" }}>
      {/* Wallet — top right */}
      <div className="absolute top-5 right-5 z-20">
        <WalletConnect />
      </div>

      {/* Deep background radials */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(247,147,26,0.09) 0%, transparent 65%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 50% 40% at 50% 100%, rgba(168,85,247,0.05) 0%, transparent 60%)",
        }} />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: "linear-gradient(rgba(247,147,26,1) 1px, transparent 1px), linear-gradient(90deg, rgba(247,147,26,1) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* Live ticker */}
      <div className="relative z-10 flex justify-center pt-6 md:pt-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 px-5 py-2.5 rounded-full text-xs tracking-widest uppercase"
          style={{ background: "rgba(247,147,26,0.08)", border: "1px solid rgba(247,147,26,0.2)", color: "#fb923c" }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" style={{ boxShadow: "0 0 6px #4ade80" }} />
          <motion.span
            key={tickerIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            LIVE — {TICKER[tickerIdx]}
          </motion.span>
        </motion.div>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 text-center gap-6 md:gap-8 py-8">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: entered ? 1.05 : 1, opacity: entered ? 0 : 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
        >
          <div
            className="glitch font-black tracking-tighter leading-none select-none"
            data-text="ORDVORD"
            style={{
              fontFamily: "var(--font-orbitron)",
              fontSize: "clamp(5rem, 18vw, 12rem)",
              color: "#f7931a",
              textShadow: "0 0 60px rgba(247,147,26,0.7), 0 0 120px rgba(247,147,26,0.3)",
            }}
          >
            ORDVORD
          </div>
          <div
            className="tracking-[0.4em] md:tracking-[0.6em] mt-3 uppercase text-sm md:text-base"
            style={{ fontFamily: "var(--font-orbitron)", color: "#475569", letterSpacing: "0.4em" }}
          >
            Bitcoin Ordinal Battle Arena
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex items-center gap-8 md:gap-16"
        >
          {[
            { label: "Battles Fought", val: battles.toLocaleString() },
            { label: "Ordinals Active", val: "8,441" },
            { label: "Season", val: "03" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <span
                className="text-3xl md:text-4xl font-black"
                style={{ fontFamily: "var(--font-orbitron)", color: "#f7931a" }}
              >
                {s.val}
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-widest mt-1" style={{ color: "#475569" }}>
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="w-64 md:w-96 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #f7931a88, transparent)" }}
        />

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={handleEnter}
            className="relative group px-14 md:px-20 py-5 md:py-6 text-lg md:text-xl font-black tracking-widest uppercase overflow-hidden cursor-pointer transition-transform duration-150 active:scale-95"
            style={{
              fontFamily: "var(--font-orbitron)",
              background: "linear-gradient(135deg, #f7931a, #d4790f)",
              color: "#000",
              clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
              boxShadow: "0 0 40px rgba(247,147,26,0.6), 0 0 80px rgba(247,147,26,0.2)",
            }}
          >
            <span className="relative z-10">ENTER ARENA</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-200 bg-white" />
          </button>

          {connected && address ? (
            <p className="text-xs tracking-widest" style={{ color: "#22c55e" }}>
              WALLET CONNECTED — YOUR ORDINALS LOAD IN SELECTION
            </p>
          ) : (
            <p className="text-xs tracking-widest" style={{ color: "#334155" }}>
              CONNECT WALLET TO BATTLE WITH YOUR OWN ORDINALS
            </p>
          )}
        </motion.div>

        {/* Arena feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3 mt-2"
        >
          {[
            { label: "Real Ordinals Only", sub: "Your inscriptions, your fighters" },
            { label: "PvP Matchmaking",    sub: "Real opponents, real stakes" },
            { label: "Both Ordinals Burn", sub: "Winner claims all sats" },
          ].map((p) => (
            <div
              key={p.label}
              className="flex flex-col items-center px-5 py-3 rounded-xl text-center"
              style={{ background: "rgba(247,147,26,0.05)", border: "1px solid rgba(247,147,26,0.12)" }}
            >
              <span
                className="text-sm font-black"
                style={{ fontFamily: "var(--font-orbitron)", color: "#f7931a" }}
              >
                {p.label}
              </span>
              <span className="text-[11px] mt-0.5" style={{ color: "#334155" }}>{p.sub}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom status bar */}
      <div
        className="relative z-10 border-t flex items-center justify-center px-4 gap-4 md:gap-8"
        style={{ height: 36, background: "rgba(0,0,0,0.5)", borderColor: "rgba(247,147,26,0.08)" }}
      >
        {["BLOCKCHAIN VERIFIED", "PROVABLY FAIR", "INSCRIPTIONS ON BITCOIN", "ORDVORD V1.0"].map((t, i) => (
          <span key={i} className="text-[9px] tracking-widest uppercase whitespace-nowrap" style={{ color: "#1e293b" }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
