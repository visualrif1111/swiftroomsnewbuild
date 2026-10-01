"use client";

// Client-only mount for the wizard. It restores in-progress answers from
// sessionStorage, which doesn't exist during server rendering — loading it on
// the client avoids a hydration mismatch. The placeholder reserves height so
// the page doesn't jump when it appears.
import dynamic from "next/dynamic";

const ServiceCallWizard = dynamic(() => import("./ServiceCallWizard"), {
  ssr: false,
  loading: () => (
    <div
      id="service-request"
      aria-busy="true"
      aria-label="Loading service request form"
      className="min-h-[34rem] rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 md:p-8 lg:p-10"
    >
      <div className="h-3 w-40 rounded bg-gray-100" />
      <div className="mt-4 h-7 w-64 max-w-full rounded bg-gray-100" />
      <div className="mt-4 h-4 w-full max-w-md rounded bg-gray-100" />
    </div>
  ),
});

export default function ServiceCallSection({ phone, phoneRaw }: { phone: string; phoneRaw: string }) {
  return <ServiceCallWizard phone={phone} phoneRaw={phoneRaw} />;
}
