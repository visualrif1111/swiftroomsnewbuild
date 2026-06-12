import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("[SWIFTROOMS CONTACT]", JSON.stringify({
      timestamp: new Date().toISOString(),
      ...body,
    }, null, 2));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
