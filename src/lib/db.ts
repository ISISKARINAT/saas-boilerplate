/**
 * libSQL database client.
 * Required env vars: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
 */
import { createClient, type Client } from "@libsql/client";

// ---------------------------------------------------------------------------
// TypeScript interfaces
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string; // ISO 8601 datetime string
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string; // ISO 8601 datetime string
}

export type SubscriptionStatus = "active" | "inactive" | "cancelled";

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  plan: string;
  status: SubscriptionStatus;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  timestamp: string; // ISO 8601 datetime string
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const url = process.env["TURSO_DATABASE_URL"];
const authToken = process.env["TURSO_AUTH_TOKEN"];

if (!url) {
  throw new Error("Missing environment variable: TURSO_DATABASE_URL");
}

export const db: Client = createClient({
  url,
  ...(authToken ? { authToken } : {}),
});

/** Alias for backward compatibility */
export const client = db;

// ---------------------------------------------------------------------------
// Schema initialisation — run once at startup
// ---------------------------------------------------------------------------

export async function initializeDatabase(): Promise<void> {
  await db.batch(
    [
      `CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name          TEXT NOT NULL,
        created_at    TEXT NOT NULL DEFAULT (datetime('now'))
      )`,

      `CREATE TABLE IF NOT EXISTS sessions (
        id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token       TEXT NOT NULL UNIQUE,
        expires_at  TEXT NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS subscriptions (
        id                 TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        stripe_customer_id TEXT,
        plan               TEXT NOT NULL DEFAULT 'free',
        status             TEXT NOT NULL DEFAULT 'active'
      )`,

      `CREATE TABLE IF NOT EXISTS audit_logs (
        id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id   TEXT REFERENCES users(id) ON DELETE SET NULL,
        action    TEXT NOT NULL,
        timestamp TEXT NOT NULL DEFAULT (datetime('now'))
      )`,

      `CREATE INDEX IF NOT EXISTS idx_sessions_user_id      ON sessions(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_token        ON sessions(token)`,
      `CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON audit_logs(user_id)`,
    ],
    "write"
  );
}
