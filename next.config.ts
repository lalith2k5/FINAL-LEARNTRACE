import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next 16 from bundling Prisma and bcrypt — they need native
  // resolution at runtime, and bundling breaks both on Vercel and in
  // standalone server builds.
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
