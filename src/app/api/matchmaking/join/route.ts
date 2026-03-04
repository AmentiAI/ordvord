import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Atomically claim a waiting opponent OR enter the queue as waiting.
// The UPDATE...WHERE id=(SELECT...LIMIT 1) is a single statement — atomic in PostgreSQL.
export async function POST(req: NextRequest) {
  const { player_id, fighter_data } = await req.json();
  if (!player_id || !fighter_data) {
    return NextResponse.json({ error: "player_id and fighter_data required" }, { status: 400 });
  }

  // Clean expired entries and any stale waiting entry for this player
  await sql`DELETE FROM matchmaking_queue WHERE expires_at < NOW()`;
  await sql`DELETE FROM matchmaking_queue WHERE player_id = ${player_id} AND status = 'waiting'`;

  // Try to atomically claim a waiting opponent
  const [claimed] = await sql`
    UPDATE matchmaking_queue
    SET status = 'matched'
    WHERE id = (
      SELECT id FROM matchmaking_queue
      WHERE status = 'waiting'
        AND player_id != ${player_id}
        AND expires_at > NOW()
      ORDER BY joined_at ASC
      LIMIT 1
    )
    RETURNING id, fighter_data
  `;

  if (claimed) {
    // Insert ourselves as matched
    const [me] = await sql`
      INSERT INTO matchmaking_queue (player_id, fighter_data, status, opponent_queue_id)
      VALUES (${player_id}, ${JSON.stringify(fighter_data)}, 'matched', ${claimed.id})
      RETURNING id
    `;
    // Let opponent know who matched them
    await sql`
      UPDATE matchmaking_queue SET opponent_queue_id = ${me.id} WHERE id = ${claimed.id}
    `;
    return NextResponse.json({
      matched: true,
      queue_id: me.id,
      opponent: claimed.fighter_data,
    });
  }

  // No one waiting — enter the queue
  const [me] = await sql`
    INSERT INTO matchmaking_queue (player_id, fighter_data)
    VALUES (${player_id}, ${JSON.stringify(fighter_data)})
    RETURNING id
  `;
  return NextResponse.json({ matched: false, queue_id: me.id });
}
