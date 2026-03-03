/**
 * Playwright global teardown — runs once after all tests complete.
 * Removes all E2E test users created during the run.
 */
import { cleanupTestUsers } from "./helpers/db-cleanup";

export default async function globalTeardown(): Promise<void> {
  await cleanupTestUsers();
}
