import type { NextConfig } from "next";

// GITHUB_ACTIONS is automatically set to "true" in GitHub Actions runners
const basePath = process.env.GITHUB_ACTIONS ? "/DRAW_YOUR_FACE" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
