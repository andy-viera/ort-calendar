import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/cal/:career.ics",
        destination: "/api/cal/:career",
      },
    ];
  },
};

export default nextConfig;
