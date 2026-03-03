/**
 * Main analytics dashboard page — Server Component.
 * Displays a welcome message, key metric cards, onboarding flow, and a recent activity placeholder.
 */
import { headers } from "next/headers";
import {
  DollarSign,
  Users,
  TrendingUp,
  UserMinus,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OnboardingFlow } from "./_components/OnboardingFlow";

interface MetricCard {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
}

const METRIC_CARDS: MetricCard[] = [
  {
    title: "Total Revenue",
    value: "$0.00",
    trend: "+0% from last month",
    trendUp: true,
    icon: <DollarSign className="h-5 w-5 text-muted-foreground" />,
  },
  {
    title: "Active Users",
    value: "0",
    trend: "+0% from last month",
    trendUp: true,
    icon: <Users className="h-5 w-5 text-muted-foreground" />,
  },
  {
    title: "Conversions",
    value: "0%",
    trend: "+0% from last month",
    trendUp: true,
    icon: <TrendingUp className="h-5 w-5 text-muted-foreground" />,
  },
  {
    title: "Churn Rate",
    value: "0%",
    trend: "0% from last month",
    trendUp: false,
    icon: <UserMinus className="h-5 w-5 text-muted-foreground" />,
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

      {/* Metrics Overview */}
      <section aria-label="Metrics Overview">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">
          Metrics Overview
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {METRIC_CARDS.map((card) => (
            <Card
              key={card.title}
              className="transition-shadow hover:shadow-md dark:hover:shadow-primary/10"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-sm font-medium">
                    {card.title}
                  </CardDescription>
                  {card.icon}
                </div>
                <CardTitle className="text-3xl font-bold">
                  {card.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={card.trendUp ? "default" : "destructive"}
                  className="text-xs font-normal"
                >
                  {card.trend}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Onboarding Flow */}
      <OnboardingFlow />

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
