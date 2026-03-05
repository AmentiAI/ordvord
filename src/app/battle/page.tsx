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
    setDamages((d) => [...d, { id, value, x: 25 + Math.random() * 50, isPlayer }]);
    setTimeout(() => setDamages((d) => d.filter((x) => x.id !== id)), 1000);
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
    }, 900);
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
    <div className="min-h-screen flex flex-col" style={{ background: "#050508" }}>

      {/* ── TOP HUD ── */}
      <div
        className="flex items-center gap-4 px-4 md:px-6 py-3 border-b shrink-0"
        style={{ background: "rgba(5,5,8,0.95)", borderColor: "rgba(247,147,26,0.12)" }}
      >
        {/* Player side */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-black tracking-wide" style={{ fontFamily: "var(--font-orbitron)", color: "#e2e8f0" }}>
              {myFighter.name}
            </span>
            <span className="font-bold tabular-nums" style={{ color: myColor }}>{myHp}/{myMaxHp}</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div
              className="h-full rounded-full hp-bar"
              style={{ width: `${myPct}%`, background: `linear-gradient(90deg, ${myColor}, ${myColor}bb)` }}
            />
          </div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>YOUR HP</div>
        </div>

        {/* Round */}
        <div className="flex flex-col items-center gap-1 shrink-0 px-2 md:px-4">
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>Round</div>
          <div className="text-3xl md:text-4xl font-black" style={{ fontFamily: "var(--font-orbitron)", color: "#f7931a" }}>
            {round}
          </div>
          <div
            className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide"
            style={{
              background: phase === "enemy_turn" ? "rgba(239,68,68,0.15)" : canAct ? "rgba(34,197,94,0.15)" : "rgba(247,147,26,0.1)",
              color: phase === "enemy_turn" ? "#ef4444" : canAct ? "#22c55e" : "#f7931a",
            }}
          >
            {phase === "ended" ? "ENDED" : phase === "enemy_turn" ? "ENEMY" : "YOUR TURN"}
          </div>
        </div>

        {/* Enemy side */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold tabular-nums" style={{ color: oppColor }}>{oppHp}/{oppMaxHp}</span>
            <span className="font-black tracking-wide" style={{ fontFamily: "var(--font-orbitron)", color: "#e2e8f0" }}>
              {opponent.name}
            </span>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div
              className="h-full rounded-full hp-bar ml-auto"
              style={{ width: `${oppPct}%`, background: `linear-gradient(270deg, ${oppColor}, ${oppColor}bb)` }}
            />
          </div>
          <div className="text-[10px] uppercase tracking-widest text-right" style={{ color: "#334155" }}>ENEMY HP</div>
        </div>
      </div>

      {/* ── ARENA ── */}
      <div className="flex-1 relative flex items-center justify-between px-6 md:px-16 py-4 overflow-hidden min-h-0">
        {/* Floor line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(0deg, rgba(247,147,26,0.05) 0%, transparent 100%)" }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(247,147,26,0.3), transparent)" }}
        />

        {/* Damage numbers */}
        {damages.map((d) => (
          <div
            key={d.id}
            className="damage-float absolute font-black pointer-events-none select-none"
            style={{
              left: `${d.x}%`,
              top: "35%",
              fontSize: "2.5rem",
              color: d.isPlayer ? "#ef4444" : "#22c55e",
              textShadow: `0 0 20px ${d.isPlayer ? "#ef4444" : "#22c55e"}`,
              zIndex: 50,
              fontFamily: "var(--font-orbitron)",
            }}
          >
            -{d.value}
          </div>
        ))}

        {/* My fighter */}
        <div className="flex flex-col items-center gap-4">
          <ArenaFighter fighter={myFighter} shake={shakePlayer} flip={false} />
          <div
            className="text-xs px-4 py-1.5 rounded font-black tracking-wider uppercase"
            style={{
              background: `${myFighter.glowColor}18`,
              color: myFighter.glowColor,
              border: `1px solid ${myFighter.glowColor}35`,
              fontFamily: "var(--font-orbitron)",
            }}
          >
            {myFighter.name}
          </div>
        </div>

        {/* VS */}
        <div
          className="text-4xl md:text-5xl font-black select-none opacity-20"
          style={{ fontFamily: "var(--font-orbitron)", color: "#f7931a" }}
        >
          VS
        </div>

        {/* Opponent */}
        <div className="flex flex-col items-center gap-4">
          <ArenaFighter fighter={opponent} shake={shakeEnemy} flip={true} />
          <div
            className="text-xs px-4 py-1.5 rounded font-black tracking-wider uppercase"
            style={{
              background: `${opponent.glowColor}18`,
              color: opponent.glowColor,
              border: `1px solid ${opponent.glowColor}35`,
              fontFamily: "var(--font-orbitron)",
            }}
          >
            {opponent.name}
          </div>
        </div>
      </div>

      {/* ── BOTTOM: LOG + ACTIONS ── */}
      <div
        className="border-t shrink-0"
        style={{ borderColor: "rgba(247,147,26,0.1)", background: "rgba(3,3,6,0.98)" }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Battle log */}
          <div
            ref={logRef}
            className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1.5 border-b sm:border-b-0 sm:border-r"
            style={{ borderColor: "rgba(247,147,26,0.08)", height: 110 }}
          >
            <AnimatePresence initial={false}>
              {log.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-xs md:text-sm"
                  style={{
                    color: entry.type === "player" ? "#86efac" : entry.type === "enemy" ? "#fca5a5" : "#475569",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {entry.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div className="w-full sm:w-72 md:w-80 shrink-0 grid grid-cols-2 gap-2 p-3 md:p-4">
            {[
              { label: "STRIKE",    sub: "15–25 DMG", action: () => handleAttack("strike"),  disabled: !canAct, special: false },
              { label: "POWER HIT", sub: "28–42 DMG", action: () => handleAttack("power"),   disabled: !canAct, special: false },
              { label: "DEFEND",    sub: "+10% HP",   action: handleDefend,                  disabled: !canAct, special: false },
              {
                label: myFighter.special.toUpperCase(),
                sub: specialUsed ? "USED" : "SPECIAL",
                action: () => handleAttack("special"),
                disabled: !canAct || specialUsed,
                special: true,
              },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                disabled={btn.disabled}
                className="flex flex-col items-center justify-center rounded-xl py-4 cursor-pointer transition-all duration-100 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed"
                style={{
                  background: btn.disabled
                    ? "rgba(255,255,255,0.02)"
                    : btn.special
                    ? `linear-gradient(135deg, ${myFighter.glowColor}25, ${myFighter.glowColor}10)`
                    : "rgba(247,147,26,0.08)",
                  border: btn.special
                    ? `1px solid ${myFighter.glowColor}50`
                    : "1px solid rgba(247,147,26,0.15)",
                  boxShadow: btn.disabled || !btn.special ? "none" : `0 0 20px ${myFighter.glowColor}20`,
                }}
              >
                <span
                  className="text-sm font-black tracking-wider"
                  style={{
                    fontFamily: "var(--font-orbitron)",
                    color: btn.disabled ? "#1e293b" : btn.special ? myFighter.glowColor : "#f7931a",
                  }}
                >
                  {btn.label}
                </span>
                <span className="text-[10px] mt-0.5 tracking-widest uppercase" style={{ color: "#334155" }}>
                  {btn.sub}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BATTLE END OVERLAY ── */}
      <AnimatePresence>
        {phase === "ended" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.88)", zIndex: 100 }}
          >
            <motion.div
              initial={{ scale: 0.4, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="text-center"
            >
              <div
                className="font-black tracking-widest"
                style={{
                  fontFamily: "var(--font-orbitron)",
                  fontSize: "clamp(3rem, 12vw, 6rem)",
                  color: winner === "player" ? "#f7931a" : "#ef4444",
                  textShadow: `0 0 60px ${winner === "player" ? "#f7931a" : "#ef4444"}`,
                }}
              >
                {winner === "player" ? "VICTORY" : "DEFEATED"}
              </div>
              <div className="text-sm mt-3 tracking-widest uppercase" style={{ color: "#475569" }}>
                Loading results...
              </div>
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
  const cls = shake ? "shake-anim" : "float-anim";

  if (fighter.contentUrl && isImage && !imgError) {
    return (
      <img
        src={fighter.contentUrl}
        alt={fighter.name}
        className={`object-contain rounded-xl select-none ${cls}`}
        style={{
          width: 160, height: 160,
          filter: `drop-shadow(0 0 30px ${glowColor})`,
          transform: flip ? "scaleX(-1)" : undefined,
        }}
        loading="eager"
        decoding="async"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`select-none ${cls}`}
      style={{
        fontSize: "clamp(7rem, 14vw, 10rem)",
        filter: `drop-shadow(0 0 30px ${glowColor})`,
        transform: flip ? "scaleX(-1)" : undefined,
        lineHeight: 1,
      }}
    >
      {fighter.emoji}
    </div>
  );
}
