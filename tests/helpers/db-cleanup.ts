/**
 * Turso/libSQL helper for E2E test cleanup.
 * Deletes test users (and cascaded sessions) by email prefix.
 */
import { createClient } from "@libsql/client";

const E2E_EMAIL_PREFIX = "e2e-playwright-";

export function createDbClient() {
  const url = process.env["TURSO_DATABASE_URL"];
  const authToken = process.env["TURSO_AUTH_TOKEN"];

  if (!url || url === "libsql://your-db.turso.io") {
    return null;
  }

  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

/**
 * Delete all test users whose email starts with the E2E prefix.
 * Sessions are cascade-deleted via the FK constraint.
 */
export async function cleanupTestUsers(emails?: string[]): Promise<void> {
  const client = createDbClient();
  if (!client) {
    console.warn("[e2e] Skipping DB cleanup — TURSO_DATABASE_URL not configured.");
    return;
  }

  try {
    if (emails && emails.length > 0) {
      for (const email of emails) {
        await client.execute({
          sql: "DELETE FROM users WHERE email = ?",
          args: [email],
        });
      }
    } else {
      await client.execute({
        sql: "DELETE FROM users WHERE email LIKE ?",
        args: [`${E2E_EMAIL_PREFIX}%`],
      });
    }
  } catch (err) {
    console.error("[e2e] DB cleanup error:", err);
  } finally {
    client.close();
  }
}

/**
 * Generate a unique test email address.
 */
export function generateTestEmail(): string {
  return `${E2E_EMAIL_PREFIX}${Date.now()}@example.com`;
}

export const TEST_PASSWORD = "TestPassword123!";
