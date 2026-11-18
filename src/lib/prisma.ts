import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;

  // Cloud database (PostgreSQL / Supabase / Neon / MySQL)
  if (
    envUrl &&
    (envUrl.startsWith("postgres://") ||
      envUrl.startsWith("postgresql://") ||
      envUrl.startsWith("mysql://"))
  ) {
    return envUrl;
  }

  // Serverless environment (Vercel / AWS Lambda)
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = "/tmp/dev.db";
    const bundledDbPath = path.join(process.cwd(), "prisma", "dev.db");

    try {
      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(bundledDbPath)) {
          fs.copyFileSync(bundledDbPath, tmpDbPath);
          console.log("[Prisma] Bundled SQLite database copied to /tmp/dev.db");
        } else {
          console.warn("[Prisma] Warning: Bundled database not found at", bundledDbPath);
        }
      }
    } catch (err) {
      console.error("[Prisma] Failed to copy SQLite database to /tmp/dev.db:", err);
    }

    return `file:${tmpDbPath}`;
  }

  // Local development: resolve exact absolute path to prisma/dev.db
  const localDbPath = path.resolve(process.cwd(), "prisma", "dev.db");
  return `file:${localDbPath}`;
}

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
