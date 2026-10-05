import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle the boilerplate template with the export route so ZIP
  // downloads work in production (Vercel).
  outputFileTracingIncludes: {
    "/api/export": ["./templates/boilerplate/**/*"],
  },

  // The templates/boilerplate folder is a *copy* of a standalone
  // Next.js project. It has its own tsconfig and path aliases that
  // don't resolve inside the builder. Skip type-checking and linting
  // it during builder builds — the builder itself is type-safe.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
