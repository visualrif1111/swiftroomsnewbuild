// Session-cookie refresh for the proxy (Supabase Auth adapter). Optimistic
// only: reports whether the request appears signed in; never an authorisation.
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { authClientOptions, supabaseAuthConfig } from "./supabase-auth";

/** Refreshes the session cookies if needed. `configured: false` → the dashboard isn't set up here. */
export async function refreshStaffSession(request: NextRequest): Promise<{ configured: boolean; signedIn: boolean; response: NextResponse }> {
  let response = NextResponse.next({ request });
  const config = supabaseAuthConfig();
  if (!config) return { configured: false, signedIn: false, response };
  try {
    const supabase = createServerClient(
      config.url,
      config.key,
      authClientOptions({
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const c of list) request.cookies.set(c.name, c.value);
          response = NextResponse.next({ request });
          for (const c of list) response.cookies.set(c.name, c.value, c.options);
        },
      }),
    );
    const { data } = await supabase.auth.getClaims();
    return { configured: true, signedIn: !!data?.claims?.sub, response };
  } catch {
    return { configured: true, signedIn: false, response };
  }
}
