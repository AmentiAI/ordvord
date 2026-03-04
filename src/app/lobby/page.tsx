"use client";

import { useEffect, useState, useRef, useCallback, type JSX } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLaserEyes } from "@omnisat/lasereyes";
import { type Ordinal } from "@/lib/mockData";

function getPlayerId(walletAddress: string | undefined): string {
  if (walletAddress) return walletAddress;
  const key = "ordvord_player_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export default function LobbyPage() {
  const router = useRouter();
  const { address } = useLaserEyes();
  const [myFighter, setMyFighter] = useState<Ordinal | null>(null);
  const [opponent, setOpponent] = useState<Ordinal | null>(null);
  const [phase, setPhase] = useState<"searching" | "found" | "error">("searching");
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [waitSeconds, setWaitSeconds] = useState(0);

  const queueIdRef = useRef<string | null>(null);
  const playerIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (waitTimerRef.current) { clearInterval(waitTimerRef.current); waitTimerRef.current = null; }
  };

  const handleMatched = useCallback((oppFighter: Ordinal) => {
    stopPolling();
    sessionStorage.setItem("opponent", JSON.stringify(oppFighter));
    setOpponent(oppFighter);
    setPhase("found");
  }, []);

  const poll = useCallback(async () => {
    const queueId = queueIdRef.current;
    const playerId = playerIdRef.current;
    if (!queueId || !playerId || cancelledRef.current) return;

    try {
      const res = await fetch(`/api/matchmaking/status?queue_id=${queueId}&player_id=${playerId}`);
      const data = await res.json();

      if (data.status === "matched" && data.opponent) {
        handleMatched(data.opponent as Ordinal);
      } else if (data.status === "cancelled" || !res.ok) {
        stopPolling();
        setError(data.error ?? "Match was cancelled");
        setPhase("error");
      }
    } catch {
      // network blip — keep polling
    }
  }, [handleMatched]);

  useEffect(() => {
    const stored = sessionStorage.getItem("myFighter");
    if (!stored) { router.push("/select"); return; }
    const fighter: Ordinal = JSON.parse(stored);
    setMyFighter(fighter);

    const playerId = getPlayerId(address ?? undefined);
    playerIdRef.current = playerId;
    cancelledRef.current = false;

    (async () => {
      try {
        const res = await fetch("/api/matchmaking/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player_id: playerId, fighter_data: fighter }),
        });
        if (!res.ok) throw new Error(`Join failed (${res.status})`);
        const data = await res.json();

        if (cancelledRef.current) return;

        if (data.matched && data.opponent) {
          queueIdRef.current = data.queue_id;
          handleMatched(data.opponent as Ordinal);
        } else {
          queueIdRef.current = data.queue_id;
          // Start wait timer
          waitTimerRef.current = setInterval(() => setWaitSeconds((s) => s + 1), 1000);
          // Poll for match every 2s
          pollRef.current = setInterval(poll, 2000);
        }
      } catch (e) {
        if (!cancelledRef.current) {
          setError(e instanceof Error ? e.message : "Failed to join matchmaking");
          setPhase("error");
        }
      }
    })();

    return () => {
      cancelledRef.current = true;
      stopPolling();
      // Cancel the queue entry if still searching
      const queueId = queueIdRef.current;
      if (queueId) {
        fetch("/api/matchmaking/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queue_id: queueId }),
        }).catch(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-bind poll when it updates (captures latest handleMatched)
  useEffect(() => {
    if (phase !== "searching" || !queueIdRef.current) return;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = setInterval(poll, 2000);
    }
  }, [poll, phase]);

  // Countdown after match found
  useEffect(() => {
    if (phase !== "found") return;
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); router.push("/battle"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, router]);

  if (!myFighter) return null;

  if (phase === "error") {
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
        <div className="text-center">
          <AnimatePresence mode="wait">
            {phase === "found" ? (
              <motion.div
                key="found"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-bold tracking-widest uppercase"
                style={{ color: "#22c55e" }}
              >
                OPPONENT FOUND
              </motion.div>
            ) : (
              <motion.div
                key="searching"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-bold tracking-widest uppercase"
                style={{ color: "#f7931a" }}
              >
                FINDING OPPONENT
                <BlinkDots />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm mt-1"
            style={{ color: "#334155" }}
          >
            {phase === "found"
              ? `Battle starts in ${countdown} second${countdown !== 1 ? "s" : ""}...`
              : `Waiting for a real player — ${waitSeconds}s`}
          </motion.div>
        </div>

        {/* VS layout */}
        <div className="w-full flex items-center justify-between gap-4">
          {/* My fighter */}
          <motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            className="flex-1"
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
              style={{ color: "#f7931a", textShadow: "0 0 30px rgba(247,147,26,0.8)" }}
            >
              VS
            </motion.div>

            {phase === "searching" && (
              <div className="relative w-12 h-12">
                <div
                  className="absolute inset-0 rounded-full border-2 border-transparent spin-slow"
                  style={{ borderTopColor: "#f7931a" }}
                />
                <div
                  className="absolute inset-1 rounded-full border-2 border-transparent"
                  style={{ borderBottomColor: "#06b6d4", animation: "spin 2s linear infinite reverse" }}
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
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {phase === "searching" ? (
                <OpponentSkeleton key="skeleton" />
              ) : (
                opponent && <FighterCard key="opponent" fighter={opponent} label="OPPONENT" align="right" />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats comparison */}
        {phase === "found" && opponent && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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

        {/* Cancel button while searching */}
        {phase === "searching" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => router.push("/select")}
            className="text-xs tracking-widest uppercase cursor-pointer transition-opacity hover:opacity-70 px-4 py-2 rounded"
            style={{ color: "#334155", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            CANCEL SEARCH
          </motion.button>
        )}
      </div>
    </div>
  );
}

function BlinkDots() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 400);
    return () => clearInterval(t);
  }, []);
  return <span style={{ color: "#f7931a" }}>{dots}</span>;
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
            <div className="text-xs mt-1" style={{ color: fighter.glowColor }}>⚡ {fighter.special}</div>
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
          <span className="text-2xl opacity-20 spin-slow">⚙️</span>
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded animate-pulse" style={{ background: "#1a1a24", width: "70%" }} />
          <div className="h-3 rounded animate-pulse" style={{ background: "#1a1a24", width: "45%" }} />
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "#1e293b" }}>
            Scanning for players...
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded animate-pulse" style={{ background: "#1a1a24", animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </motion.div>
  );
}
