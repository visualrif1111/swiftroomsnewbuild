import TopBar from "@/components/service-dashboard/TopBar";
import { requireStaffPage } from "@/lib/service-dashboard/auth/session";
import { signOut } from "../sign-in/actions";

// Signed-in staff only. Each page below also verifies on its own.
export default async function ServiceDashboardLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaffPage();
  return (
    <>
      <TopBar staff={{ displayName: staff.displayName, role: staff.role }} signOut={signOut} />
      <div className="sd-main">{children}</div>
    </>
  );
}
