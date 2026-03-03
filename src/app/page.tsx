/**
 * Page d'accueil publique — Landing Page.
 * Sections : Hero, Features, Pricing, FAQ, Footer.
 * Dark mode natif via Tailwind. Composants shadcn/ui + Lucide icons.
 */
import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, CreditCard, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Boilerplate — Build faster, ship smarter";
  const description =
    "The modern SaaS boilerplate with auth, billing, and everything you need to launch.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "/",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Authentication built-in",
    description:
      "JWT-based auth with secure HttpOnly cookies, registration, login, password reset — all production-ready out of the box.",
  },
  {
    icon: CreditCard,
    title: "Stripe billing",
    description:
      "Subscription management, invoicing, and customer portal integration. Monetise your SaaS in minutes, not weeks.",
  },
  {
    icon: Mail,
    title: "Transactional emails",
    description:
      "Beautiful React Email templates powered by Resend — welcome, password reset, and invoices delivered reliably.",
  },
] as const;

const PLANS = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for indie hackers and small projects.",
    features: [
      "Up to 1,000 users",
      "5 GB storage",
      "Email support",
      "Basic analytics",
      "Community access",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "For growing teams that need more power.",
    features: [
      "Unlimited users",
      "50 GB storage",
      "Priority support",
      "Advanced analytics",
      "Custom domain",
      "API access",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organisations with specific requirements.",
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "Dedicated support",
      "SLA guarantee",
      "SSO / SAML",
      "Custom integrations",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
] as const;

const FAQS = [
  {
    question: "Do I need a credit card to start?",
    answer:
      "No. You can try the Starter plan free for 14 days without entering any payment information. We only ask for billing details when you decide to upgrade.",
  },
  {
    question: "Can I change my plan at any time?",
    answer:
      "Yes. You can upgrade or downgrade your subscription at any time from the billing dashboard. Changes take effect immediately and are prorated.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your data is retained for 30 days after cancellation. You can export everything before the account is permanently deleted. We never hold your data hostage.",
  },
  {
    question: "Is there a self-hosted option?",
    answer:
      "Yes. The Enterprise plan includes a self-hosted license. You can deploy on your own infrastructure with full source code access.",
  },
  {
    question: "What support channels are available?",
    answer:
      "Starter users get community support via our Discord. Pro users get priority email support with a 24-hour response SLA. Enterprise customers receive a dedicated Slack channel and named account manager.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <span className="text-xl font-bold text-indigo-400">Boilerplate</span>
          <div className="flex items-center gap-6">
            <Link
              href="#features"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-zinc-100 sm:block"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-zinc-100 sm:block"
            >
              Pricing
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            Now with React Email + Resend
          </div>
          <h1 className="mb-6 text-6xl font-bold leading-tight tracking-tight text-white sm:text-7xl">
            Build faster,{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              ship smarter
            </span>
          </h1>
          <p className="mb-10 text-xl leading-relaxed text-muted-foreground">
            The production-ready Next.js boilerplate with authentication,
            billing, emails, and a dashboard — so you can focus on what makes
            your product unique.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Get started for free →</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">See features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">
              Everything you need to launch
            </h2>
            <p className="text-xl text-muted-foreground">
              Skip months of boilerplate setup. We&apos;ve already built it.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="border-white/[0.08] bg-zinc-900 transition-colors hover:border-indigo-500/30"
              >
                <CardHeader>
                  <Icon className="mb-2 h-8 w-8 text-indigo-400" />
                  <CardTitle className="text-2xl font-semibold text-white">
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {PLANS.map(({ name, price, period, description, features, cta, highlighted }) => (
              <Card
                key={name}
                className={[
                  "relative flex flex-col transition-all",
                  highlighted
                    ? "border-indigo-500 bg-indigo-950/40 shadow-[0_0_40px_rgba(99,102,241,0.15)]"
                    : "border-white/[0.08] bg-zinc-900",
                ].join(" ")}
              >
                {highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                    Most popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-white">{name}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white">{price}</span>
                    {period && (
                      <span className="text-base text-muted-foreground">{period}</span>
                    )}
                  </div>
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
                    className="w-full"
                    asChild
                  >
                    <Link href={name === "Enterprise" ? "mailto:sales@example.com" : "/register"}>
                      {cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">
              Frequently asked questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map(({ question, answer }, i) => (
              <AccordionItem
                key={question}
                value={`faq-${i}`}
                className="rounded-2xl border border-white/[0.08] bg-zinc-900 px-6"
              >
                <AccordionTrigger className="text-lg font-semibold text-white hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <span className="text-xl font-bold text-indigo-400">Boilerplate</span>
            <nav className="flex flex-wrap gap-6 md:justify-end">
              {[
                { href: "#features", label: "Features" },
                { href: "#pricing", label: "Pricing" },
                { href: "#faq", label: "FAQ" },
                { href: "/login", label: "Sign in" },
                { href: "/register", label: "Get started" },
              ].map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t border-white/[0.06] pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Boilerplate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
