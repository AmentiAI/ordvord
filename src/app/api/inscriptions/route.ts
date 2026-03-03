import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  const apiKey = process.env.ORDISCAN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.ordiscan.com/v1/address/${encodeURIComponent(address)}/inscriptions`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 30 },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Ordiscan API error" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
