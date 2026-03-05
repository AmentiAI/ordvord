"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLaserEyes } from "@omnisat/lasereyes";
import { RARITY_COLORS, ELEMENT_ICONS, type Ordinal } from "@/lib/mockData";
import { fetchWalletInscriptions, type OrdiscanInscription } from "@/lib/ordiscan";
import StatBar from "@/components/StatBar";
import WalletConnect from "@/components/WalletConnect";

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

  const [selected, setSelected] = useState<Ordinal | null>(null);
  const [hovering, setHovering] = useState<Ordinal | null>(null);
  const [locked, setLocked] = useState(false);

  const [inscriptions, setInscriptions] = useState<OrdiscanInscription[]>([]);
  const [loadingInscriptions, setLoading] = useState(false);
  const [inscriptionError, setError] = useState<string | null>(null);

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
          <button onClick={() => router.push("/")} className="btn-secondary text-xs px-4 py-2">
            ← BACK
          </button>
          <div className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#64748b" }}>
            Season 03
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
            fontFamily: "var(--font-orbitron)",
            background: "linear-gradient(180deg, #ffb82e 0%, #f7931a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Choose Your Fighter
        </motion.h1>
        <p className="text-sm tracking-wide mt-3 font-semibold" style={{ color: "#64748b" }}>
          {!connected
            ? "Connect your wallet to load your Ordinals"
            : loadingInscriptions
            ? "Loading your inscriptions..."
            : fighters.length > 0
            ? `${fighters.length} inscription${fighters.length !== 1 ? "s" : ""} found in your wallet`
            : "No Ordinals found in this wallet"}
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative z-10">

        {/* Left — grid or states */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">

          {/* NOT CONNECTED */}
          {!connected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full py-20 gap-8 text-center"
            >
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl glass-card"
              >
                ₿
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black mb-3" style={{ color: "#e2e8f0" }}>
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
              <div className="spinner" />
              <p className="text-sm tracking-widest uppercase font-semibold" style={{ color: "#64748b" }}>
                Loading your inscriptions...
              </p>
            </div>
          )}

          {/* ERROR */}
          {connected && !loadingInscriptions && inscriptionError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full py-20 gap-5 text-center"
            >
              <div className="text-4xl">⚠️</div>
              <div className="text-sm max-w-xs" style={{ color: "#fca5a5" }}>{inscriptionError}</div>
              <button onClick={fetchInscriptions} className="btn-secondary">
                RETRY
              </button>
            </motion.div>
          )}

          {/* NO ORDINALS */}
          {connected && !loadingInscriptions && !inscriptionError && fighters.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full py-20 gap-6 text-center"
            >
              <div className="text-6xl opacity-20">🖼️</div>
              <div>
                <div className="text-xl font-black mb-2" style={{ color: "#334155" }}>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
              {fighters.map((ord, i) => {
                const isSelected  = selected?.id === ord.id;
                const rarityColor = RARITY_COLORS[ord.rarity];
                const ins = inscriptions.find((x) => x.inscription_id === ord.id);

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
                    <div className="absolute top-0 left-0 right-0 h-1 z-10" style={{ background: rarityColor }} />

                    {/* Card glow */}
                    {isSelected && (
                      <div
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{ background: `radial-gradient(ellipse at center, ${ord.glowColor}25, transparent 70%)` }}
                      />
                    )}

                    {/* Visual */}
                    <div
                      className="relative flex items-center justify-center py-8 overflow-hidden holo-shine"
                      style={{ background: `linear-gradient(135deg, ${ord.glowColor}15, transparent)` }}
                    >
                      <InscriptionPreview
                        inscription={ins}
                        glowColor={ord.glowColor}
                        floating={isSelected}
                      />
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
        </div>

        {/* Right — detail panel */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="w-full lg:w-96 flex-shrink-0 border-t lg:border-t-0 lg:border-l glass-card overflow-y-auto"
              style={{ maxHeight: "100vh" }}
            >
              <div className="p-6 flex flex-col gap-5">

                {/* Fighter preview */}
                <div
                  className="relative rounded-2xl flex items-center justify-center overflow-hidden border-2 holo-shine"
                  style={{
                    height: 220,
                    background: `linear-gradient(135deg, ${preview.glowColor}20, transparent)`,
                    borderColor: `${preview.glowColor}50`,
                    boxShadow: `0 0 30px ${preview.glowColor}30`,
                  }}
                >
                  <InscriptionPreview
                    inscription={inscriptions.find((x) => x.inscription_id === preview.id)}
                    glowColor={preview.glowColor}
                    floating
                    size="large"
                  />
                </div>

                {/* Name + meta */}
                <div>
                  <h2 className="text-2xl font-black mb-1" style={{ color: "#e8eef7" }}>{preview.name}</h2>
                  <p className="text-sm font-semibold mb-3" style={{ color: "#64748b" }}>
                    Inscription #{preview.inscriptionNumber.toLocaleString()}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <span
                      className="type-badge"
                      style={{
                        background: `linear-gradient(135deg, ${RARITY_COLORS[preview.rarity]}, ${RARITY_COLORS[preview.rarity]}aa)`,
                        color: preview.rarity === "Legendary" ? "#000" : "#fff",
                      }}
                    >
                      {preview.rarity}
                    </span>
                    <span className="type-badge" style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>
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
                    <StatBar label="HP"  value={preview.hp}  color="#22c55e" />
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

                {/* Action */}
                {selected?.id === preview.id ? (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLock}
                    disabled={locked}
                    className={`btn-primary w-full ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
                  >
                    {locked ? "ENTERING ARENA..." : "GO TO BATTLE"}
                  </motion.button>
                ) : (
                  <button onClick={() => setSelected(preview)} className="btn-secondary w-full">
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
    return <span className="text-4xl opacity-30">🖼️</span>;
  }

  const isImage = inscription.content_type?.startsWith("image/");
  const dim = size === "large" ? "w-40 h-40" : "w-24 h-24";

  if (!imgError && isImage) {
    return (
      <img
        src={inscription.content_url}
        alt={`Inscription #${inscription.inscription_number}`}
        className={`${dim} object-contain rounded-xl ${floating ? "float-gentle" : ""}`}
        style={{ filter: `drop-shadow(0 0 20px ${glowColor})` }}
        loading="lazy"
        decoding="async"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-2xl flex flex-col items-center justify-center border-2 ${floating ? "float-gentle" : ""}`}
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
