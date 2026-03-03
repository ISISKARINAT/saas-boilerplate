import Link from "next/link";
import type { Metadata } from "next";
import {
  Rocket,
  ShieldCheck,
  Zap,
  Globe,
  Code2,
  BarChart3,
  Github,
  Twitter,
  Linkedin,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PricingSection } from "@/components/landing/pricing-section";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Boilerplate — Build faster, ship smarter";
  const description =
    "The modern SaaS boilerplate with auth, billing, and everything you need to launch.";
  return {
    title,
    description,
    keywords: [
      "SaaS boilerplate",
      "Next.js template",
      "startup kit",
      "authentication",
      "Stripe billing",
      "ship fast",
    ],
    alternates: {
      canonical: "/",
    },
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
    icon: Rocket,
    title: "Ship in minutes",
    description:
      "Pre-configured Next.js app with TypeScript, Tailwind, and all the tooling you need. Clone, configure, deploy.",
  },
  {
    icon: ShieldCheck,
    title: "Auth built-in",
    description:
      "JWT-based auth with secure HttpOnly cookies, registration, login, and password reset — production-ready from day one.",
  },
  {
    icon: Zap,
    title: "Blazing fast",
    description:
      "Optimised for Core Web Vitals with server components, edge caching, and lazy loading out of the box.",
  },
  {
    icon: Globe,
    title: "Deploy anywhere",
    description:
      "Runs on Vercel, Cloudflare, Railway, or your own infrastructure. Docker-ready with a single command.",
  },
  {
    icon: Code2,
    title: "Developer first",
    description:
      "Fully typed APIs, strict ESLint rules, and a clean architecture that scales as your team grows.",
  },
  {
    icon: BarChart3,
    title: "Built-in analytics",
    description:
      "Track events, funnels, and retention without a third-party script. Your data stays yours.",
  },
] as const;

const FAQS = [
  {
    question: "Do I need a credit card to start?",
    answer:
      "No. The Free plan requires no payment information. We only ask for billing details when you choose to upgrade to Pro.",
  },
  {
    question: "Can I change my plan at any time?",
    answer:
      "Yes. You can upgrade or downgrade at any time from the billing dashboard. Changes are immediate and prorated automatically.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your data is retained for 30 days after cancellation. You can export everything before the account is permanently deleted. We never hold your data hostage.",
  },
  {
    question: "Is there a self-hosted option?",
    answer:
      "Yes. The Enterprise plan includes a self-hosted license with full source code access and deployment support.",
  },
  {
    question: "What support channels are available?",
    answer:
      "Free users get community support via Discord. Pro users get priority email support with a 24-hour SLA. Enterprise customers receive a dedicated Slack channel and a named account manager.",
  },
  {
    question: "How does the yearly billing discount work?",
    answer:
      "When you switch to yearly billing you save 20% compared to paying month-to-month. You are charged a single annual payment upfront.",
  },
] as const;

const FOOTER_LINKS = {
  Product: [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "/changelog", label: "Changelog" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "mailto:hello@example.com", label: "Contact" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
  ],
} as const;

const SOCIAL_LINKS = [
  { href: "https://github.com", label: "GitHub", icon: Github },
  { href: "https://twitter.com", label: "Twitter / X", icon: Twitter },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <span className="text-xl font-bold text-indigo-400">Boilerplate</span>
          <div className="hidden items-center gap-8 sm:flex">
            {[
              { href: "#features", label: "Features" },
              { href: "#pricing", label: "Pricing" },
              { href: "#faq", label: "FAQ" },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-sm text-muted-foreground transition-colors hover:text-zinc-100"
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16 text-center">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            Now with React Email + Resend
          </div>

          <h1 className="mb-6 text-6xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-7xl lg:text-8xl">
            Build faster,{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              ship smarter
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-zinc-400">
            The production-ready Next.js boilerplate with authentication,
            billing, transactional emails, and a polished dashboard — so you can
            focus entirely on what makes your product unique.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="h-12 bg-indigo-600 px-8 text-base hover:bg-indigo-500"
              asChild
            >
              <Link href="/register">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="#features">Learn more</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex flex-col items-center gap-2">
            <div className="flex -space-x-2">
              {[
                "bg-indigo-500",
                "bg-violet-500",
                "bg-purple-500",
                "bg-blue-500",
                "bg-sky-500",
              ].map((color, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-full border-2 border-zinc-950 ${color}`}
                />
              ))}
            </div>
            <p className="text-sm text-zinc-500">
              Trusted by <span className="text-zinc-300 font-medium">2,400+</span> developers worldwide
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Everything you need to launch
            </h2>
            <p className="text-xl text-zinc-400">
              Skip months of boilerplate setup. We&apos;ve already built it.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="group border-white/[0.08] bg-zinc-900/60 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/40 hover:bg-zinc-900"
              >
                <CardHeader className="pb-3">
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 transition-colors group-hover:bg-indigo-500/20">
                    <Icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-white">
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing (client component with toggle) ── */}
      <PricingSection />

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Frequently asked questions
            </h2>
            <p className="text-xl text-zinc-400">
              Can&apos;t find the answer you&apos;re looking for?{" "}
              <Link
                href="mailto:hello@example.com"
                className="text-indigo-400 underline-offset-4 hover:underline"
              >
                Reach out to us.
              </Link>
            </p>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map(({ question, answer }, i) => (
              <AccordionItem
                key={question}
                value={`faq-${i}`}
                className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 px-6 transition-colors hover:border-white/[0.12]"
              >
                <AccordionTrigger className="py-5 text-left text-base font-semibold text-white hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-zinc-400">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 to-zinc-900 p-12 text-center shadow-[0_0_80px_rgba(99,102,241,0.15)]">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-600/5 to-violet-600/5" />
            <h2 className="mb-4 text-4xl font-bold text-white">
              Ready to ship your product?
            </h2>
            <p className="mb-8 text-lg text-zinc-400">
              Join thousands of developers who launch faster with Boilerplate.
            </p>
            <Button
              size="lg"
              className="h-12 bg-indigo-600 px-8 text-base hover:bg-indigo-500"
              asChild
            >
              <Link href="/register">
                Start building for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2">
              <span className="text-2xl font-bold text-indigo-400">Boilerplate</span>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
                The production-ready Next.js starter kit for modern SaaS. Ship
                your first product in days, not months.
              </p>
              {/* Social icons */}
              <div className="mt-6 flex items-center gap-4">
                {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900 text-zinc-400 transition-colors hover:border-indigo-500/40 hover:bg-zinc-800 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {(Object.entries(FOOTER_LINKS) as [string, readonly { href: string; label: string }[]][]).map(
              ([category, links]) => (
                <div key={category}>
                  <h3 className="mb-4 text-sm font-semibold text-white">{category}</h3>
                  <ul className="space-y-3">
                    {links.map(({ href, label }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Boilerplate, Inc. All rights reserved.
            </p>
            <p className="text-sm text-zinc-500">
              Built with ❤️ using Next.js, Tailwind CSS, and shadcn/ui
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
