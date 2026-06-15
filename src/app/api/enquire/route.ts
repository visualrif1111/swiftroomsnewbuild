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

    const {
      name, phone, email, contactMethod, message,
      projectType, propertyType, emirate, area, address,
      stage, budget, notes, files,
    } = body;

    const lines = [
      "🏠 *New Quote Enquiry*",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      contactMethod ? `Contact via: ${contactMethod}` : null,
      projectType ? `Project type: ${projectType}` : null,
      propertyType ? `Property type: ${propertyType}` : null,
      emirate ? `Emirate: ${emirate}` : null,
      area ? `Area: ${area}` : null,
      address ? `Address: ${address}` : null,
      stage ? `Stage: ${stage}` : null,
      budget ? `Budget scope: ${budget}` : null,
      notes ? `Notes: ${notes}` : null,
      files ? `Files: ${files}` : null,
      message ? `Message: ${message}` : null,
    ];

    await notifyWhatsApp(lines.filter(Boolean).join("\n"));

    console.log("[SWIFTROOMS ENQUIRY]", JSON.stringify({
      timestamp: new Date().toISOString(),
      ...body,
    }, null, 2));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
