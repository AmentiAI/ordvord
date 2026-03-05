"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { type Ordinal } from "@/lib/mockData";

interface BattleLog {
  id: number;
  text: string;
  type: "player" | "enemy" | "system";
}

interface DamageNum {
  id: number;
  value: number;
  x: number;
  isPlayer: boolean;
}

function calcDamage(attacker: Ordinal, defender: Ordinal, moveType: "strike" | "power" | "special") {
  const base =
    moveType === "strike" ? [15, 25] :
    moveType === "power"  ? [28, 42] : [35, 55];
  const raw = base[0] + Math.floor(Math.random() * (base[1] - base[0]));
  return Math.max(1, Math.round((raw * attacker.atk) / 100 - defender.def * 0.3));
}

export default function BattlePage() {
  const router = useRouter();
  const [myFighter, setMyFighter] = useState<Ordinal | null>(null);
  const [opponent, setOpponent] = useState<Ordinal | null>(null);
  const [myHp, setMyHp] = useState(0);
  const [oppHp, setOppHp] = useState(0);
  const [myMaxHp, setMyMaxHp] = useState(0);
  const [oppMaxHp, setOppMaxHp] = useState(0);
  const [log, setLog] = useState<BattleLog[]>([]);
  const [damages, setDamages] = useState<DamageNum[]>([]);
  const [phase, setPhase] = useState<"player_turn" | "enemy_turn" | "ended">("player_turn");
  const [round, setRound] = useState(1);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [specialUsed, setSpecialUsed] = useState(false);
  const [winner, setWinner] = useState<"player" | "enemy" | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const dmgId = useRef(0);
  const logId = useRef(0);

  useEffect(() => {
    const mf = sessionStorage.getItem("myFighter");
    const opp = sessionStorage.getItem("opponent");
    if (!mf || !opp) { router.push("/select"); return; }
    const f: Ordinal = JSON.parse(mf);
    const o: Ordinal = JSON.parse(opp);
    setMyFighter(f); setOpponent(o);
    setMyHp(f.hp); setOppHp(o.hp);
    setMyMaxHp(f.hp); setOppMaxHp(o.hp);
    addLog(`BATTLE BEGINS — ${f.name} vs ${o.name}`, "system");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLog = (text: string, type: BattleLog["type"]) => {
    setLog((l) => [...l.slice(-20), { id: logId.current++, text, type }]);
    setTimeout(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" }), 30);
  };

  const spawnDamage = (value: number, isPlayer: boolean) => {
    const id = dmgId.current++;
    setDamages((d) => [...d, { id, value, x: isPlayer ? 25 + Math.random() * 15 : 60 + Math.random() * 15, isPlayer }]);
    setTimeout(() => setDamages((d) => d.filter((x) => x.id !== id)), 1200);
  };

  const endBattle = useCallback((w: "player" | "enemy", finalRound: number) => {
    setWinner(w);
    setPhase("ended");
    sessionStorage.setItem("winner", w);

    const mf = JSON.parse(sessionStorage.getItem("myFighter") || "{}");
    const opp = JSON.parse(sessionStorage.getItem("opponent") || "{}");
    fetch("/api/battles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_fighter_id: mf.id ?? "unknown",
        player_inscription_number: mf.inscriptionNumber ?? 0,
        opponent_fighter_id: opp.id ?? "unknown",
        opponent_inscription_number: opp.inscriptionNumber ?? 0,
        winner: w,
        rounds_played: finalRound,
      }),
    }).catch(() => {});

    setTimeout(() => router.push("/result"), 2800);
  }, [router]);

  const enemyTurn = useCallback((currentMyHp: number, f: Ordinal, o: Ordinal) => {
    setTimeout(() => {
      const r = Math.random();
      const moveName = r < 0.5 ? "Strike" : r < 0.8 ? "Power Hit" : "Special";
      const dmg = calcDamage(o, f, r < 0.5 ? "strike" : r < 0.8 ? "power" : "special");
      const newHp = Math.max(0, currentMyHp - dmg);
      setMyHp(newHp);
      setShakePlayer(true);
      setTimeout(() => setShakePlayer(false), 500);
      spawnDamage(dmg, true);
      addLog(`${o.name} uses ${moveName} — ${dmg} damage`, "enemy");
      if (newHp <= 0) {
        addLog(`${f.name} defeated`, "system");
        endBattle("enemy", round);
      } else {
        setRound((r) => r + 1);
        setPhase("player_turn");
      }
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endBattle, round]);

  const handleAttack = (type: "strike" | "power" | "special") => {
    if (phase !== "player_turn" || !myFighter || !opponent) return;
    if (type === "special" && specialUsed) return;
    setPhase("enemy_turn");
    if (type === "special") setSpecialUsed(true);
    const moveName = type === "strike" ? "Strike" : type === "power" ? "Power Hit" : myFighter.special;
    const dmg = calcDamage(myFighter, opponent, type);
    const newOppHp = Math.max(0, oppHp - dmg);
    setOppHp(newOppHp);
    setShakeEnemy(true);
    setTimeout(() => setShakeEnemy(false), 500);
    spawnDamage(dmg, false);
    addLog(`You use ${moveName} — ${dmg} damage`, "player");
    if (newOppHp <= 0) {
      addLog(`${opponent.name} defeated`, "system");
      endBattle("player", round);
      return;
    }
    enemyTurn(myHp, myFighter, opponent);
  };

  const handleDefend = () => {
    if (phase !== "player_turn" || !myFighter || !opponent) return;
    setPhase("enemy_turn");
    const heal = Math.floor(myMaxHp * 0.1);
    const newHp = Math.min(myMaxHp, myHp + heal);
    setMyHp(newHp);
    addLog(`You defend — recover ${heal} HP`, "player");
    enemyTurn(newHp, myFighter, opponent);
  };

  if (!myFighter || !opponent) return null;

  const myPct  = (myHp / myMaxHp) * 100;
  const oppPct = (oppHp / oppMaxHp) * 100;
  const myColor  = myPct  > 50 ? "#22c55e" : myPct  > 25 ? "#f59e0b" : "#ef4444";
  const oppColor = oppPct > 50 ? "#22c55e" : oppPct > 25 ? "#f59e0b" : "#ef4444";

  const canAct = phase === "player_turn";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "var(--bg-void)" }}>
      {/* Animated battle background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 80%, rgba(247, 147, 26, 0.2), transparent 60%), radial-gradient(circle at 30% 20%, rgba(239, 68, 68, 0.15), transparent 50%), radial-gradient(circle at 70% 40%, rgba(168, 85, 247, 0.15), transparent 50%)",
            animation: "bgPulse 8s ease-in-out infinite",
          }}
        />
      </div>

      {/* Top HUD */}
      <div className="glass-card border-b z-10 relative">
        <div className="flex items-center justify-between px-6 py-4 gap-6">
          {/* Player HP */}
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-black tracking-wide" style={{ color: "#e8eef7" }}>
                {myFighter.name.replace("Inscription #", "#")}
              </span>
              <span className="font-mono font-bold" style={{ color: myColor }}>{myHp}/{myMaxHp}</span>
            </div>
            <div className="hp-bar">
              <motion.div
                className={`hp-bar-fill ${myPct < 25 ? "critical" : ""}`}
                style={{ background: `linear-gradient(90deg, ${myColor}, ${myColor}cc)`, width: `${myPct}%` }}
                animate={{ width: `${myPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#64748b" }}>YOUR HP</div>
          </div>

          {/* Round indicator */}
          <div className="flex flex-col items-center px-8 glass-card rounded-2xl py-3">
            <div className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: "#64748b" }}>Round</div>
            <div className="text-3xl font-black" style={{ color: "#f7931a" }}>{round}</div>
            <div
              className="text-xs px-3 py-1 rounded-full font-black uppercase mt-2 tracking-wider"
              style={{
                background: phase === "enemy_turn" ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                color: phase === "enemy_turn" ? "#ef4444" : "#22c55e",
                border: `2px solid ${phase === "enemy_turn" ? "#ef4444" : "#22c55e"}40`,
              }}
            >
              {phase === "ended" ? "ENDED" : phase === "enemy_turn" ? "ENEMY" : "YOUR TURN"}
            </div>
          </div>

          {/* Enemy HP */}
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono font-bold" style={{ color: oppColor }}>{oppHp}/{oppMaxHp}</span>
              <span className="font-black tracking-wide" style={{ color: "#e8eef7" }}>
                {opponent.name.replace("Inscription #", "#")}
              </span>
            </div>
            <div className="hp-bar">
              <motion.div
                className={`hp-bar-fill ${oppPct < 25 ? "critical" : ""}`}
                style={{
                  background: `linear-gradient(270deg, ${oppColor}, ${oppColor}cc)`,
                  width: `${oppPct}%`,
                  marginLeft: "auto",
                }}
                animate={{ width: `${oppPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="text-[10px] uppercase tracking-widest text-right font-bold" style={{ color: "#64748b" }}>ENEMY HP</div>
          </div>
        </div>
      </div>

      {/* Arena */}
      <div className="flex-1 relative flex items-center justify-between px-12 py-10 overflow-hidden">
        {/* Floor glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(0deg, rgba(247, 147, 26, 0.08) 0%, transparent 100%)" }}
        />
        <div
          className="absolute bottom-8 left-0 right-0 h-1 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, #f7931a66, transparent)",
            boxShadow: "0 0 20px rgba(247, 147, 26, 0.5)",
          }}
        />

        {/* Damage numbers */}
        <AnimatePresence>
          {damages.map((d) => (
            <motion.div
              key={d.id}
              className="absolute damage-number pointer-events-none z-50"
              style={{ left: `${d.x}%`, top: "40%", color: d.isPlayer ? "#ef4444" : "#22c55e" }}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -80, scale: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              -{d.value}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* My fighter */}
        <div className="flex flex-col items-center gap-5">
          <ArenaFighter fighter={myFighter} shake={shakePlayer} flip={false} />
          <div
            className="type-badge text-sm"
            style={{
              background: `linear-gradient(135deg, ${myFighter.glowColor}, ${myFighter.glowColor}aa)`,
              color: "#000",
              boxShadow: `0 0 20px ${myFighter.glowColor}60`,
            }}
          >
            {myFighter.name.replace("Inscription #", "#")}
          </div>
        </div>

        {/* VS */}
        <motion.div
          className="text-5xl font-black"
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ color: "#f7931a", textShadow: "0 0 30px rgba(247, 147, 26, 0.8)" }}
        >
          VS
        </motion.div>

        {/* Opponent fighter */}
        <div className="flex flex-col items-center gap-5">
          <ArenaFighter fighter={opponent} shake={shakeEnemy} flip={true} />
          <div
            className="type-badge text-sm"
            style={{
              background: `linear-gradient(135deg, ${opponent.glowColor}, ${opponent.glowColor}aa)`,
              color: "#000",
              boxShadow: `0 0 20px ${opponent.glowColor}60`,
            }}
          >
            {opponent.name.replace("Inscription #", "#")}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="glass-card border-t z-10 relative">
        <div className="flex flex-col sm:flex-row">
          {/* Battle log */}
          <div
            ref={logRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 border-b sm:border-b-0 sm:border-r text-sm font-mono"
            style={{ height: 140, background: "rgba(0, 0, 0, 0.3)" }}
          >
            <AnimatePresence initial={false}>
              {log.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-semibold"
                  style={{
                    color:
                      entry.type === "player" ? "#86efac" :
                      entry.type === "enemy"  ? "#fca5a5" : "#94a3b8",
                  }}
                >
                  {entry.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div className="w-full sm:w-80 flex-shrink-0 grid grid-cols-2 gap-3 p-4">
            {[
              { label: "Strike",    icon: "⚔️", desc: "15–25 DMG", action: () => handleAttack("strike"),  disabled: !canAct, color: "#3b82f6" },
              { label: "Power Hit", icon: "💥", desc: "28–42 DMG", action: () => handleAttack("power"),   disabled: !canAct, color: "#f59e0b" },
              { label: "Defend",    icon: "🛡️", desc: "+10% HP",   action: handleDefend,                  disabled: !canAct, color: "#22c55e" },
              {
                label: myFighter.special,
                icon: "⚡",
                desc: specialUsed ? "USED" : "Special",
                action: () => handleAttack("special"),
                disabled: !canAct || specialUsed,
                color: myFighter.glowColor,
              },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                disabled={btn.disabled}
                className={`flex flex-col items-center justify-center rounded-xl p-3 font-bold tracking-wide uppercase transition-all glass-card border-2 ${
                  btn.disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-105 active:scale-95"
                }`}
                style={{
                  borderColor: btn.disabled ? "rgba(255, 255, 255, 0.05)" : `${btn.color}60`,
                  background: btn.disabled ? "rgba(0, 0, 0, 0.2)" : `linear-gradient(135deg, ${btn.color}20, transparent)`,
                  boxShadow: btn.disabled ? "none" : `0 0 20px ${btn.color}30`,
                }}
              >
                <span className="text-2xl mb-1">{btn.icon}</span>
                <span className="text-sm" style={{ color: btn.disabled ? "#475569" : btn.color }}>
                  {btn.label}
                </span>
                <span className="text-xs mt-1" style={{ color: "#64748b" }}>{btn.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Battle end overlay */}
      <AnimatePresence>
        {phase === "ended" && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(0, 0, 0, 0.9)", backdropFilter: "blur(12px)" }}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-center"
            >
              <motion.div
                className="text-7xl md:text-8xl font-black tracking-wider mb-6"
                style={{
                  background: winner === "player"
                    ? "linear-gradient(180deg, #ffd700, #f7931a)"
                    : "linear-gradient(180deg, #ef4444, #991b1b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: `drop-shadow(0 0 40px ${winner === "player" ? "#f7931a" : "#ef4444"})`,
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {winner === "player" ? "VICTORY!" : "DEFEATED!"}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-semibold"
                style={{ color: "#94a3b8" }}
              >
                Redirecting to results...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArenaFighter({ fighter, shake, flip }: { fighter: Ordinal; shake: boolean; flip: boolean }) {
  const [imgError, setImgError] = useState(false);
  const isImage = fighter.contentType?.startsWith("image/");
  const glowColor = shake ? "#ef4444" : fighter.glowColor;

  if (fighter.contentUrl && isImage && !imgError) {
    return (
      <img
        src={fighter.contentUrl}
        alt={fighter.name}
        className={`w-36 h-36 md:w-44 md:h-44 object-contain rounded-2xl select-none ${shake ? "shake-intense" : "float-gentle"}`}
        style={{
          filter: `drop-shadow(0 0 30px ${glowColor}) ${shake ? "brightness(1.5)" : ""}`,
          transform: flip ? "scaleX(-1)" : undefined,
        }}
        loading="eager"
        decoding="async"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="relative">
      <div
        className={`text-9xl md:text-[10rem] select-none ${shake ? "shake-intense" : "float-gentle"}`}
        style={{
          filter: `drop-shadow(0 0 30px ${glowColor}) ${shake ? "brightness(1.5)" : ""}`,
          transform: flip ? "scaleX(-1)" : undefined,
        }}
      >
        {fighter.emoji}
      </div>
      {shake && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none attack-flash"
          style={{ boxShadow: `0 0 60px ${glowColor}` }}
        />
      )}
    </div>
  );
}
