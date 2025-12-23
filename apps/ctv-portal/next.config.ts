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
  // Enable standalone output for Docker
  output: 'standalone',
};

export default nextConfig;
