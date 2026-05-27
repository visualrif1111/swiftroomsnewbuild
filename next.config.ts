import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.swiftrooms.ae",
      },
    ],
  },
};

export default nextConfig;
