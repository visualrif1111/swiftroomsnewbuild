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
      name, phone, email, contactMethod,
      visitType, productInterest, preferredDate, preferredTime, altDateTime,
      visitorCount, visitorRole,
      projectLocation, projectDescription, projectTimeline,
      // legacy fields for backwards compatibility
      project,
    } = body;

    const products = Array.isArray(productInterest) ? productInterest.join(", ") : productInterest;

    const lines = [
      "📅 *Showroom Booking Request*",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      contactMethod ? `Contact via: ${contactMethod}` : null,
      visitType ? `Visit purpose: ${visitType}` : null,
      products ? `Products of interest: ${products}` : null,
      preferredDate ? `Preferred date: ${preferredDate}` : null,
      preferredTime ? `Preferred time: ${preferredTime}` : null,
      altDateTime ? `Alternative: ${altDateTime}` : null,
      visitorCount ? `Visitors: ${visitorCount}` : null,
      visitorRole ? `Visitor role: ${visitorRole}` : null,
      projectLocation ? `Project location: ${projectLocation}` : null,
      projectTimeline ? `Timeline: ${projectTimeline}` : null,
      projectDescription ? `Project: ${projectDescription}` : null,
      project ? `Project: ${project}` : null,
    ];

    await notifyWhatsApp(lines.filter(Boolean).join("\n"));

    console.log("[SWIFTROOMS SHOWROOM BOOKING]", { name, phone, email, ...body });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
