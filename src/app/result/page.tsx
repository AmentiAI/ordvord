"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { type Ordinal } from "@/lib/mockData";

// Sats payout: both ordinals burned, winner claims all (~625 after gas)
const SATS_PAYOUT = 625;

export default function ResultPage() {
  const router = useRouter();
  const [myFighter, setMyFighter] = useState<Ordinal | null>(null);
  const [opponent, setOpponent] = useState<Ordinal | null>(null);
  const [isWinner, setIsWinner] = useState(false);

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

  const winner = isWinner ? myFighter : opponent;
  const loser = isWinner ? opponent : myFighter;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#050508" }}
    >
      {/* BG radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isWinner
            ? "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(247,147,26,0.08) 0%, transparent 70%)"
            : "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(239,68,68,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 md:gap-8 px-4 text-center max-w-lg w-full">

        {/* Result banner */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <div
            className="text-6xl md:text-8xl font-black tracking-widest"
            style={{
              color: isWinner ? "#f7931a" : "#ef4444",
              textShadow: `0 0 60px ${isWinner ? "rgba(247,147,26,0.8)" : "rgba(239,68,68,0.8)"}`,
            }}
          >
            {isWinner ? "VICTORY" : "DEFEATED"}
          </div>
          <div className="text-xs tracking-widest mt-2 uppercase" style={{ color: "#334155" }}>
            Both ordinals burned — inscriptions destroyed forever
          </div>
        </motion.div>

        {/* Both fighters burned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-6 w-full"
        >
          <BurnedFighter fighter={myFighter} label="YOU" isWinner={isWinner} />
          <div className="flex flex-col items-center gap-1">
            <div className="text-2xl font-black" style={{ color: "#1e293b" }}>VS</div>
          </div>
          <BurnedFighter fighter={opponent} label="OPPONENT" isWinner={!isWinner} />
        </motion.div>

        {/* Divider */}
        <div
          className="w-48 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${isWinner ? "#f7931a" : "#ef4444"}, transparent)` }}
        />

        {/* Outcome */}
        {isWinner ? (
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
            <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
              Sats Claimed
            </div>
            <div className="text-5xl font-black" style={{ color: "#f7931a" }}>
              +{SATS_PAYOUT}
            </div>
            <div className="text-xs mt-1 uppercase tracking-widest" style={{ color: "#334155" }}>
              sats sent to your wallet
            </div>
            <div className="text-[10px] mt-3 uppercase tracking-widest" style={{ color: "#1e293b" }}>
              {winner.name} #{winner.inscriptionNumber.toLocaleString()} · burned
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full rounded-xl p-5"
            style={{
              background: "rgba(239,68,68,0.04)",
              border: "1px solid rgba(239,68,68,0.12)",
            }}
          >
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#475569" }}>
              Result
            </div>
            <div className="text-lg font-black" style={{ color: "#ef4444" }}>
              Your ordinal was burned
            </div>
            <div className="text-xs mt-1" style={{ color: "#334155" }}>
              {winner.name} claimed {SATS_PAYOUT} sats
            </div>
            <div className="text-[10px] mt-3 uppercase tracking-widest" style={{ color: "#1e293b" }}>
              #{myFighter.inscriptionNumber.toLocaleString()} · permanently destroyed
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex gap-3 md:gap-4 w-full"
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
            FIGHT AGAIN
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
            MAIN MENU
          </button>
        </motion.div>

        {/* TX badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-[10px] tracking-widest uppercase"
          style={{ color: "#1e293b" }}
        >
          OP_RETURN · BOTH INSCRIPTIONS BURNED ON-CHAIN
        </motion.div>
      </div>
    </div>
  );
}

function BurnedFighter({ fighter, label, isWinner }: { fighter: Ordinal; label: string; isWinner: boolean }) {
  const [imgError, setImgError] = useState(false);
  const isImage = fighter.contentType?.startsWith("image/");

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {isImage && fighter.contentUrl && !imgError ? (
          <img
            src={fighter.contentUrl}
            alt={fighter.name}
            className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-xl"
            style={{
              filter: "grayscale(1) brightness(0.4)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
            loading="eager"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="text-6xl md:text-7xl"
            style={{ filter: "grayscale(1) brightness(0.4)" }}
          >
            {fighter.emoji}
          </div>
        )}
        {/* BURNED overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl"
          style={{ background: "rgba(239,68,68,0.15)" }}
        >
          <span
            className="text-[9px] font-black tracking-widest rotate-[-15deg]"
            style={{ color: "#ef4444", textShadow: "0 0 8px rgba(239,68,68,0.8)" }}
          >
            BURNED
          </span>
        </div>
      </div>
      <div className="text-[9px] uppercase tracking-widest" style={{ color: isWinner ? "#f7931a" : "#475569" }}>
        {label}
      </div>
      <div className="text-[10px] font-bold" style={{ color: isWinner ? "#e2e8f0" : "#334155" }}>
        {fighter.name}
      </div>
    </div>
  );
}
