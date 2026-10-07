// Proxy for the staff dashboard (/admin). NOT the security boundary: every
// page, action, route and data function verifies the session and the staff
// allow-list itself (src/lib/service-dashboard/auth/session.ts).
//
// It does two things: refreshes the Supabase session cookies (Server
// Components can't write cookies), and sends signed-out page loads to the
// sign-in page. POST requests (Server Actions) are never redirected here, so
// an action always answers for itself.
import { NextResponse, type NextRequest } from "next/server";
import { refreshStaffSession } from "@/lib/service-dashboard/auth/supabase-proxy";

const PUBLIC_ADMIN_PATHS = ["/admin/sign-in"];

export default async function proxy(request: NextRequest) {
  const { configured, signedIn, response } = await refreshStaffSession(request);
  // Not configured here (e.g. Production): the pages themselves answer 404.
  if (!configured) return response;

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
  if (!signedIn && !isPublic && request.method === "GET") {
    const to = request.nextUrl.clone();
    to.pathname = "/admin/sign-in";
    to.search = "";
    const redirect = NextResponse.redirect(to);
    for (const c of response.cookies.getAll()) redirect.cookies.set(c);
    return redirect;
  }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
