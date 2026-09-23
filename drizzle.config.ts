import type { Config } from "drizzle-kit";

const turso = process.env.TURSO_DATABASE_URL;

export default (
  turso
    ? {
        schema: "./lib/db/schema.ts",
        out: "./drizzle",
        dialect: "turso",
        dbCredentials: { url: turso, authToken: process.env.TURSO_AUTH_TOKEN },
      }
    : {
        schema: "./lib/db/schema.ts",
        out: "./drizzle",
        dialect: "sqlite",
        dbCredentials: { url: `file:${process.env.DB_FILE ?? "./data.db"}` },
      }
) satisfies Config;
