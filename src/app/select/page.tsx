"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLaserEyes } from "@omnisat/lasereyes";
import { RARITY_COLORS, ELEMENT_ICONS, type Ordinal } from "@/lib/mockData";
import { fetchWalletInscriptions, type OrdiscanInscription } from "@/lib/ordiscan";
import StatBar from "@/components/StatBar";
import WalletConnect from "@/components/WalletConnect";

// Derive deterministic stats from inscription number
function deriveStats(inscriptionNumber: number): Pick<Ordinal, "hp" | "atk" | "def" | "spd" | "rarity" | "element" | "special" | "specialDesc" | "glowColor"> {
  const seed = inscriptionNumber;
  const hp  = 70 + (seed % 50);
  const atk = 60 + ((seed * 3) % 40);
  const def = 55 + ((seed * 7) % 40);
  const spd = 60 + ((seed * 11) % 40);

  const rarities: Ordinal["rarity"][] = ["Legendary", "Epic", "Rare", "Uncommon"];
  const rarity = rarities[seed % rarities.length];

  const elements: Ordinal["element"][] = ["fire", "shadow", "lightning", "ice", "void", "gold"];
  const element = elements[(seed * 3) % elements.length];

  const specials = [
    ["Death Strike", "Deal 40 damage to opponent"],
    ["Chain Blast", "Hit for 30, reduce enemy DEF"],
    ["Diamond Hands", "Block + restore 20 HP"],
    ["LN Strike", "Always attacks first"],
    ["Cold Storage", "Freeze opponent 1 turn"],
    ["SHA-256", "Random damage 20–60"],
  ];
  const [special, specialDesc] = specials[(seed * 5) % specials.length];

  const glows = ["#a855f7", "#f97316", "#f59e0b", "#06b6d4", "#38bdf8", "#10b981"];
  const glowColor = glows[seed % glows.length];

  return { hp, atk, def, spd, rarity, element, special, specialDesc, glowColor };
}

function inscriptionToOrdinal(ins: OrdiscanInscription): Ordinal {
  const stats = deriveStats(ins.inscription_number);
  return {
    id: ins.inscription_id,
    inscriptionNumber: ins.inscription_number,
    name: `Inscription #${ins.inscription_number.toLocaleString()}`,
    emoji: "🖼️",
    bgGradient: "from-purple-950 to-black",
    contentUrl: ins.content_url,
    contentType: ins.content_type,
    ...stats,
  };
}

export default function SelectPage() {
  const router = useRouter();
  const { connected, address } = useLaserEyes();

  const [selected, setSelected]   = useState<Ordinal | null>(null);
  const [hovering, setHovering]   = useState<Ordinal | null>(null);
  const [locked, setLocked]       = useState(false);

  const [inscriptions, setInscriptions]       = useState<OrdiscanInscription[]>([]);
  const [loadingInscriptions, setLoading]     = useState(false);
  const [inscriptionError, setError]          = useState<string | null>(null);

  const preview  = hovering ?? selected;
  const fighters = inscriptions.map(inscriptionToOrdinal);

  const fetchInscriptions = useCallback(async () => {
    if (!connected || !address) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWalletInscriptions(address);
      setInscriptions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load inscriptions");
      setInscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [connected, address]);

  useEffect(() => {
    if (connected) {
      fetchInscriptions();
    } else {
      setInscriptions([]);
      setSelected(null);
    }
  }, [connected, fetchInscriptions]);

  const handleLock = () => {
    if (!selected) return;
    setLocked(true);
    sessionStorage.setItem("myFighter", JSON.stringify(selected));
    setTimeout(() => router.push("/lobby"), 700);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050508" }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: "rgba(247,147,26,0.12)", background: "rgba(3,3,6,0.95)" }}
      >
        <button
          onClick={() => router.push("/")}
          className="text-xs tracking-widest uppercase cursor-pointer transition-opacity hover:opacity-60 font-bold"
          style={{ fontFamily: "var(--font-orbitron)", color: "#475569" }}
        >
          ← BACK
        </button>
        <div className="text-xs tracking-widest uppercase" style={{ fontFamily: "var(--font-orbitron)", color: "#334155" }}>
          Season 03
        </div>
        <WalletConnect />
      </div>

      {/* Title */}
      <div className="text-center pt-8 pb-5 px-4 shrink-0">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black tracking-widest uppercase"
          style={{
            fontFamily: "var(--font-orbitron)",
            color: "#f7931a",
            textShadow: "0 0 40px rgba(247,147,26,0.45)",
          }}
        >
          Choose Your Fighter
        </motion.h1>
        <p className="text-xs tracking-widest mt-3 uppercase" style={{ color: "#334155" }}>
          {!connected
            ? "Connect your wallet to load your Ordinals"
            : loadingInscriptions
            ? "Loading your inscriptions..."
            : inscriptions.length > 0
            ? `${inscriptions.length} inscription${inscriptions.length !== 1 ? "s" : ""} in your wallet`
            : "No Ordinals found in this wallet"}
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">

        {/* Left — grid or states */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto min-h-0">

          {/* NOT CONNECTED */}
          {!connected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full py-20 gap-8 text-center"
            >
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl"
                style={{ background: "rgba(247,147,26,0.08)", border: "1px solid rgba(247,147,26,0.2)" }}
              >
                ₿
              </div>
              <div>
                <div
                  className="text-2xl md:text-3xl font-black mb-3"
                  style={{ fontFamily: "var(--font-orbitron)", color: "#e2e8f0" }}
                >
                  Wallet Required
                </div>
                <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: "#475569" }}>
                  Connect your Bitcoin wallet to load your Ordinal inscriptions and enter the arena.
                </p>
              </div>
              <WalletConnect />
            </motion.div>
          )}

          {/* LOADING */}
          {connected && loadingInscriptions && (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-5">
              <div
                className="w-12 h-12 rounded-full border-2 border-transparent spin-slow"
                style={{ borderTopColor: "#f7931a" }}
              />
              <p className="text-sm tracking-widest uppercase" style={{ color: "#475569" }}>
                Loading your inscriptions...
              </p>
            </div>
          )}

          {/* ERROR */}
          {connected && inscriptionError && (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-5 text-center">
              <div className="text-4xl">⚠️</div>
              <div className="text-sm max-w-xs" style={{ color: "#fca5a5" }}>{inscriptionError}</div>
              <button
                onClick={fetchInscriptions}
                className="px-6 py-3 text-xs font-bold tracking-widest uppercase cursor-pointer rounded"
                style={{ background: "rgba(247,147,26,0.1)", color: "#f7931a", border: "1px solid rgba(247,147,26,0.2)" }}
              >
                RETRY
              </button>
            </div>
          )}

          {/* NO ORDINALS */}
          {connected && !loadingInscriptions && !inscriptionError && inscriptions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full py-20 gap-6 text-center"
            >
              <div className="text-5xl opacity-20">🖼️</div>
              <div>
                <div
                  className="text-xl font-black mb-2"
                  style={{ fontFamily: "var(--font-orbitron)", color: "#334155" }}
                >
                  No Ordinals Found
                </div>
                <p className="text-sm" style={{ color: "#1e293b" }}>
                  This wallet has no Bitcoin inscriptions.
                </p>
              </div>
            </motion.div>
          )}

          {/* FIGHTER GRID */}
          {connected && !loadingInscriptions && fighters.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 max-w-6xl mx-auto">
              {fighters.map((ord, i) => {
                const isSelected  = selected?.id === ord.id;
                const rarityColor = RARITY_COLORS[ord.rarity];
                const ins = inscriptions.find((x) => x.inscription_id === ord.id);
                return (
                  <motion.div
                    key={ord.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelected(ord)}
                    onMouseEnter={() => setHovering(ord)}
                    onMouseLeave={() => setHovering(null)}
                    className="relative cursor-pointer rounded-xl overflow-hidden card-hover"
                    style={{
                      background: "#0d0d14",
                      border: `1px solid ${isSelected ? ord.glowColor : "rgba(255,255,255,0.07)"}`,
                      boxShadow: isSelected ? `0 0 30px ${ord.glowColor}44, 0 0 60px ${ord.glowColor}18` : "none",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ background: rarityColor }} />

                    {isSelected && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse at center, ${ord.glowColor}12, transparent 70%)` }}
                      />
                    )}

                    {/* Visual */}
                    <div
                      className="relative flex items-center justify-center py-8 overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${ord.glowColor}12, transparent)` }}
                    >
                      <InscriptionPreview
                        inscription={ins}
                        glowColor={ord.glowColor}
                        floating={isSelected}
                      />
                    </div>

                    {/* Info */}
                    <div className="px-4 pb-4 pt-2">
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span
                          className="text-sm font-black leading-tight"
                          style={{ fontFamily: "var(--font-orbitron)", color: "#e2e8f0" }}
                        >
                          {ord.name}
                        </span>
                        <span className="text-base shrink-0">{ELEMENT_ICONS[ord.element]}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                          style={{ background: `${rarityColor}18`, color: rarityColor, border: `1px solid ${rarityColor}40` }}
                        >
                          {ord.rarity}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <StatBar label="ATK" value={ord.atk} color={ord.glowColor} />
                        <StatBar label="DEF" value={ord.def} color={ord.glowColor} />
                        <StatBar label="SPD" value={ord.spd} color={ord.glowColor} />
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                        style={{ background: ord.glowColor, color: "#000" }}
                      >
                        ✓
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — detail panel */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.18 }}
              className="w-full md:w-80 lg:w-96 shrink-0 border-t md:border-t-0 md:border-l flex flex-col overflow-y-auto"
              style={{ borderColor: "rgba(247,147,26,0.1)", background: "rgba(2,2,6,0.8)" }}
            >
              <div className="p-5 md:p-6 flex flex-col gap-5 flex-1">

                {/* Fighter preview */}
                <div
                  className="relative rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{
                    height: 220,
                    background: `linear-gradient(135deg, ${preview.glowColor}15, #08080f)`,
                    border: `1px solid ${preview.glowColor}30`,
                  }}
                >
                  <InscriptionPreview
                    inscription={inscriptions.find((x) => x.inscription_id === preview.id)}
                    glowColor={preview.glowColor}
                    floating
                    size="large"
                  />
                  <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: `inset 0 0 50px ${preview.glowColor}12` }} />
                </div>

                {/* Name + meta */}
                <div>
                  <h2
                    className="text-2xl font-black leading-tight"
                    style={{ fontFamily: "var(--font-orbitron)", color: "#f1f5f9" }}
                  >
                    {preview.name}
                  </h2>
                  <div className="flex gap-2 mt-3">
                    <span
                      className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider"
                      style={{
                        background: `${RARITY_COLORS[preview.rarity]}18`,
                        color: RARITY_COLORS[preview.rarity],
                        border: `1px solid ${RARITY_COLORS[preview.rarity]}40`,
                      }}
                    >
                      {preview.rarity}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full capitalize" style={{ background: "#1a1a26", color: "#64748b" }}>
                      {ELEMENT_ICONS[preview.element]} {preview.element}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2.5">
                  <div className="text-[11px] uppercase tracking-widest" style={{ color: "#334155" }}>Stats</div>
                  <StatBar label="HP"  value={preview.hp}  color="#22c55e" />
                  <StatBar label="ATK" value={preview.atk} color={preview.glowColor} />
                  <StatBar label="DEF" value={preview.def} color={preview.glowColor} />
                  <StatBar label="SPD" value={preview.spd} color={preview.glowColor} />
                </div>

                {/* Special */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: `${preview.glowColor}0e`, border: `1px solid ${preview.glowColor}25` }}
                >
                  <div className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "#475569" }}>Special Move</div>
                  <div
                    className="text-base font-black"
                    style={{ fontFamily: "var(--font-orbitron)", color: preview.glowColor }}
                  >
                    {preview.special}
                  </div>
                  <div className="text-sm mt-1" style={{ color: "#64748b" }}>{preview.specialDesc}</div>
                </div>

                <div className="flex-1" />

                {/* Action */}
                {selected?.id === preview.id ? (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLock}
                    disabled={locked}
                    className="w-full py-5 font-black text-base tracking-widest uppercase cursor-pointer transition-all disabled:opacity-40"
                    style={{
                      fontFamily: "var(--font-orbitron)",
                      background: locked ? "#1a1a26" : `linear-gradient(135deg, ${preview.glowColor}, ${preview.glowColor}cc)`,
                      color: locked ? "#475569" : "#000",
                      clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
                      boxShadow: locked ? "none" : `0 0 30px ${preview.glowColor}55, 0 0 60px ${preview.glowColor}22`,
                    }}
                  >
                    {locked ? "ENTERING ARENA..." : "GO TO BATTLE"}
                  </motion.button>
                ) : (
                  <button
                    onClick={() => setSelected(preview)}
                    className="w-full py-4 font-black text-sm tracking-widest uppercase cursor-pointer transition-all active:scale-95 hover:opacity-80 rounded-lg"
                    style={{
                      fontFamily: "var(--font-orbitron)",
                      background: "rgba(247,147,26,0.07)",
                      color: "#f7931a",
                      border: "1px solid rgba(247,147,26,0.25)",
                    }}
                  >
                    SELECT FIGHTER
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

function InscriptionPreview({
  inscription,
  glowColor,
  floating = false,
  size = "normal",
}: {
  inscription: OrdiscanInscription | undefined;
  glowColor: string;
  floating?: boolean;
  size?: "normal" | "large";
}) {
  const [imgError, setImgError] = useState(false);

  if (!inscription) {
    return (
      <div className="flex flex-col items-center gap-2 opacity-30">
        <span className="text-4xl">🖼️</span>
      </div>
    );
  }

  const isImage = inscription.content_type?.startsWith("image/");
  const dim = size === "large" ? "w-36 h-36" : "w-24 h-24";

  if (!imgError && isImage) {
    return (
      <img
        src={inscription.content_url}
        alt={`Inscription #${inscription.inscription_number}`}
        className={`${dim} object-contain rounded-xl ${floating ? "float-anim" : ""}`}
        style={{ filter: `drop-shadow(0 0 16px ${glowColor})` }}
        loading="lazy"
        decoding="async"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-xl flex flex-col items-center justify-center gap-1 ${floating ? "float-anim" : ""}`}
      style={{
        background: `linear-gradient(135deg, ${glowColor}20, transparent)`,
        border: `1px solid ${glowColor}40`,
        filter: `drop-shadow(0 0 12px ${glowColor}44)`,
      }}
    >
      <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: glowColor }}>ORD</span>
      <span className="font-black text-sm" style={{ color: "#e2e8f0" }}>
        #{inscription.inscription_number.toLocaleString()}
      </span>
    </div>
  );
}
