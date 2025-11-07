// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // Remove any 'turbopack' block entirely
  // Remove 'reactCompiler' if present (not in 15.2.3)
};

export default nextConfig;