import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your SaaS Boilerplate account to access your dashboard.",
  alternates: { canonical: "/login" },
  robots: { index: true, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
