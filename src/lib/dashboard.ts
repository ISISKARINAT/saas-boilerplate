/**
 * Dashboard metrics data layer.
 * Queries Turso/libSQL for real KPIs; falls back to mock data when the DB is
 * unreachable or tables are empty.
 */
import { db } from "@/lib/db";

export interface DashboardMetrics {
  mrr: {
    value: number;          // cents
    changePercent: number;  // positive = growth
  };
  totalUsers: {
    value: number;
    changePercent: number;
  };
  activeSubscriptions: {
    value: number;
    changePercent: number;
  };
}

/** Cents per plan name. Extend as new plans are added. */
const PLAN_PRICES_CENTS: Record<string, number> = {
  free: 0,
  basic: 999,
  pro: 2999,
  enterprise: 9999,
};

const MOCK_METRICS: DashboardMetrics = {
  mrr: { value: 1284500, changePercent: 12.5 },
  totalUsers: { value: 2340, changePercent: 8.1 },
  activeSubscriptions: { value: 186, changePercent: 5.3 },
};

/**
 * Fetch key dashboard KPIs from Turso.
 * Falls back to mock data if the DB is empty or unavailable.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const [usersResult, subsResult] = await Promise.all([
      db.execute("SELECT COUNT(*) AS count FROM users"),
      db.execute(
        "SELECT plan, COUNT(*) AS count FROM subscriptions WHERE status = 'active' GROUP BY plan"
      ),
    ]);

    const totalUsers = Number(usersResult.rows[0]?.["count"] ?? 0);
    const activeSubscriptions = subsResult.rows.reduce(
      (sum, row) => sum + Number(row["count"] ?? 0),
      0
    );

    const mrr = subsResult.rows.reduce((sum, row) => {
      const plan = String(row["plan"] ?? "").toLowerCase();
      const price = PLAN_PRICES_CENTS[plan] ?? 0;
      return sum + price * Number(row["count"] ?? 0);
    }, 0);

    // Fall back to mock when DB is genuinely empty (fresh deploy)
    if (totalUsers === 0 && activeSubscriptions === 0) {
      return MOCK_METRICS;
    }

    return {
      mrr: { value: mrr, changePercent: 0 },
      totalUsers: { value: totalUsers, changePercent: 0 },
      activeSubscriptions: { value: activeSubscriptions, changePercent: 0 },
    };
  } catch {
    // DB unavailable — return mock data so the page still renders
    return MOCK_METRICS;
  }
}
