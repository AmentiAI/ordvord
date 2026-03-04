import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  const {
    player_fighter_id,
    player_inscription_number,
    opponent_fighter_id,
    opponent_inscription_number,
    winner,
    rounds_played,
    player_wallet,
  } = await req.json();

  const [battle] = await sql`
    INSERT INTO battles (
      player_fighter_id,
      player_inscription_number,
      opponent_fighter_id,
      opponent_inscription_number,
      winner,
      rounds_played,
      player_wallet
    )
    VALUES (
      ${player_fighter_id},
      ${player_inscription_number},
      ${opponent_fighter_id},
      ${opponent_inscription_number},
      ${winner},
      ${rounds_played ?? 0},
      ${player_wallet ?? null}
    )
    RETURNING id, created_at
  `;

  return NextResponse.json({ id: battle.id, created_at: battle.created_at });
}

export async function GET() {
  const rows = await sql`
    SELECT * FROM battles ORDER BY created_at DESC LIMIT 50
  `;
  return NextResponse.json(rows);
}
