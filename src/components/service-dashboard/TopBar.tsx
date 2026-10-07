import Link from "next/link";

export default function TopBar({ staff, signOut }: { staff?: { displayName: string; role: "STAFF" | "ADMIN" }; signOut?: () => Promise<void> }) {
  return (
    <header className="sd-top">
      <Link href="/admin/service" className="sd-brand" aria-label="Swift Rooms service dashboard">
        <b>SWIFTROOMS</b>
        <span>Service &amp; Aftercare</span>
      </Link>
      {staff && signOut && (
        <>
          <nav aria-label="Dashboard">
            <Link href="/admin/service" aria-current="page">
              Requests
            </Link>
          </nav>
          <div className="sd-who">
            <span className="name">{staff.displayName}</span>
            <span className="role" title={staff.role === "ADMIN" ? "Administrator" : "Service staff"}>
              {staff.role}
            </span>
            <form action={signOut}>
              <button type="submit">Sign out</button>
            </form>
          </div>
        </>
      )}
    </header>
  );
}
