import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  // Ensure proper routing
  reactStrictMode: true,
  // Images configuration
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
