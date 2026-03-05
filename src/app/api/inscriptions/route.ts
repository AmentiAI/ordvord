import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  const apiKey = process.env.ORDISCAN_API_KEY;
  if (!apiKey) {
    console.error("[inscriptions] ORDISCAN_API_KEY is not set");
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.ordiscan.com/v1/address/${encodeURIComponent(address)}/inscriptions`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    const body = await res.json();

    if (!res.ok) {
      console.error("[inscriptions] Ordiscan error", res.status, body);
      return NextResponse.json(
        { error: body?.message ?? `Ordiscan error ${res.status}` },
        { status: res.status }
      );
    }

    return NextResponse.json(body);
  } catch (e) {
    console.error("[inscriptions] fetch threw:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Network error reaching Ordiscan" },
      { status: 500 }
    );
  }
}
