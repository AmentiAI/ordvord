"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLaserEyes } from "@omnisat/lasereyes";
import { RARITY_COLORS, ELEMENT_ICONS, type Ordinal } from "@/lib/mockData";
import { fetchWalletInscriptions, type OrdiscanInscription } from "@/lib/ordiscan";
import StatBar from "@/components/StatBar";
import WalletConnect from "@/components/WalletConnect";

// Derive deterministic stats from an inscription number
function deriveStats(inscriptionNumber: number): Pick<Ordinal, "hp" | "atk" | "def" | "spd" | "rarity" | "element" | "special" | "specialDesc" | "glowColor"> {
  const seed = inscriptionNumber;
  const hp = 70 + (seed % 50);
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
    ["SHA-256", "Random damage 20-60"],
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

  const [selected, setSelected] = useState<Ordinal | null>(null);
  const [hovering, setHovering] = useState<Ordinal | null>(null);
  const [locked, setLocked] = useState(false);
  const [dbFighters, setDbFighters] = useState<Ordinal[]>([]);
  const [loadingFighters, setLoadingFighters] = useState(true);
  const [fightersError, setFightersError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/fighters")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load fighters (${r.status})`);
        return r.json();
      })
      .then((data: Ordinal[]) => setDbFighters(data))
      .catch((e: Error) => setFightersError(e.message))
      .finally(() => setLoadingFighters(false));
  }, []);

  const [walletInscriptions, setWalletInscriptions] = useState<OrdiscanInscription[]>([]);
  const [loadingInscriptions, setLoadingInscriptions] = useState(false);
  const [inscriptionError, setInscriptionError] = useState<string | null>(null);
  const [useWallet, setUseWallet] = useState(true);

  const preview = hovering ?? selected;

  const fetchInscriptions = useCallback(async () => {
    if (!connected || !address) return;
    setLoadingInscriptions(true);
    setInscriptionError(null);
    try {
      const data = await fetchWalletInscriptions(address);
      setWalletInscriptions(data);
    } catch (e) {
      setInscriptionError(e instanceof Error ? e.message : "Failed to load inscriptions");
      setWalletInscriptions([]);
    } finally {
      setLoadingInscriptions(false);
    }
  }, [connected, address]);

  useEffect(() => {
    if (connected) {
      setUseWallet(true);
      fetchInscriptions();
    } else {
      setUseWallet(false);
      setWalletInscriptions([]);
    }
  }, [connected, fetchInscriptions]);

  const fighters: Ordinal[] =
    connected && useWallet && walletInscriptions.length > 0
      ? walletInscriptions.map(inscriptionToOrdinal)
      : dbFighters;

  const isWalletMode = connected && useWallet && walletInscriptions.length > 0;

  const handleLock = () => {
    if (!selected) return;
    setLocked(true);
    sessionStorage.setItem("myFighter", JSON.stringify(selected));
    setTimeout(() => router.push("/lobby"), 800);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "var(--bg-void)" }}>
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 20% 30%, rgba(247, 147, 26, 0.15), transparent 50%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15), transparent 50%)",
            animation: "bgPulse 10s ease-in-out infinite",
          }}
        />
      </div>

      {/* Header */}
      <div className="glass-card border-b z-10 relative">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push("/")}
            className="btn-secondary text-xs px-4 py-2"
          >
            ← BACK
          </button>

          <div className="flex items-center gap-4">
            {connected && (
              <button
                onClick={() => setUseWallet((v) => !v)}
                className={`text-xs px-4 py-2 rounded-lg font-bold tracking-wider uppercase transition-all ${
                  useWallet 
                    ? "bg-gradient-to-r from-bitcoin-orange to-bitcoin-gold text-black" 
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {useWallet ? "⚡ MY ORDINALS" : "📦 DEMO FIGHTERS"}
              </button>
            )}
            <div className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#64748b" }}>
              Season 03 · Round 1
            </div>
          </div>

          <WalletConnect />
        </div>
      </div>

      {/* Title */}
      <div className="text-center pt-10 pb-6 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-black tracking-widest uppercase"
          style={{ 
            background: "linear-gradient(180deg, #ffb82e 0%, #f7931a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 0 40px rgba(247, 147, 26, 0.5)",
          }}
        >
          Choose Your Fighter
        </motion.h1>
        <p className="text-sm tracking-wide mt-3 font-semibold" style={{ color: "#64748b" }}>
          {isWalletMode
            ? `${walletInscriptions.length} inscription${walletInscriptions.length !== 1 ? "s" : ""} found in your wallet`
            : connected
            ? "No inscriptions found — showing demo fighters"
            : "Connect wallet to use your own Ordinals"}
        </p>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative z-10">
        {/* Fighter grid */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          {/* Loading state */}
          {(loadingFighters || loadingInscriptions) && (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="relative">
                <div className="spinner" />
                <div className="absolute inset-0 pulse-ring" style={{ borderColor: "rgba(247, 147, 26, 0.3)" }} />
              </div>
              <p className="text-sm uppercase tracking-widest font-bold" style={{ color: "#64748b" }}>
                {loadingInscriptions ? "Loading your inscriptions..." : "Loading fighters..."}
              </p>
            </div>
          )}

          {/* Error states */}
          {(fightersError || inscriptionError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card mb-6 px-6 py-4 rounded-xl flex items-center gap-4 border-2"
              style={{ borderColor: "rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.05)" }}
            >
              <span className="text-3xl">⚠️</span>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "#fca5a5" }}>
                  {fightersError || inscriptionError}
                </p>
              </div>
              {inscriptionError && (
                <button onClick={fetchInscriptions} className="btn-secondary text-xs px-4 py-2">
                  Retry
                </button>
              )}
            </motion.div>
          )}

          {/* Fighter grid */}
          {!loadingFighters && !loadingInscriptions && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
              {fighters.map((ord, i) => {
                const isSelected = selected?.id === ord.id;
                const rarityColor = RARITY_COLORS[ord.rarity];
                const ordiscanIns = walletInscriptions.find((ins) => ins.inscription_id === ord.id);
                
                return (
                  <motion.div
                    key={ord.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 120 }}
                    onClick={() => setSelected(ord)}
                    onMouseEnter={() => setHovering(ord)}
                    onMouseLeave={() => setHovering(null)}
                    className={`fighter-card cursor-pointer relative group ${isSelected ? "selected" : ""} ${ord.rarity === "Legendary" ? "legendary" : ""}`}
                  >
                    {/* Rarity stripe */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1 z-10"
                      style={{ background: rarityColor }}
                    />

                    {/* Card glow */}
                    {isSelected && (
                      <div
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{ 
                          background: `radial-gradient(ellipse at center, ${ord.glowColor}25, transparent 70%)`,
                        }}
                      />
                    )}

                    {/* Fighter visual */}
                    <div
                      className="relative flex items-center justify-center py-8 overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${ord.glowColor}15, transparent)` }}
                    >
                      {isWalletMode && ordiscanIns ? (
                        <InscriptionPreview
                          inscription={ordiscanIns}
                          glowColor={ord.glowColor}
                          floating={isSelected}
                        />
                      ) : (
                        <span className={`text-7xl ${isSelected ? "float-gentle" : ""}`}>{ord.emoji}</span>
                      )}
                      
                      {/* Holographic shine */}
                      <div className="holo-shine absolute inset-0" />
                    </div>

                    {/* Info */}
                    <div className="p-4 relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black tracking-wide truncate" style={{ color: "#e8eef7" }}>
                          {ord.name.replace("Inscription #", "#")}
                        </span>
                        <span className="text-xl flex-shrink-0">{ELEMENT_ICONS[ord.element]}</span>
                      </div>
                      
                      <div 
                        className="type-badge inline-block mb-3"
                        style={{
                          background: `linear-gradient(135deg, ${rarityColor}, ${rarityColor}aa)`,
                          color: ord.rarity === "Legendary" ? "#000" : "#fff",
                        }}
                      >
                        {ord.rarity}
                      </div>
                      
                      <div className="space-y-1.5">
                        <StatBar label="ATK" value={ord.atk} color={ord.glowColor} />
                        <StatBar label="DEF" value={ord.def} color={ord.glowColor} />
                        <StatBar label="SPD" value={ord.spd} color={ord.glowColor} />
                      </div>
                    </div>

                    {/* Selection checkmark */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black z-20"
                        style={{ background: ord.glowColor, color: "#000", boxShadow: `0 0 20px ${ord.glowColor}` }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* No fighters fallback */}
          {connected && !loadingInscriptions && !inscriptionError && walletInscriptions.length === 0 && useWallet && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-bold mb-2" style={{ color: "#64748b" }}>No Ordinals found in this wallet</p>
              <button
                onClick={() => setUseWallet(false)}
                className="btn-secondary mt-4"
              >
                Use demo fighters instead
              </button>
            </div>
          )}
        </div>

        {/* Side preview panel */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="w-full lg:w-96 flex-shrink-0 border-t lg:border-t-0 lg:border-l glass-card overflow-y-auto"
              style={{ maxHeight: "50vh", minHeight: "50vh" }}
            >
              <div className="p-6 flex flex-col gap-5">
                {/* Fighter display */}
                <div
                  className="relative rounded-2xl flex items-center justify-center overflow-hidden border-2"
                  style={{
                    height: 220,
                    background: `linear-gradient(135deg, ${preview.glowColor}20, transparent)`,
                    borderColor: `${preview.glowColor}50`,
                    boxShadow: `0 0 30px ${preview.glowColor}30`,
                  }}
                >
                  {isWalletMode ? (
                    <InscriptionPreview
                      inscription={walletInscriptions.find((ins) => ins.inscription_id === preview.id)}
                      glowColor={preview.glowColor}
                      floating
                      size="large"
                    />
                  ) : (
                    <span className="text-9xl float-gentle">{preview.emoji}</span>
                  )}
                  <div className="holo-shine absolute inset-0" />
                </div>

                {/* Details */}
                <div>
                  <h2 className="text-2xl font-black mb-1" style={{ color: "#e8eef7" }}>{preview.name}</h2>
                  <p className="text-sm font-semibold mb-3" style={{ color: "#64748b" }}>
                    Inscription #{preview.inscriptionNumber.toLocaleString()}
                  </p>
                  <div className="flex gap-3">
                    <span
                      className="type-badge"
                      style={{
                        background: `linear-gradient(135deg, ${RARITY_COLORS[preview.rarity]}, ${RARITY_COLORS[preview.rarity]}aa)`,
                        color: preview.rarity === "Legendary" ? "#000" : "#fff",
                      }}
                    >
                      {preview.rarity}
                    </span>
                    <span className="type-badge bg-slate-800 text-slate-300">
                      {ELEMENT_ICONS[preview.element]} {preview.element}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <div className="text-xs uppercase tracking-widest mb-3 font-bold" style={{ color: "#64748b" }}>
                    Combat Stats
                  </div>
                  <div className="space-y-2.5">
                    <StatBar label="HP" value={preview.hp} color="#22c55e" />
                    <StatBar label="ATK" value={preview.atk} color={preview.glowColor} />
                    <StatBar label="DEF" value={preview.def} color={preview.glowColor} />
                    <StatBar label="SPD" value={preview.spd} color={preview.glowColor} />
                  </div>
                </div>

                {/* Special move */}
                <div
                  className="glass-card rounded-2xl p-5 border-2"
                  style={{
                    borderColor: `${preview.glowColor}30`,
                    background: `linear-gradient(135deg, ${preview.glowColor}10, transparent)`,
                  }}
                >
                  <div className="text-xs uppercase tracking-widest mb-2 font-bold" style={{ color: "#64748b" }}>
                    Special Move
                  </div>
                  <div className="text-lg font-black mb-1" style={{ color: preview.glowColor }}>
                    ⚡ {preview.special}
                  </div>
                  <div className="text-sm" style={{ color: "#94a3b8" }}>{preview.specialDesc}</div>
                </div>

                {/* Action button */}
                {selected && selected.id === preview.id ? (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLock}
                    disabled={locked}
                    className={`btn-primary w-full ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{
                      clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                    }}
                  >
                    {locked ? "ENTERING ARENA..." : "⚔️ GO TO BATTLE"}
                  </motion.button>
                ) : (
                  <button
                    onClick={() => setSelected(preview)}
                    className="btn-secondary w-full"
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

  if (!inscription) return <span className="text-6xl opacity-40">🖼️</span>;

  const isImage = inscription.content_type?.startsWith("image/");
  const px = size === "large" ? "w-40 h-40" : "w-24 h-24";

  if (!imgError && isImage) {
    return (
      <img
        src={inscription.content_url}
        alt={`Inscription #${inscription.inscription_number}`}
        className={`${px} object-contain rounded-xl ${floating ? "float-gentle" : ""}`}
        style={{ filter: `drop-shadow(0 0 20px ${glowColor})` }}
        loading="lazy"
        decoding="async"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${px} rounded-2xl flex flex-col items-center justify-center border-2 ${floating ? "float-gentle" : ""}`}
      style={{
        background: `linear-gradient(135deg, ${glowColor}30, transparent)`,
        borderColor: `${glowColor}50`,
        filter: `drop-shadow(0 0 20px ${glowColor}50)`,
      }}
    >
      <span className="text-xs uppercase tracking-widest font-bold" style={{ color: glowColor }}>ORD</span>
      <span className="font-black text-lg" style={{ color: "#e8eef7" }}>
        #{inscription.inscription_number.toLocaleString()}
      </span>
    </div>
  );
}
