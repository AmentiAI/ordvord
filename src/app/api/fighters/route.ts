import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const exclude = req.nextUrl.searchParams.get("exclude");

  const rows = exclude
    ? await sql`SELECT * FROM fighters WHERE id != ${exclude} ORDER BY inscription_number`
    : await sql`SELECT * FROM fighters ORDER BY inscription_number`;

  const fighters = rows.map((f) => ({
    id: f.id as string,
    inscriptionNumber: f.inscription_number as number,
    name: f.name as string,
    element: f.element as string,
    rarity: f.rarity as string,
    hp: f.hp as number,
    atk: f.atk as number,
    def: f.def as number,
    spd: f.spd as number,
    special: f.special as string,
    specialDesc: f.special_desc as string,
    emoji: f.emoji as string,
    bgGradient: f.bg_gradient as string,
    glowColor: f.glow_color as string,
  }));

  return NextResponse.json(fighters);
}
