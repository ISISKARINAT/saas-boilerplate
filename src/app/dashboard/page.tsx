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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        <h1 className="text-4xl font-bold tracking-tight">
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
                  <CardDescription className="text-lg font-semibold">
                    {card.title}
                  </CardDescription>
                  {card.icon}
                </div>
                <CardTitle className="text-4xl font-bold">
                  {card.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent activity */}
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
            <Table>
              <TableHeader>
                <TableRow>
                  {ACTIVITY_COLUMNS.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PLACEHOLDER_ROWS.map((i) => (
                  <TableRow key={i}>
                    {ACTIVITY_COLUMNS.map((col) => (
                      <TableCell key={col}>
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
