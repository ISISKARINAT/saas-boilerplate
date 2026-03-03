"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type BillingCycle = "monthly" | "yearly";

const PLANS = [
  {
    name: "Free",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    period: "/month",
    description: "Perfect for side projects and trying things out.",
    features: [
      "Up to 100 users",
      "1 GB storage",
      "Community support",
      "Basic analytics",
      "2 projects",
    ],
    cta: "Get started free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: "$49",
    yearlyPrice: "$39",
    period: "/month",
    description: "For growing teams that need more power and flexibility.",
    features: [
      "Unlimited users",
      "50 GB storage",
      "Priority email support",
      "Advanced analytics",
      "Custom domain",
      "API access",
      "Unlimited projects",
    ],
    cta: "Start free trial",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    period: "",
    description: "For large organisations with specific requirements.",
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "Dedicated support",
      "99.9% SLA guarantee",
      "SSO / SAML",
      "Custom integrations",
      "Audit logs",
    ],
    cta: "Contact sales",
    href: "mailto:sales@example.com",
    highlighted: false,
  },
] as const;

export function PricingSection() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mb-8 text-xl text-muted-foreground">
            No hidden fees. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-zinc-900 p-1.5">
            <button
              onClick={() => setBilling("monthly")}
              className={[
                "rounded-full px-5 py-2 text-sm font-medium transition-all",
                billing === "monthly"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-zinc-100",
              ].join(" ")}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={[
                "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all",
                billing === "yearly"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-zinc-100",
              ].join(" ")}
            >
              Yearly
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PLANS.map(({ name, monthlyPrice, yearlyPrice, period, description, features, cta, href, highlighted }) => {
            const price = billing === "yearly" ? yearlyPrice : monthlyPrice;
            return (
              <Card
                key={name}
                className={[
                  "relative flex flex-col transition-all duration-300",
                  highlighted
                    ? "border-indigo-500 bg-indigo-950/40 shadow-[0_0_60px_rgba(99,102,241,0.2)] scale-[1.02]"
                    : "border-white/[0.08] bg-zinc-900 hover:border-white/[0.15]",
                ].join(" ")}
              >
                {highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    ✦ Most popular
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-white">{name}</CardTitle>
                  <CardDescription className="text-sm">{description}</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white">{price}</span>
                    {period && (
                      <span className="text-base text-muted-foreground">{period}</span>
                    )}
                  </div>
                  {billing === "yearly" && name !== "Free" && name !== "Enterprise" && (
                    <p className="text-sm text-emerald-400">
                      Billed as ${parseInt(yearlyPrice.replace("$", "")) * 12}/year
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-6">
                  <ul className="flex-1 space-y-3">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-sm text-zinc-300">
                        <Check className="h-4 w-4 shrink-0 text-indigo-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={highlighted ? "default" : "outline"}
                    size="lg"
                    className={[
                      "w-full",
                      highlighted ? "bg-indigo-600 hover:bg-indigo-500" : "",
                    ].join(" ")}
                    asChild
                  >
                    <Link href={href}>{cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
