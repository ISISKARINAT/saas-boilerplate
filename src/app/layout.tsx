import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SaaS Boilerplate — Build faster, ship smarter",
    template: "%s | SaaS Boilerplate",
  },
  description:
    "The production-ready Next.js SaaS boilerplate with authentication, billing, transactional emails, and a polished dashboard. Launch your product in days, not months.",
  keywords: [
    "SaaS boilerplate",
    "Next.js starter",
    "Next.js SaaS template",
    "authentication boilerplate",
    "Stripe billing",
    "TypeScript",
    "Tailwind CSS",
    "Turso",
    "shadcn/ui",
  ],
  authors: [{ name: "SaaS Boilerplate", url: BASE_URL }],
  creator: "SaaS Boilerplate",
  publisher: "SaaS Boilerplate",
  category: "technology",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "SaaS Boilerplate",
    title: "SaaS Boilerplate — Build faster, ship smarter",
    description:
      "The production-ready Next.js SaaS boilerplate with authentication, billing, transactional emails, and a polished dashboard. Launch your product in days, not months.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SaaS Boilerplate — Build faster, ship smarter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@saasboilerplate",
    creator: "@saasboilerplate",
    title: "SaaS Boilerplate — Build faster, ship smarter",
    description:
      "The production-ready Next.js SaaS boilerplate with authentication, billing, transactional emails, and a polished dashboard.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <main>{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
