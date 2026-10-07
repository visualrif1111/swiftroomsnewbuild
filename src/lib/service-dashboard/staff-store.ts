// Staff allow-list access (database layer). PostgREST over the service role
// today; any Postgres client can implement the same query.
import "server-only";
import { supabaseConfig, supabaseJson } from "@/lib/service-call/server/supabase";
import type { StaffMember, StaffRole } from "./auth/access";

export function staffStoreConfigured() {
  try {
    supabaseConfig();
    return true;
  } catch {
    return false;
  }
}

export async function findStaffMember(authUserId: string): Promise<StaffMember | null> {
  const rows = await supabaseJson<{ id: string; auth_user_id: string; display_name: string; role: StaffRole; active: boolean }[]>(
    `/rest/v1/staff_members?auth_user_id=eq.${encodeURIComponent(authUserId)}&select=id,auth_user_id,display_name,role,active`,
  );
  const r = rows[0];
  return r ? { id: r.id, authUserId: r.auth_user_id, displayName: r.display_name, role: r.role, active: r.active } : null;
}
