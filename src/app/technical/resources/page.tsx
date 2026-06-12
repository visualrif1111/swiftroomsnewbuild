import type { Metadata } from "next";
import ResourcesClient from "./ResourcesClient";

export const metadata: Metadata = {
  title: "Technical Resources",
  description:
    "Product guides, project inspiration, planning tools and technical documentation for Swiftrooms glazing systems. Request any document directly from our team.",
  openGraph: {
    title: "Technical Resources | Swiftrooms",
    description:
      "Product guides, planning tools and technical documentation for Swiftrooms glazing systems. Request any document directly.",
    url: "https://swiftrooms-newbuild.vercel.app/technical/resources",
  },
};

export default function ResourcesPage() {
  return <ResourcesClient />;
}
