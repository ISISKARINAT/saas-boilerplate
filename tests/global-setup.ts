/**
 * Playwright global setup — runs once before all tests.
 * Loads environment variables from .env.local.
 */
import { config } from "dotenv";
import path from "path";
import { cleanupTestUsers } from "./helpers/db-cleanup";

export default async function globalSetup(): Promise<void> {
  // Load .env.local so TURSO_* and JWT_SECRET are available in setup/teardown
  config({ path: path.resolve(process.cwd(), ".env.local") });

  // Pre-clean any leftover test users from a previous interrupted run
  await cleanupTestUsers();
}
