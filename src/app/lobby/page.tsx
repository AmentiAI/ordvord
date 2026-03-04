"use client";

import { useEffect, useState, useRef, type JSX } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { type Ordinal } from "@/lib/mockData";

const SEARCH_MESSAGES = [
  "Scanning blockchain...",
  "Scanning blockchain...",
  "Finding opponent...",
  "Finding opponent...",
  "Matching skill levels...",
  "Opponent found!",
];

async function pickOpponent(myId: string): Promise<Ordinal> {
  const res = await fetch(`/api/fighters?exclude=${myId}`);
  if (!res.ok) throw new Error(`Failed to load opponents (${res.status})`);
  const fighters: Ordinal[] = await res.json();
  if (!fighters.length) throw new Error("No opponents available");
  return fighters[Math.floor(Math.random() * fighters.length)];
}

export default function LobbyPage() {
  const router = useRouter();
  const [myFighter, setMyFighter] = useState<Ordinal | null>(null);
  const [opponent, setOpponent] = useState<Ordinal | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [dots, setDots] = useState(".");
  const [phase, setPhase] = useState<"searching" | "found">("searching");
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("myFighter");
    if (!stored) { router.push("/select"); return; }
    const fighter: Ordinal = JSON.parse(stored);
    setMyFighter(fighter);

    // Cycle messages
    let i = 0;
    const msgTimer = setInterval(() => {
      i++;
      if (i < SEARCH_MESSAGES.length) {
        setMsgIdx(i);
      } else {
        clearInterval(msgTimer);
      }
    }, 1000);

    // Reveal opponent after 4s
    timerRef.current = setTimeout(async () => {
      try {
        const opp = await pickOpponent(fighter.id);
        sessionStorage.setItem("opponent", JSON.stringify(opp));
        setOpponent(opp);
        setPhase("found");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to find opponent");
      }
    }, 4000);

    return () => {
      clearInterval(msgTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router]);

  // Blinking dots
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 400);
    return () => clearInterval(t);
  }, []);

  // Countdown after opponent found
  useEffect(() => {
    if (phase !== "found") return;
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          router.push("/battle");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, router]);

  if (!myFighter) return null;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050508" }}>
        <div className="text-center px-6">
          <div className="text-2xl font-black mb-2" style={{ color: "#ef4444" }}>CONNECTION ERROR</div>
          <div className="text-sm mb-6" style={{ color: "#475569" }}>{error}</div>
          <button
            onClick={() => router.push("/select")}
            className="px-6 py-3 font-bold text-sm tracking-widest uppercase cursor-pointer"
            style={{ background: "rgba(247,147,26,0.1)", color: "#f7931a", border: "1px solid rgba(247,147,26,0.2)", borderRadius: 4 }}
          >
            BACK TO SELECT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#050508" }}
    >
      {/* Grid BG */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(247,147,26,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(247,147,26,0.2) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center gap-8">
        {/* Status header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={msgIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-lg font-bold tracking-widest uppercase"
              style={{ color: phase === "found" ? "#22c55e" : "#f7931a" }}
            >
              {phase === "found" ? "⚡ OPPONENT FOUND!" : SEARCH_MESSAGES[msgIdx]}
              {phase !== "found" && (
                <span className="blink-cursor" style={{ color: "#f7931a" }}>{dots}</span>
              )}
            </motion.div>
          </AnimatePresence>

          {phase === "found" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm mt-1"
              style={{ color: "#64748b" }}
            >
              Battle starts in{" "}
              <span className="font-black" style={{ color: "#f7931a" }}>{countdown}</span>
              {countdown === 1 ? " second" : " seconds"}...
            </motion.div>
          )}
        </motion.div>

        {/* VS layout */}
        <div className="w-full flex items-center justify-between gap-4">
          {/* My fighter */}
          <motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            className="flex-1 flex flex-col items-center gap-4"
          >
            <FighterCard fighter={myFighter} label="YOU" align="left" />
          </motion.div>

          {/* VS */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="text-4xl font-black"
              style={{
                color: "#f7931a",
                textShadow: "0 0 30px rgba(247,147,26,0.8)",
              }}
            >
              VS
            </motion.div>

            {/* Spinning ring while searching */}
            {phase === "searching" && (
              <div className="relative w-12 h-12">
                <div
                  className="absolute inset-0 rounded-full border-2 border-transparent spin-slow"
                  style={{ borderTopColor: "#f7931a" }}
                />
                <div
                  className="absolute inset-1 rounded-full border-2 border-transparent"
                  style={{
                    borderBottomColor: "#06b6d4",
                    animation: "spin 2s linear infinite reverse",
                  }}
                />
              </div>
            )}

            {phase === "found" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="text-2xl"
              >
                ⚔️
              </motion.div>
            )}
          </div>

          {/* Opponent */}
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            className="flex-1 flex flex-col items-center gap-4"
          >
            <AnimatePresence mode="wait">
              {phase === "searching" ? (
                <OpponentSkeleton key="skeleton" />
              ) : (
                opponent && <FighterCard key="opponent" fighter={opponent} label="OPPONENT" align="right" />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Inscription details */}
        {phase === "found" && opponent && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-8 text-center"
          >
            {[
              { label: "Your HP", val: myFighter.hp, color: "#22c55e" },
              { label: "Your ATK", val: myFighter.atk, color: "#f7931a" },
              { label: "", val: null, color: "" },
              { label: "Opp HP", val: opponent.hp, color: "#22c55e" },
              { label: "Opp ATK", val: opponent.atk, color: "#ef4444" },
            ].map((s, i) =>
              s.val !== null ? (
                <div key={i} className="flex flex-col">
                  <span className="text-xl font-black" style={{ color: s.color }}>{s.val}</span>
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>{s.label}</span>
                </div>
              ) : (
                <div key={i} className="w-4" />
              )
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function FighterAvatar({ fighter }: { fighter: Ordinal }): JSX.Element {
  const [imgError, setImgError] = useState(false);
  const isImage = fighter.contentType?.startsWith("image/");

  if (fighter.contentUrl && isImage && !imgError) {
    return (
      <img
        src={fighter.contentUrl}
        alt={fighter.name}
        className="w-full h-full object-contain rounded-lg float-anim"
        style={{ filter: `drop-shadow(0 0 10px ${fighter.glowColor})` }}
        loading="eager"
        decoding="async"
        onError={() => setImgError(true)}
      />
    );
  }
  return <span className="text-5xl float-anim">{fighter.emoji}</span>;
}

function FighterCard({ fighter, label, align }: { fighter: Ordinal; label: string; align: "left" | "right" }) {
  return (
    <div className={`flex flex-col ${align === "right" ? "items-end" : "items-start"} gap-2 w-full`}>
      <div
        className="text-[10px] tracking-widest uppercase font-bold px-2 py-0.5 rounded"
        style={{ background: "rgba(247,147,26,0.15)", color: "#f7931a" }}
      >
        {label}
      </div>
      <div
        className="w-full rounded-xl p-4 flex flex-col gap-3"
        style={{
          background: `linear-gradient(135deg, ${fighter.glowColor}12, #0d0d14)`,
          border: `1px solid ${fighter.glowColor}33`,
          boxShadow: `0 0 20px ${fighter.glowColor}22`,
        }}
      >
        <div className={`flex items-center gap-4 ${align === "right" ? "flex-row-reverse" : ""}`}>
          <div
            className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${fighter.glowColor}15`, border: `1px solid ${fighter.glowColor}33` }}
          >
            <FighterAvatar fighter={fighter} />
          </div>
          <div className={align === "right" ? "text-right" : ""}>
            <div className="font-black text-base" style={{ color: "#e2e8f0" }}>{fighter.name}</div>
            <div className="text-[10px]" style={{ color: "#334155" }}>#{fighter.inscriptionNumber.toLocaleString()}</div>
            <div className="text-xs mt-1" style={{ color: fighter.glowColor }}>
              ⚡ {fighter.special}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "HP", val: fighter.hp, color: "#22c55e" },
            { label: "ATK", val: fighter.atk, color: "#f7931a" },
            { label: "DEF", val: fighter.def, color: "#3b82f6" },
            { label: "SPD", val: fighter.spd, color: "#a855f7" },
          ].map((s) => (
            <div key={s.label} className="rounded p-1.5" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-lg font-black" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[9px] uppercase tracking-widest" style={{ color: "#334155" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OpponentSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full rounded-xl p-4 flex flex-col gap-3"
      style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center"
          style={{ background: "#1a1a24" }}
        >
          <span className="text-2xl opacity-30 spin-slow">⚙️</span>
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded animate-pulse" style={{ background: "#1a1a24", width: "70%" }} />
          <div className="h-3 rounded animate-pulse" style={{ background: "#1a1a24", width: "45%" }} />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 rounded animate-pulse"
            style={{ background: "#1a1a24", animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}
