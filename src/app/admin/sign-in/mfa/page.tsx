import { redirect } from "next/navigation";
import TopBar from "@/components/service-dashboard/TopBar";
import MfaForm from "@/components/service-dashboard/MfaForm";
import { dashboardPage, getAccess } from "@/lib/service-dashboard/auth/session";
import { signOut, startEnrolment, verifyAuthenticator } from "../actions";

export const metadata = { title: "Authenticator" };

export default async function MfaPage() {
  await dashboardPage();
  const access = await getAccess();
  if (access.kind === "OK") redirect("/admin/service");
  if (access.kind === "SIGNED_OUT") redirect("/admin/sign-in");
  if (access.kind === "NOT_AUTHORISED") redirect("/admin/sign-in?error=not_authorised");
  const enrol = access.kind === "MFA_ENROLL";
  return (
    <>
      <TopBar />
      <div className="sd-auth">
        <div className="sd-panel card">
          <p className="eyebrow">Step 2 of 2 · Required</p>
          <h1>{enrol ? "Set up your authenticator" : "Confirm it's you"}</h1>
          <p className="lead">
            {enrol
              ? "Two-step verification is mandatory for the service dashboard. Add Swift Rooms to an authenticator app (such as Google Authenticator, Microsoft Authenticator or 1Password), then enter the 6-digit code it shows."
              : "Enter the current 6-digit code from your authenticator app."}
          </p>
          <MfaForm mode={enrol ? "enrol" : "verify"} startEnrolment={startEnrolment} verifyAuthenticator={verifyAuthenticator} />
          <form action={signOut} style={{ marginTop: 16 }}>
            <button className="sd-btn ghost" type="submit" style={{ width: "100%" }}>
              Cancel and sign out
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
