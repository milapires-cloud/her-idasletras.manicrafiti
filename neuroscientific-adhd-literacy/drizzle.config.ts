import type { Config } from "drizzle-kit";

const url =
  process.env.NEON_DATABASE_URL ||
  process.env.NEON_POSTGRES_URL ||
  process.env.DATABASE_URL ||
  "";

export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: { url },
} satisfies Config;
