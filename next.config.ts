import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile above this directory makes Next guess the wrong workspace root.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
