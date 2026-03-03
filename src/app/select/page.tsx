"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLaserEyes } from "@omnisat/lasereyes";
import { ORDINALS, RARITY_COLORS, ELEMENT_ICONS, type Ordinal } from "@/lib/mockData";
import { fetchWalletInscriptions, type OrdiscanInscription } from "@/lib/ordiscan";
import StatBar from "@/components/StatBar";
import WalletConnect from "@/components/WalletConnect";

// Derive deterministic stats from an inscription number so real Ordinals feel like real fighters
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
    ...stats,
  };
}

export default function SelectPage() {
  const router = useRouter();
  const { connected, address } = useLaserEyes();

  const [selected, setSelected] = useState<Ordinal | null>(null);
  const [hovering, setHovering] = useState<Ordinal | null>(null);
  const [locked, setLocked] = useState(false);

  // Ordiscan inscription state
  const [walletInscriptions, setWalletInscriptions] = useState<OrdiscanInscription[]>([]);
  const [loadingInscriptions, setLoadingInscriptions] = useState(false);
  const [inscriptionError, setInscriptionError] = useState<string | null>(null);
  const [useWallet, setUseWallet] = useState(true);

  const preview = hovering ?? selected;

  // Fetch inscriptions from Ordiscan when wallet is connected
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

  // Active fighter list: real inscriptions or mock data
  const fighters: Ordinal[] =
    connected && useWallet && walletInscriptions.length > 0
      ? walletInscriptions.map(inscriptionToOrdinal)
      : ORDINALS;

  const isWalletMode = connected && useWallet && walletInscriptions.length > 0;

  const handleLock = () => {
    if (!selected) return;
    setLocked(true);
    sessionStorage.setItem("myFighter", JSON.stringify(selected));
    setTimeout(() => router.push("/lobby"), 800);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050508" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: "rgba(247,147,26,0.15)", background: "rgba(0,0,0,0.6)" }}
      >
        <button
          onClick={() => router.push("/")}
          className="text-xs tracking-widest uppercase cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: "#64748b" }}
        >
          ← BACK
        </button>

        <div className="flex items-center gap-3">
          {connected && (
            <button
              onClick={() => setUseWallet((v) => !v)}
              className="text-[10px] tracking-widest uppercase cursor-pointer transition-opacity hover:opacity-70 px-2 py-1 rounded border"
              style={{
                borderColor: "rgba(247,147,26,0.2)",
                color: useWallet ? "#f7931a" : "#475569",
                background: useWallet ? "rgba(247,147,26,0.08)" : "transparent",
              }}
            >
              {useWallet ? "⚡ MY ORDINALS" : "📦 DEMO FIGHTERS"}
            </button>
          )}
          <div className="text-xs tracking-widest uppercase" style={{ color: "#64748b" }}>
            Season 03 · Round 1
          </div>
        </div>

        <WalletConnect />
      </div>

      {/* Title */}
      <div className="text-center pt-8 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black tracking-widest uppercase"
          style={{ color: "#f7931a", textShadow: "0 0 30px rgba(247,147,26,0.4)" }}
        >
          Choose Your Fighter
        </motion.h1>
        <p className="text-xs tracking-widest mt-2 uppercase" style={{ color: "#334155" }}>
          {isWalletMode
            ? `Showing ${walletInscriptions.length} inscription${walletInscriptions.length !== 1 ? "s" : ""} from your wallet`
            : connected
            ? "No inscriptions found in wallet — showing demo fighters"
            : "Connect your wallet to use your own Ordinals"}
        </p>
      </div>

      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Fighter grid */}
        <div className="flex-1 p-6 overflow-y-auto">

          {/* Loading state */}
          {connected && loadingInscriptions && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div
                className="w-10 h-10 rounded-full border-2 border-transparent spin-slow"
                style={{ borderTopColor: "#f7931a" }}
              />
              <p className="text-xs uppercase tracking-widest" style={{ color: "#475569" }}>
                Loading your inscriptions...
              </p>
            </div>
          )}

          {/* Error state */}
          {inscriptionError && (
            <div
              className="mb-4 px-4 py-3 rounded-lg flex items-center gap-3 text-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#fca5a5",
              }}
            >
              <span>⚠️</span>
              <span>{inscriptionError}</span>
              <button onClick={fetchInscriptions} className="ml-auto text-xs underline cursor-pointer">Retry</button>
            </div>
          )}

          {/* Fighter grid */}
          {!loadingInscriptions && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {fighters.map((ord, i) => {
                const isSelected = selected?.id === ord.id;
                const rarityColor = RARITY_COLORS[ord.rarity];
                const ordiscanIns = walletInscriptions.find((ins) => ins.inscription_id === ord.id);
                return (
                  <motion.div
                    key={ord.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelected(ord)}
                    onMouseEnter={() => setHovering(ord)}
                    onMouseLeave={() => setHovering(null)}
                    className="relative cursor-pointer rounded-lg overflow-hidden card-hover"
                    style={{
                      background: "#0d0d14",
                      border: `1px solid ${isSelected ? ord.glowColor : "rgba(255,255,255,0.06)"}`,
                      boxShadow: isSelected
                        ? `0 0 20px ${ord.glowColor}44, 0 0 40px ${ord.glowColor}22`
                        : "none",
                    }}
                  >
                    {/* Rarity stripe */}
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: rarityColor }} />

                    {isSelected && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse at center, ${ord.glowColor}15, transparent 70%)` }}
                      />
                    )}

                    {/* Fighter visual */}
                    <div
                      className="relative flex items-center justify-center py-6 overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${ord.glowColor}10, transparent)` }}
                    >
                      {isWalletMode && ordiscanIns ? (
                        <InscriptionPreview
                          inscription={ordiscanIns}
                          glowColor={ord.glowColor}
                          floating={isSelected}
                        />
                      ) : (
                        <span className={`text-6xl ${isSelected ? "float-anim" : ""}`}>{ord.emoji}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black tracking-wide truncate max-w-[80%]" style={{ color: "#e2e8f0" }}>
                          {ord.name}
                        </span>
                        <span className="text-[9px] flex-shrink-0">{ELEMENT_ICONS[ord.element]}</span>
                      </div>
                      <div className="text-[9px] mb-2" style={{ color: "#334155" }}>
                        #{ord.inscriptionNumber.toLocaleString()}
                      </div>
                      <div
                        className="text-[9px] px-1.5 py-0.5 rounded inline-block mb-2"
                        style={{
                          background: `${rarityColor}22`,
                          color: rarityColor,
                          border: `1px solid ${rarityColor}44`,
                        }}
                      >
                        {ord.rarity}
                      </div>
                      <div className="space-y-1">
                        <StatBar label="ATK" value={ord.atk} color={ord.glowColor} />
                        <StatBar label="DEF" value={ord.def} color={ord.glowColor} />
                        <StatBar label="SPD" value={ord.spd} color={ord.glowColor} />
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
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

          {/* No wallet fighters + not loading */}
          {connected && !loadingInscriptions && !inscriptionError && walletInscriptions.length === 0 && useWallet && (
            <div className="text-center py-10">
              <p className="text-sm" style={{ color: "#475569" }}>No Ordinals found in this wallet.</p>
              <button
                onClick={() => setUseWallet(false)}
                className="mt-3 text-xs underline cursor-pointer"
                style={{ color: "#f7931a" }}
              >
                Use demo fighters instead
              </button>
            </div>
          )}
        </div>

        {/* Side panel */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-72 flex-shrink-0 border-l flex flex-col"
              style={{ borderColor: "rgba(247,147,26,0.1)", background: "rgba(0,0,0,0.4)" }}
            >
              <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Fighter display */}
                <div
                  className="relative rounded-lg flex items-center justify-center overflow-hidden"
                  style={{
                    height: 180,
                    background: `linear-gradient(135deg, ${preview.glowColor}18, transparent)`,
                    border: `1px solid ${preview.glowColor}33`,
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
                    <span className="text-8xl float-anim">{preview.emoji}</span>
                  )}
                  <div
                    className="absolute inset-0 rounded-lg"
                    style={{ boxShadow: `inset 0 0 30px ${preview.glowColor}22` }}
                  />
                </div>

                {/* Details */}
                <div>
                  <h2 className="text-xl font-black" style={{ color: "#e2e8f0" }}>{preview.name}</h2>
                  <p className="text-xs" style={{ color: "#475569" }}>
                    Inscription #{preview.inscriptionNumber.toLocaleString()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded"
                      style={{
                        background: `${RARITY_COLORS[preview.rarity]}22`,
                        color: RARITY_COLORS[preview.rarity],
                        border: `1px solid ${RARITY_COLORS[preview.rarity]}44`,
                      }}
                    >
                      {preview.rarity}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded capitalize"
                      style={{ background: "#1e293b", color: "#64748b" }}
                    >
                      {ELEMENT_ICONS[preview.element]} {preview.element}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#334155" }}>Stats</div>
                  <StatBar label="HP" value={preview.hp} color="#22c55e" />
                  <StatBar label="ATK" value={preview.atk} color={preview.glowColor} />
                  <StatBar label="DEF" value={preview.def} color={preview.glowColor} />
                  <StatBar label="SPD" value={preview.spd} color={preview.glowColor} />
                </div>

                {/* Special */}
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: `${preview.glowColor}0d`,
                    border: `1px solid ${preview.glowColor}22`,
                  }}
                >
                  <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#475569" }}>Special Move</div>
                  <div className="text-sm font-bold" style={{ color: preview.glowColor }}>⚡ {preview.special}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>{preview.specialDesc}</div>
                </div>

                <div className="flex-1" />

                {/* Actions */}
                {selected && selected.id === preview.id ? (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleLock}
                    disabled={locked}
                    className="w-full py-4 font-black text-sm tracking-widest uppercase cursor-pointer transition-all"
                    style={{
                      background: locked
                        ? "#1e293b"
                        : `linear-gradient(135deg, ${preview.glowColor}, ${preview.glowColor}99)`,
                      color: locked ? "#475569" : "#000",
                      clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                      boxShadow: locked ? "none" : `0 0 20px ${preview.glowColor}44`,
                    }}
                  >
                    {locked ? "ENTERING ARENA..." : "⚔️ GO TO BATTLE"}
                  </motion.button>
                ) : (
                  <button
                    onClick={() => setSelected(preview)}
                    className="w-full py-3 font-bold text-xs tracking-widest uppercase cursor-pointer transition-opacity hover:opacity-80"
                    style={{
                      background: "rgba(247,147,26,0.08)",
                      color: "#f7931a",
                      border: "1px solid rgba(247,147,26,0.2)",
                      borderRadius: 4,
                    }}
                  >
                    SELECT THIS FIGHTER
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

// Renders inscription image from Ordiscan or fallback placeholder
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

  if (!inscription) return <span className="text-5xl opacity-30">🖼️</span>;

  const isImage = inscription.content_type?.startsWith("image/");
  const px = size === "large" ? "w-36 h-36" : "w-20 h-20";

  if (!imgError && isImage) {
    return (
      <img
        src={inscription.content_url}
        alt={`Inscription #${inscription.inscription_number}`}
        className={`${px} object-contain rounded ${floating ? "float-anim" : ""}`}
        style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
        onError={() => setImgError(true)}
      />
    );
  }

  // Non-image or error: show inscription number block
  return (
    <div
      className={`${px} rounded-lg flex flex-col items-center justify-center ${floating ? "float-anim" : ""}`}
      style={{
        background: `linear-gradient(135deg, ${glowColor}22, transparent)`,
        border: `1px solid ${glowColor}44`,
        filter: `drop-shadow(0 0 12px ${glowColor}44)`,
      }}
    >
      <span className="text-[10px] uppercase tracking-widest" style={{ color: glowColor }}>ORD</span>
      <span className="font-black text-sm" style={{ color: "#e2e8f0" }}>
        #{inscription.inscription_number.toLocaleString()}
      </span>
    </div>
  );
}
