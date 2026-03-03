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
    moveType === "strike"
      ? [15, 25]
      : moveType === "power"
      ? [28, 42]
      : [35, 55]; // special

  const raw = base[0] + Math.floor(Math.random() * (base[1] - base[0]));
  const dmg = Math.max(1, Math.round((raw * attacker.atk) / 100 - (defender.def * 0.3)));
  return dmg;
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
    setMyFighter(f);
    setOpponent(o);
    setMyHp(f.hp);
    setOppHp(o.hp);
    setMyMaxHp(f.hp);
    setOppMaxHp(o.hp);
    addLog(`⚔️ BATTLE BEGINS! ${f.name} vs ${o.name}`, "system");
    addLog(`Round 1 — Your turn`, "system");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLog = (text: string, type: BattleLog["type"]) => {
    setLog((l) => [...l, { id: logId.current++, text, type }]);
    setTimeout(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  };

  const spawnDamage = (value: number, isPlayer: boolean) => {
    const id = dmgId.current++;
    setDamages((d) => [...d, { id, value, x: 30 + Math.random() * 40, isPlayer }]);
    setTimeout(() => setDamages((d) => d.filter((x) => x.id !== id)), 1100);
  };

  const endBattle = useCallback((w: "player" | "enemy") => {
    setWinner(w);
    setPhase("ended");
    sessionStorage.setItem("winner", w);
    setTimeout(() => router.push("/result"), 2500);
  }, [router]);

  const enemyTurn = useCallback((currentMyHp: number, f: Ordinal, o: Ordinal) => {
    setTimeout(() => {
      const moveRoll = Math.random();
      const moveName = moveRoll < 0.5 ? "Strike" : moveRoll < 0.8 ? "Power Hit" : "Special";
      const dmg = calcDamage(o, f, moveRoll < 0.5 ? "strike" : moveRoll < 0.8 ? "power" : "special");
      const newHp = Math.max(0, currentMyHp - dmg);

      setMyHp(newHp);
      setShakePlayer(true);
      setTimeout(() => setShakePlayer(false), 500);
      spawnDamage(dmg, true);
      addLog(`💀 ${o.name} uses ${moveName}! You take ${dmg} damage.`, "enemy");

      if (newHp <= 0) {
        addLog(`☠️ ${f.name} was defeated!`, "system");
        endBattle("enemy");
      } else {
        setRound((r) => r + 1);
        setPhase("player_turn");
        addLog(`Your turn — Round ${round + 1}`, "system");
      }
    }, 800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endBattle, round]);

  const handleAttack = (type: "strike" | "power" | "special") => {
    if (phase !== "player_turn" || !myFighter || !opponent) return;
    if (type === "special" && specialUsed) return;
    setPhase("enemy_turn");

    if (type === "special") setSpecialUsed(true);

    const moveName =
      type === "strike" ? "Strike" : type === "power" ? "Power Hit" : myFighter.special;
    const dmg = calcDamage(myFighter, opponent, type);
    const newOppHp = Math.max(0, oppHp - dmg);

    setOppHp(newOppHp);
    setShakeEnemy(true);
    setTimeout(() => setShakeEnemy(false), 500);
    spawnDamage(dmg, false);
    addLog(`⚔️ You use ${moveName}! Enemy takes ${dmg} damage.`, "player");

    if (newOppHp <= 0) {
      addLog(`🏆 ${opponent.name} was defeated!`, "system");
      endBattle("player");
      return;
    }

    addLog(`${opponent.name} is preparing...`, "system");
    enemyTurn(myHp, myFighter, opponent);
  };

  const handleDefend = () => {
    if (phase !== "player_turn" || !myFighter || !opponent) return;
    setPhase("enemy_turn");
    const heal = Math.floor(myMaxHp * 0.08);
    setMyHp((h) => Math.min(myMaxHp, h + heal));
    addLog(`🛡️ You defend and recover ${heal} HP.`, "player");
    enemyTurn(Math.min(myMaxHp, myHp + heal), myFighter, opponent);
  };

  if (!myFighter || !opponent) return null;

  const myHpPct = (myHp / myMaxHp) * 100;
  const oppHpPct = (oppHp / oppMaxHp) * 100;
  const myHpColor = myHpPct > 50 ? "#22c55e" : myHpPct > 25 ? "#f59e0b" : "#ef4444";
  const oppHpColor = oppHpPct > 50 ? "#22c55e" : oppHpPct > 25 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#050508" }}
    >
      {/* Top HUD */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(247,147,26,0.15)", background: "rgba(0,0,0,0.7)" }}
      >
        {/* Player HP */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black" style={{ color: "#e2e8f0" }}>{myFighter.name}</span>
            <span style={{ color: myHpColor }}>{myHp}/{myMaxHp}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${myHpColor}, ${myHpColor}99)` }}
              animate={{ width: `${myHpPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-[9px] uppercase tracking-widest" style={{ color: "#334155" }}>YOUR HP</div>
        </div>

        {/* Round indicator */}
        <div className="flex flex-col items-center px-6">
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>Round</div>
          <div className="text-2xl font-black" style={{ color: "#f7931a" }}>{round}</div>
          <div
            className="text-[10px] px-2 py-0.5 rounded font-bold uppercase"
            style={{
              background: phase === "enemy_turn" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)",
              color: phase === "enemy_turn" ? "#ef4444" : "#22c55e",
            }}
          >
            {phase === "ended" ? "ENDED" : phase === "enemy_turn" ? "ENEMY" : "YOUR TURN"}
          </div>
        </div>

        {/* Enemy HP */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: oppHpColor }}>{oppHp}/{oppMaxHp}</span>
            <span className="font-black" style={{ color: "#e2e8f0" }}>{opponent.name}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-full rounded-full ml-auto"
              style={{ background: `linear-gradient(270deg, ${oppHpColor}, ${oppHpColor}99)` }}
              animate={{ width: `${oppHpPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-[9px] uppercase tracking-widest text-right" style={{ color: "#334155" }}>ENEMY HP</div>
        </div>
      </div>

      {/* Arena */}
      <div className="flex-1 relative flex items-center justify-between px-8 py-6 overflow-hidden">
        {/* Arena glow floor */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background:
              "linear-gradient(0deg, rgba(247,147,26,0.06) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, #f7931a44, transparent)" }}
        />

        {/* Damage floats */}
        {damages.map((d) => (
          <motion.div
            key={d.id}
            className="absolute damage-float font-black text-2xl pointer-events-none"
            style={{
              left: `${d.x}%`,
              top: "30%",
              color: d.isPlayer ? "#ef4444" : "#22c55e",
              textShadow: `0 0 10px ${d.isPlayer ? "#ef4444" : "#22c55e"}`,
              zIndex: 50,
            }}
          >
            -{d.value}
          </motion.div>
        ))}

        {/* My fighter */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={`text-8xl md:text-9xl select-none ${shakePlayer ? "shake-anim" : "float-anim"}`}
            style={{ filter: shakePlayer ? "drop-shadow(0 0 20px #ef4444)" : `drop-shadow(0 0 20px ${myFighter.glowColor})` }}
          >
            {myFighter.emoji}
          </div>
          <div
            className="text-[10px] px-3 py-1 rounded font-bold tracking-widest uppercase"
            style={{
              background: `${myFighter.glowColor}20`,
              color: myFighter.glowColor,
              border: `1px solid ${myFighter.glowColor}40`,
            }}
          >
            {myFighter.name}
          </div>
        </div>

        {/* VS center */}
        <motion.div
          className="text-3xl font-black opacity-40 select-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ color: "#f7931a" }}
        >
          VS
        </motion.div>

        {/* Opponent fighter */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={`text-8xl md:text-9xl select-none ${shakeEnemy ? "shake-anim" : "float-anim"}`}
            style={{
              filter: shakeEnemy ? "drop-shadow(0 0 20px #ef4444)" : `drop-shadow(0 0 20px ${opponent.glowColor})`,
              animationDelay: "1s",
              transform: "scaleX(-1)",
            }}
          >
            {opponent.emoji}
          </div>
          <div
            className="text-[10px] px-3 py-1 rounded font-bold tracking-widest uppercase"
            style={{
              background: `${opponent.glowColor}20`,
              color: opponent.glowColor,
              border: `1px solid ${opponent.glowColor}40`,
            }}
          >
            {opponent.name}
          </div>
        </div>
      </div>

      {/* Bottom — Log + Actions */}
      <div
        className="border-t"
        style={{ borderColor: "rgba(247,147,26,0.1)", background: "rgba(0,0,0,0.7)" }}
      >
        <div className="flex gap-0 h-40">
          {/* Battle log */}
          <div
            ref={logRef}
            className="flex-1 overflow-y-auto p-3 space-y-1 border-r text-xs"
            style={{ borderColor: "rgba(247,147,26,0.1)" }}
          >
            <AnimatePresence>
              {log.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    color:
                      entry.type === "player"
                        ? "#86efac"
                        : entry.type === "enemy"
                        ? "#fca5a5"
                        : "#64748b",
                  }}
                >
                  {entry.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div className="w-64 flex-shrink-0 grid grid-cols-2 gap-2 p-3">
            {[
              { label: "⚔️ Strike", desc: "15–25 DMG", action: () => handleAttack("strike"), disabled: phase !== "player_turn" },
              { label: "💥 Power Hit", desc: "28–42 DMG", action: () => handleAttack("power"), disabled: phase !== "player_turn" },
              { label: "🛡️ Defend", desc: "+8% HP", action: handleDefend, disabled: phase !== "player_turn" },
              {
                label: `⚡ ${myFighter.special}`,
                desc: specialUsed ? "USED" : "Special",
                action: () => handleAttack("special"),
                disabled: phase !== "player_turn" || specialUsed,
                special: true,
              },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                disabled={btn.disabled}
                className="flex flex-col items-center justify-center rounded-lg p-2 cursor-pointer transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: btn.disabled
                    ? "rgba(255,255,255,0.03)"
                    : btn.special
                    ? `linear-gradient(135deg, ${myFighter.glowColor}33, ${myFighter.glowColor}11)`
                    : "rgba(247,147,26,0.1)",
                  border: btn.special
                    ? `1px solid ${myFighter.glowColor}44`
                    : "1px solid rgba(247,147,26,0.15)",
                  boxShadow: btn.disabled ? "none" : btn.special ? `0 0 12px ${myFighter.glowColor}22` : "none",
                }}
              >
                <span className="text-sm font-bold" style={{ color: btn.disabled ? "#334155" : btn.special ? myFighter.glowColor : "#f7931a" }}>
                  {btn.label}
                </span>
                <span className="text-[9px]" style={{ color: "#334155" }}>{btn.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* End overlay */}
      <AnimatePresence>
        {phase === "ended" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.85)", zIndex: 100 }}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-center"
            >
              <div
                className="text-6xl font-black tracking-widest"
                style={{
                  color: winner === "player" ? "#f7931a" : "#ef4444",
                  textShadow: `0 0 40px ${winner === "player" ? "#f7931a" : "#ef4444"}`,
                }}
              >
                {winner === "player" ? "VICTORY!" : "DEFEATED!"}
              </div>
              <div className="text-sm mt-2" style={{ color: "#64748b" }}>
                Redirecting to results...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
