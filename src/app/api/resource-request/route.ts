import { NextRequest, NextResponse } from "next/server";

const WA_PHONE = "971505269149";

async function notifyWhatsApp(text: string) {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) return;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${WA_PHONE}&text=${encodeURIComponent(text)}&apikey=${apiKey}`;
  await fetch(url);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { resourceId, resourceTitle } = body;

    const message = [
      "📄 *Resource Request*",
      `Resource: ${resourceTitle}`,
      `ID: ${resourceId}`,
    ].join("\n");

    await notifyWhatsApp(message);

    console.log("[SWIFTROOMS RESOURCE REQUEST]", { resourceId, resourceTitle });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
