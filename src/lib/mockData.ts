export interface Ordinal {
  id: string;
  inscriptionNumber: number;
  name: string;
  element: "fire" | "shadow" | "lightning" | "ice" | "void" | "gold";
  rarity: "Legendary" | "Epic" | "Rare" | "Uncommon";
  hp: number;
  atk: number;
  def: number;
  spd: number;
  special: string;
  specialDesc: string;
  emoji: string;
  bgGradient: string;
  glowColor: string;
  // Real inscription fields (optional — absent for mock fighters)
  contentUrl?: string;
  contentType?: string;
}

export const ORDINALS: Ordinal[] = [
  {
    id: "ord-001",
    inscriptionNumber: 469842,
    name: "Satoshi Reaper",
    element: "shadow",
    rarity: "Legendary",
    hp: 100,
    atk: 92,
    def: 78,
    spd: 85,
    special: "Death Block",
    specialDesc: "Drains 30 HP from opponent",
    emoji: "💀",
    bgGradient: "from-purple-950 via-slate-900 to-black",
    glowColor: "#a855f7",
  },
  {
    id: "ord-002",
    inscriptionNumber: 831204,
    name: "Block Demon",
    element: "fire",
    rarity: "Legendary",
    hp: 95,
    atk: 98,
    def: 65,
    spd: 72,
    special: "Chain Blast",
    specialDesc: "Deals 40 ATK, -10 DEF for 2 turns",
    emoji: "🔥",
    bgGradient: "from-red-950 via-orange-900 to-black",
    glowColor: "#f97316",
  },
  {
    id: "ord-003",
    inscriptionNumber: 214670,
    name: "Ordinal Ape",
    element: "gold",
    rarity: "Epic",
    hp: 110,
    atk: 75,
    def: 90,
    spd: 60,
    special: "Diamond Hands",
    specialDesc: "Block next attack, +15 DEF",
    emoji: "🦍",
    bgGradient: "from-yellow-950 via-amber-900 to-black",
    glowColor: "#f59e0b",
  },
  {
    id: "ord-004",
    inscriptionNumber: 998301,
    name: "Lightning Node",
    element: "lightning",
    rarity: "Epic",
    hp: 85,
    atk: 88,
    def: 70,
    spd: 99,
    special: "LN Strike",
    specialDesc: "Fastest attack, always moves first",
    emoji: "⚡",
    bgGradient: "from-cyan-950 via-blue-900 to-black",
    glowColor: "#06b6d4",
  },
  {
    id: "ord-005",
    inscriptionNumber: 55512,
    name: "Frost Wallet",
    element: "ice",
    rarity: "Rare",
    hp: 90,
    atk: 70,
    def: 95,
    spd: 65,
    special: "Cold Storage",
    specialDesc: "Freezes opponent for 1 turn",
    emoji: "❄️",
    bgGradient: "from-sky-950 via-slate-800 to-black",
    glowColor: "#38bdf8",
  },
  {
    id: "ord-006",
    inscriptionNumber: 1337420,
    name: "Void Punk",
    element: "void",
    rarity: "Rare",
    hp: 80,
    atk: 82,
    def: 68,
    spd: 88,
    special: "Null TX",
    specialDesc: "Cancels opponent's next special",
    emoji: "👾",
    bgGradient: "from-emerald-950 via-teal-900 to-black",
    glowColor: "#10b981",
  },
  {
    id: "ord-007",
    inscriptionNumber: 2048001,
    name: "Hash Wizard",
    element: "void",
    rarity: "Uncommon",
    hp: 75,
    atk: 85,
    def: 60,
    spd: 92,
    special: "SHA-256",
    specialDesc: "Random damage 20-60 HP",
    emoji: "🧙",
    bgGradient: "from-violet-950 via-purple-900 to-black",
    glowColor: "#8b5cf6",
  },
  {
    id: "ord-008",
    inscriptionNumber: 77777,
    name: "Sat Dragon",
    element: "fire",
    rarity: "Legendary",
    hp: 120,
    atk: 95,
    def: 80,
    spd: 78,
    special: "Sats Rain",
    specialDesc: "Multi-hit: 3x15 damage",
    emoji: "🐉",
    bgGradient: "from-rose-950 via-red-900 to-black",
    glowColor: "#ef4444",
  },
];

export interface BattleMove {
  name: string;
  damage: [number, number];
  type: "physical" | "special" | "defend";
  icon: string;
}

export const BATTLE_MOVES: BattleMove[] = [
  { name: "Strike", damage: [15, 25], type: "physical", icon: "⚔️" },
  { name: "Block", damage: [0, 0], type: "defend", icon: "🛡️" },
  { name: "Power Hit", damage: [25, 40], type: "physical", icon: "💥" },
];

export const RARITY_COLORS: Record<string, string> = {
  Legendary: "#f59e0b",
  Epic: "#a855f7",
  Rare: "#3b82f6",
  Uncommon: "#10b981",
};

export const ELEMENT_ICONS: Record<string, string> = {
  fire: "🔥",
  shadow: "🌑",
  lightning: "⚡",
  ice: "❄️",
  void: "🌀",
  gold: "✨",
};
