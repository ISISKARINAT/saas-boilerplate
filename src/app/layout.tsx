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
    default: "SaaS Boilerplate",
    template: "%s | SaaS Boilerplate",
  },
  description:
    "Boilerplate Next.js production-ready avec Turso, JWT et Tailwind. Lancez votre SaaS en quelques heures.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: BASE_URL,
    siteName: "SaaS Boilerplate",
    title: "SaaS Boilerplate",
    description:
      "Boilerplate Next.js production-ready avec Turso, JWT et Tailwind. Lancez votre SaaS en quelques heures.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SaaS Boilerplate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Boilerplate",
    description:
      "Boilerplate Next.js production-ready avec Turso, JWT et Tailwind. Lancez votre SaaS en quelques heures.",
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
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
