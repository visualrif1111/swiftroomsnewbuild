import { redirect } from "next/navigation";
import TopBar from "@/components/service-dashboard/TopBar";
import SignInForm from "@/components/service-dashboard/SignInForm";
import { dashboardPage, getAccess } from "@/lib/service-dashboard/auth/session";
import { requestCode, signOut, verifyCode } from "./actions";

export const metadata = { title: "Staff sign-in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await dashboardPage();
  const access = await getAccess();
  if (access.kind === "OK") redirect("/admin/service");
  if (access.kind === "MFA_ENROLL" || access.kind === "MFA_VERIFY") redirect("/admin/sign-in/mfa");
  const { error } = await searchParams;
  const notAuthorised = access.kind === "NOT_AUTHORISED" || error === "not_authorised";
  return (
    <>
      <TopBar />
      <div className="sd-auth">
        <div className="sd-panel card">
          <p className="eyebrow">Staff only</p>
          <h1>Sign in to the service dashboard</h1>
          <p className="lead">We&apos;ll email you a one-time code. You&apos;ll then confirm with your authenticator app.</p>
          {notAuthorised && (
            <div className="sd-alert err" role="alert" style={{ marginBottom: 14 }}>
              This account isn&apos;t authorised for the service dashboard.
              {access.kind === "NOT_AUTHORISED" && (
                <form action={signOut} style={{ marginTop: 8 }}>
                  <button className="sd-btn ghost" type="submit">
                    Sign out
                  </button>
                </form>
              )}
            </div>
          )}
          <SignInForm requestCode={requestCode} verifyCode={verifyCode} />
        </div>
      </div>
    </>
  );
}
