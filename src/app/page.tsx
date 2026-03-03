/**
 * Page d'accueil publique — Landing Page.
 * Sections : Hero, Features, Pricing, FAQ, Footer.
 * Dark mode natif via Tailwind.
 */
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boilerplate — Build faster, ship smarter",
  description:
    "The modern SaaS boilerplate with auth, billing, and everything you need to launch.",
};

const FEATURES = [
  {
    icon: "🔐",
    title: "Authentication built-in",
    description:
      "JWT-based auth with secure HttpOnly cookies, registration, login, password reset — all production-ready out of the box.",
  },
  {
    icon: "💳",
    title: "Stripe billing",
    description:
      "Subscription management, invoicing, and customer portal integration. Monetise your SaaS in minutes, not weeks.",
  },
  {
    icon: "📧",
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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-xl font-bold text-indigo-400">Boilerplate</span>
          <div className="flex items-center gap-6">
            <Link
              href="#features"
              className="hidden text-sm text-zinc-400 transition-colors hover:text-zinc-100 sm:block"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hidden text-sm text-zinc-400 transition-colors hover:text-zinc-100 sm:block"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Get started
            </Link>
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
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            Build faster,{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              ship smarter
            </span>
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-zinc-400 sm:text-xl">
            The production-ready Next.js boilerplate with authentication,
            billing, emails, and a dashboard — so you can focus on what makes
            your product unique.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="w-full rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-indigo-500 sm:w-auto"
            >
              Get started for free →
            </Link>
            <Link
              href="#features"
              className="w-full rounded-xl border border-white/10 px-8 py-3.5 text-base font-semibold text-zinc-300 transition-colors hover:border-white/20 hover:text-white sm:w-auto"
            >
              See features
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Everything you need to launch
            </h2>
            <p className="text-lg text-zinc-400">
              Skip months of boilerplate setup. We&apos;ve already built it.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {FEATURES.map(({ icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/[0.08] bg-zinc-900 p-8 transition-colors hover:border-indigo-500/30"
              >
                <div className="mb-4 text-4xl">{icon}</div>
                <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
                <p className="leading-relaxed text-zinc-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-zinc-400">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {PLANS.map(({ name, price, period, description, features, cta, highlighted }) => (
              <div
                key={name}
                className={[
                  "relative flex flex-col rounded-2xl border p-8 transition-all",
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
                <div className="mb-6">
                  <h3 className="mb-1 text-xl font-bold text-white">{name}</h3>
                  <p className="mb-4 text-sm text-zinc-400">{description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{price}</span>
                    {period && <span className="text-zinc-400">{period}</span>}
                  </div>
                </div>
                <ul className="mb-8 flex-1 space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <span className="text-indigo-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={name === "Enterprise" ? "mailto:sales@example.com" : "/register"}
                  className={[
                    "block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors",
                    highlighted
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "border border-white/10 text-zinc-300 hover:border-white/20 hover:text-white",
                  ].join(" ")}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-6">
            {FAQS.map(({ question, answer }) => (
              <div
                key={question}
                className="rounded-2xl border border-white/[0.08] bg-zinc-900 p-6"
              >
                <h3 className="mb-3 font-semibold text-white">{question}</h3>
                <p className="leading-relaxed text-zinc-400">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <span className="text-xl font-bold text-indigo-400">Boilerplate</span>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
              <Link href="#features" className="transition-colors hover:text-white">Features</Link>
              <Link href="#pricing" className="transition-colors hover:text-white">Pricing</Link>
              <Link href="#faq" className="transition-colors hover:text-white">FAQ</Link>
              <Link href="/login" className="transition-colors hover:text-white">Sign in</Link>
              <Link href="/register" className="transition-colors hover:text-white">Get started</Link>
            </nav>
          </div>
          <div className="border-t border-white/[0.06] pt-8 text-center text-sm text-zinc-500">
            © {new Date().getFullYear()} Boilerplate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
