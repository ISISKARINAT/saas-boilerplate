/**
 * Page facturation du tableau de bord.
 * Affiche le statut d'abonnement, le portail Stripe et l'historique des factures.
 * Composants shadcn/ui : Card, Table, Button, Badge.
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface SubscriptionInfo {
  plan: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "inactive";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  currency: string;
  status: "paid" | "open" | "void";
  downloadUrl: string | null;
}

const STATUS_BADGES: Record<
  SubscriptionInfo["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { label: "Active", variant: "default" },
  trialing: { label: "Free trial", variant: "secondary" },
  past_due: { label: "Past due", variant: "destructive" },
  canceled: { label: "Canceled", variant: "destructive" },
  inactive: { label: "Inactive", variant: "outline" },
};

const INVOICE_STATUS: Record<Invoice["status"], { label: string; className: string }> = {
  paid: { label: "Paid", className: "text-emerald-500" },
  open: { label: "Pending", className: "text-amber-500" },
  void: { label: "Void", className: "text-muted-foreground" },
};

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBillingData() {
      try {
        const [subRes, invRes] = await Promise.all([
          fetch("/api/protected/billing/subscription"),
          fetch("/api/protected/billing/invoices"),
        ]);
        if (subRes.ok) {
          setSubscription(await subRes.json() as SubscriptionInfo);
        }
        if (invRes.ok) {
          const invData: { invoices: Invoice[] } = await invRes.json();
          setInvoices(invData.invoices);
        }
      } catch {
        setError("Unable to load billing data.");
      } finally {
        setLoading(false);
      }
    }
    void fetchBillingData();
  }, []);

  async function handleManagePlan() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/protected/billing/portal", { method: "POST" });
      const data: { url?: string; error?: string } = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Unable to open Stripe portal.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const statusInfo = subscription
    ? STATUS_BADGES[subscription.status]
    : STATUS_BADGES.inactive;

  const isNoActiveSub =
    !subscription ||
    subscription.status === "inactive" ||
    subscription.status === "canceled";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription and view your invoices.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Current subscription */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Current plan</CardTitle>
              <CardDescription className="mt-2 flex items-center gap-3">
                <span className="text-2xl font-bold text-foreground">
                  {subscription?.plan ?? "No subscription"}
                </span>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </CardDescription>
              {subscription?.currentPeriodEnd && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {subscription.cancelAtPeriodEnd ? "Ends on " : "Renews on "}
                  <span className="font-medium text-foreground">
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleManagePlan}
              disabled={portalLoading}
              className="shrink-0 border-primary text-primary hover:bg-primary/10"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {portalLoading ? "Loading…" : "Manage subscription"}
            </Button>
          </div>
        </CardHeader>

        {isNoActiveSub && (
          <CardContent>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
              <p className="mb-3 text-sm text-muted-foreground">
                Upgrade to a paid plan to unlock all features.
              </p>
              <Button size="sm" asChild>
                <Link href="/#pricing">View plans</Link>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Invoice history */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice history</CardTitle>
          <CardDescription>Your past billing receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No invoices yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Invoice #</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const invStatus = INVOICE_STATUS[invoice.status];
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">
                        {invoice.number}
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(invoice.date)}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatAmount(invoice.amount, invoice.currency)}
                      </TableCell>
                      <TableCell className={`text-sm ${invStatus.className}`}>
                        {invStatus.label}
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.downloadUrl ? (
                          <a
                            href={invoice.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary/80"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

