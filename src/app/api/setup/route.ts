import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ORDINALS } from "@/lib/mockData";

export async function GET() {
  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS fighters (
      id TEXT PRIMARY KEY,
      inscription_number INTEGER NOT NULL,
      name TEXT NOT NULL,
      element TEXT NOT NULL,
      rarity TEXT NOT NULL,
      hp INTEGER NOT NULL,
      atk INTEGER NOT NULL,
      def INTEGER NOT NULL,
      spd INTEGER NOT NULL,
      special TEXT NOT NULL,
      special_desc TEXT NOT NULL,
      emoji TEXT NOT NULL,
      bg_gradient TEXT NOT NULL,
      glow_color TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS battles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      player_fighter_id TEXT NOT NULL,
      player_inscription_number INTEGER NOT NULL,
      opponent_fighter_id TEXT NOT NULL,
      opponent_inscription_number INTEGER NOT NULL,
      winner TEXT NOT NULL CHECK (winner IN ('player', 'enemy')),
      sats_payout INTEGER NOT NULL DEFAULT 625,
      rounds_played INTEGER NOT NULL DEFAULT 0,
      player_wallet TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS inscription_cache (
      inscription_id TEXT PRIMARY KEY,
      inscription_number INTEGER NOT NULL,
      content_url TEXT,
      content_type TEXT,
      wallet_address TEXT NOT NULL,
      cached_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS matchmaking_queue (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      player_id TEXT NOT NULL,
      fighter_data JSONB NOT NULL,
      status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'cancelled')),
      opponent_queue_id UUID,
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '3 minutes')
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_matchmaking_status_joined
    ON matchmaking_queue (status, joined_at)
    WHERE status = 'waiting'
  `;

  // Seed fighters — skip if already exist
  for (const f of ORDINALS) {
    await sql`
      INSERT INTO fighters (id, inscription_number, name, element, rarity, hp, atk, def, spd, special, special_desc, emoji, bg_gradient, glow_color)
      VALUES (${f.id}, ${f.inscriptionNumber}, ${f.name}, ${f.element}, ${f.rarity}, ${f.hp}, ${f.atk}, ${f.def}, ${f.spd}, ${f.special}, ${f.specialDesc}, ${f.emoji}, ${f.bgGradient}, ${f.glowColor})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  return NextResponse.json({ ok: true, message: "Tables created and fighters seeded" });
}
