/**
 * Main analytics dashboard page — Server Component.
 * Displays a welcome message, key metric cards, and a recent activity placeholder.
 */
import { headers } from "next/headers";
import {
  DollarSign,
  Users,
  CreditCard,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MetricCard {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend: string;
}

const METRIC_CARDS: MetricCard[] = [
  {
    title: "Total Revenue",
    value: "$0.00",
    description: "No data yet",
    icon: <DollarSign className="h-5 w-5 text-muted-foreground" />,
    trend: "+0% from last month",
  },
  {
    title: "New Users",
    value: "0",
    description: "No data yet",
    icon: <Users className="h-5 w-5 text-muted-foreground" />,
    trend: "+0% from last month",
  },
  {
    title: "Active Subscriptions",
    value: "0",
    description: "No data yet",
    icon: <CreditCard className="h-5 w-5 text-muted-foreground" />,
    trend: "+0% from last month",
  },
  {
    title: "Growth Rate",
    value: "0%",
    description: "No data yet",
    icon: <TrendingUp className="h-5 w-5 text-muted-foreground" />,
    trend: "+0% from last month",
  },
];

const ACTIVITY_COLUMNS = ["Event", "User", "Date", "Status"] as const;

const PLACEHOLDER_ROWS = Array.from({ length: 5 }, (_, i) => i);

export default async function DashboardPage() {
  const headersList = await headers();
  const userId = headersList.get("X-User-Id") ?? "User";

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {userId}. Here&apos;s a snapshot of your key metrics.
        </p>
      </div>

      {/* Metric cards grid */}
      <section aria-label="Key metrics">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {METRIC_CARDS.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>{card.title}</CardDescription>
                  {card.icon}
                </div>
                <CardTitle className="text-2xl font-bold">
                  {card.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{card.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent activity placeholder */}
      <section aria-label="Recent activity">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <CardDescription>
              Latest events across your account — data coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {ACTIVITY_COLUMNS.map((col) => (
                      <th
                        key={col}
                        className="pb-3 text-left font-medium text-muted-foreground"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PLACEHOLDER_ROWS.map((i) => (
                    <tr key={i} className="border-b last:border-0">
                      {ACTIVITY_COLUMNS.map((col) => (
                        <td key={col} className="py-3 pr-4">
                          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
