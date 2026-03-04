import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Poll for match status. If still waiting, also retries claiming in case of simultaneous joins.
export async function GET(req: NextRequest) {
  const queue_id = req.nextUrl.searchParams.get("queue_id");
  const player_id = req.nextUrl.searchParams.get("player_id");
  if (!queue_id || !player_id) {
    return NextResponse.json({ error: "queue_id and player_id required" }, { status: 400 });
  }

  const [entry] = await sql`
    SELECT id, status, opponent_queue_id FROM matchmaking_queue WHERE id = ${queue_id}
  `;

  if (!entry) {
    return NextResponse.json({ error: "Queue entry not found" }, { status: 404 });
  }

  if (entry.status === "cancelled") {
    return NextResponse.json({ status: "cancelled" });
  }

  if (entry.status === "matched" && entry.opponent_queue_id) {
    const [opp] = await sql`
      SELECT fighter_data FROM matchmaking_queue WHERE id = ${entry.opponent_queue_id}
    `;
    return NextResponse.json({ status: "matched", opponent: opp?.fighter_data ?? null });
  }

  // Still waiting — retry claiming to handle simultaneous-join race condition
  const [claimed] = await sql`
    UPDATE matchmaking_queue
    SET status = 'matched'
    WHERE id = (
      SELECT id FROM matchmaking_queue
      WHERE status = 'waiting'
        AND player_id != ${player_id}
        AND id != ${queue_id}
        AND expires_at > NOW()
      ORDER BY joined_at ASC
      LIMIT 1
    )
    RETURNING id, fighter_data
  `;

  if (claimed) {
    await sql`
      UPDATE matchmaking_queue
      SET status = 'matched', opponent_queue_id = ${claimed.id}
      WHERE id = ${queue_id}
    `;
    await sql`
      UPDATE matchmaking_queue SET opponent_queue_id = ${queue_id} WHERE id = ${claimed.id}
    `;
    return NextResponse.json({ status: "matched", opponent: claimed.fighter_data });
  }

  return NextResponse.json({ status: "waiting" });
}
