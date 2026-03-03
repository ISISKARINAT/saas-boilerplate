/**
 * Turso (libSQL) client — database connection.
 * Required env vars: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
 */
import { createClient as createLibSQLClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./db/schema";

const rawUrl = process.env["TURSO_DATABASE_URL"];
const authToken = process.env["TURSO_AUTH_TOKEN"];

if (!rawUrl) {
  throw new Error("Missing environment variable: TURSO_DATABASE_URL");
}

const url: string = rawUrl;

export function createClient() {
  return createLibSQLClient({
    url,
    ...(authToken ? { authToken } : {}),
  });
}

// Raw libSQL client — use for direct SQL execution (e.g., client.execute())
export const client = createClient();

// Drizzle ORM instance with full schema — use for type-safe queries
export const db = drizzle(client, { schema });
