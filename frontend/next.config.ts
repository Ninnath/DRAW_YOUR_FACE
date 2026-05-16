import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/DRAW_YOUR_FACE",
  images: { unoptimized: true },
};

export default nextConfig;
