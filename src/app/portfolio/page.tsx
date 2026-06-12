import type { Metadata } from "next";
import PortfolioClient from "./PortfolioClient";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Over 500 completed glazing projects across Dubai, Abu Dhabi and the wider UAE. Browse our portfolio of premium aluminium windows, doors and curtain wall installations.",
  openGraph: {
    title: "Portfolio | Swiftrooms",
    description:
      "Over 500 completed glazing projects across Dubai, Abu Dhabi and the wider UAE. Browse premium aluminium windows, doors and curtain wall installations.",
    url: "https://swiftrooms-newbuild.vercel.app/portfolio",
  },
};

export default function PortfolioPage() {
  return <PortfolioClient />;
}
