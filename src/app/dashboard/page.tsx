/**
 * Main analytics dashboard page — Server Component.
 * Fetches KPI metrics via getDashboardMetrics() (mock now, Turso-ready).
 * Displays a greeting header, metric cards, onboarding flow, and recent activity.
 */
import { headers } from "next/headers";
import { DollarSign, Users, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
import { OnboardingFlow } from "./_components/OnboardingFlow";
import { getDashboardMetrics } from "@/lib/dashboard";

const ACTIVITY_COLUMNS = ["Event", "User", "Date", "Status"] as const;
const PLACEHOLDER_ROWS = Array.from({ length: 5 }, (_, i) => i);

function formatMrr(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatActiveUsers(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const [headersList, metrics] = await Promise.all([
    headers(),
    getDashboardMetrics(),
  ]);

  const userId = headersList.get("X-User-Id") ?? "there";
  const today = formatDate(new Date());

  const kpiCards = [
    {
      title: "Monthly Recurring Revenue",
      subtitle: "MRR — active plans",
      value: formatMrr(metrics.mrr.value),
      changePercent: metrics.mrr.changePercent,
      icon: <DollarSign className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Total Users",
      subtitle: "All registered accounts",
      value: formatActiveUsers(metrics.totalUsers.value),
      changePercent: metrics.totalUsers.changePercent,
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Active Subscriptions",
      subtitle: "Status = active",
      value: formatActiveUsers(metrics.activeSubscriptions.value),
      changePercent: metrics.activeSubscriptions.changePercent,
      icon: <CreditCard className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{today}</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Good day, {userId} 👋
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Here&apos;s a snapshot of your key metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <section aria-label="Key Performance Indicators">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {kpiCards.map((card) => {
            const isPositive = card.changePercent >= 0;
            return (
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
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {isPositive ? "+" : ""}
                      {card.changePercent.toFixed(1)}% vs last month
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.subtitle}
                  </p>
                </CardContent>
              </Card>
            );
          })}
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
