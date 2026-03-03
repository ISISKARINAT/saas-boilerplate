/**
 * Page facturation du tableau de bord.
 * Affiche le statut d'abonnement, le portail Stripe et l'historique des factures.
 */
"use client";

import { useState, useEffect } from "react";

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

const STATUS_LABELS: Record<SubscriptionInfo["status"], { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  trialing: { label: "Essai gratuit", className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  past_due: { label: "Paiement en retard", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  canceled: { label: "Annulé", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  inactive: { label: "Inactif", className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
};

const INVOICE_STATUS_LABELS: Record<Invoice["status"], { label: string; className: string }> = {
  paid: { label: "Payée", className: "text-emerald-400" },
  open: { label: "En attente", className: "text-amber-400" },
  void: { label: "Annulée", className: "text-zinc-500" },
};

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
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
          const subData: SubscriptionInfo = await subRes.json();
          setSubscription(subData);
        }
        if (invRes.ok) {
          const invData: { invoices: Invoice[] } = await invRes.json();
          setInvoices(invData.invoices);
        }
      } catch {
        setError("Impossible de charger les données de facturation.");
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
        setError(data.error ?? "Impossible d'accéder au portail Stripe.");
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-800" />
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-zinc-800" />
      </div>
    );
  }

  const statusInfo = subscription
    ? STATUS_LABELS[subscription.status]
    : STATUS_LABELS.inactive;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Facturation</h1>
        <p className="mt-1 text-zinc-400">
          Gérez votre abonnement et consultez vos factures.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Subscription card */}
      <div className="rounded-2xl border border-white/[0.08] bg-zinc-900 p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="mb-2 text-xl font-semibold text-zinc-100">
              Abonnement actuel
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">
                {subscription?.plan ?? "Aucun abonnement"}
              </span>
              <span
                className={[
                  "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  statusInfo.className,
                ].join(" ")}
              >
                {statusInfo.label}
              </span>
            </div>
            {subscription?.currentPeriodEnd && (
              <p className="mt-2 text-sm text-zinc-400">
                {subscription.cancelAtPeriodEnd
                  ? "Se termine le "
                  : "Prochain renouvellement le "}
                <span className="font-medium text-zinc-200">
                  {formatDate(subscription.currentPeriodEnd)}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={handleManagePlan}
            disabled={portalLoading}
            className="flex-shrink-0 rounded-xl border border-white/10 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {portalLoading ? "Chargement…" : "Gérer mon plan →"}
          </button>
        </div>

        {/* Upgrade prompt if no active sub */}
        {(!subscription || subscription.status === "inactive" || subscription.status === "canceled") && (
          <div className="mt-6 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-5">
            <p className="mb-3 text-sm text-zinc-300">
              Passez à un plan payant pour accéder à toutes les fonctionnalités.
            </p>
            <a
              href="/#pricing"
              className="inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Voir les plans
            </a>
          </div>
        )}
      </div>

      {/* Invoice history */}
      <div className="rounded-2xl border border-white/[0.08] bg-zinc-900 p-8">
        <h2 className="mb-6 text-xl font-semibold text-zinc-100">
          Historique des factures
        </h2>

        {invoices.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-zinc-500">Aucune facture pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="pb-3 text-left font-medium text-zinc-400">N° Facture</th>
                  <th className="pb-3 text-left font-medium text-zinc-400">Date</th>
                  <th className="pb-3 text-left font-medium text-zinc-400">Montant</th>
                  <th className="pb-3 text-left font-medium text-zinc-400">Statut</th>
                  <th className="pb-3 text-right font-medium text-zinc-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const invStatus = INVOICE_STATUS_LABELS[invoice.status];
                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      <td className="py-4 font-mono text-zinc-200">
                        {invoice.number}
                      </td>
                      <td className="py-4 text-zinc-400">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="py-4 font-medium text-zinc-200">
                        {formatAmount(invoice.amount, invoice.currency)}
                      </td>
                      <td className="py-4">
                        <span className={invStatus.className}>
                          {invStatus.label}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {invoice.downloadUrl ? (
                          <a
                            href={invoice.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 transition-colors hover:text-indigo-300"
                          >
                            Télécharger
                          </a>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
