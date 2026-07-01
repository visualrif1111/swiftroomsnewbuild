// Disables Draft Mode and returns the visitor to the published site. Handy as a
// manual "exit preview" escape hatch outside the Presentation tool.
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  (await draftMode()).disable();
  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/", url.origin));
}
