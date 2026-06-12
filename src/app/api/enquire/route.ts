import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Log enquiry to Vercel Functions logs — viewable at vercel.com/logs
    console.log("[SWIFTROOMS ENQUIRY]", JSON.stringify({
      timestamp: new Date().toISOString(),
      ...body,
    }, null, 2));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
