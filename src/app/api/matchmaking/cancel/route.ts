import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { queue_id } = await req.json();
  if (!queue_id) {
    return NextResponse.json({ error: "queue_id required" }, { status: 400 });
  }

  await sql`
    UPDATE matchmaking_queue SET status = 'cancelled'
    WHERE id = ${queue_id} AND status = 'waiting'
  `;

  return NextResponse.json({ ok: true });
}
