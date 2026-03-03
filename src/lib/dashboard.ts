/**
 * Dashboard metrics data layer.
 * Currently returns mock data; replace the function bodies with real Turso
 * queries once the metrics tables exist (see schema.sql for guidance).
 *
 * Example real query (Turso / libSQL):
 *   import { db } from "@/lib/db";
 *   const { rows } = await db.execute("SELECT SUM(amount) FROM payments WHERE ...");
 */

export interface DashboardMetrics {
  mrr: {
    value: number;          // cents
    changePercent: number;  // positive = growth
  };
  activeUsers: {
    value: number;
    changePercent: number;
  };
  conversionRate: {
    value: number;          // percentage 0–100
    changePercent: number;
  };
}

/**
 * Fetch key dashboard KPIs.
 * Structured to be a drop-in replacement for a Turso query:
 *
 *   const [mrr, users, conv] = await Promise.all([
 *     db.execute("SELECT ..."),
 *     db.execute("SELECT ..."),
 *     db.execute("SELECT ..."),
 *   ]);
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  // TODO: replace with real Turso queries
  return {
    mrr: {
      value: 1284500,   // $12,845.00
      changePercent: 12.5,
    },
    activeUsers: {
      value: 2340,
      changePercent: 8.1,
    },
    conversionRate: {
      value: 3.6,
      changePercent: -0.4,
    },
  };
}
