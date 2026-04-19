import { PrismaClient } from "@prisma/client";

// Keep a single PrismaClient across HMR reloads. Without this, every file
// edit that touches a module importing `prisma` spawns a fresh query engine
// process, and they pile up in dev until the machine runs out of memory.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
