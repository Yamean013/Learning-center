import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CRITICAL: Prisma ships a native query engine binary. If Turbopack tries to
  // bundle @prisma/client and its .node engine files, dev-mode memory can
  // balloon catastrophically. Externalize it so it's required at runtime.
  serverExternalPackages: ["@prisma/client", ".prisma/client", "prisma"],

  turbopack: {
    root: __dirname,
  },

  // Heavy uploaded files should not be traced or bundled with the server.
  outputFileTracingExcludes: {
    "*": ["./public/uploads/**/*"],
  },
};

export default nextConfig;
