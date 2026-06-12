import type { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog & Insights",
  description:
    "Expert guides, product deep-dives and technical advice on premium aluminium windows, doors and glazing systems from the Swiftrooms team.",
  openGraph: {
    title: "Blog & Insights | Swiftrooms",
    description:
      "Expert guides, product deep-dives and technical advice on premium aluminium windows, doors and glazing systems.",
    url: "https://swiftrooms-newbuild.vercel.app/technical/blog",
  },
};

export default function BlogPage() {
  return <BlogClient />;
}
