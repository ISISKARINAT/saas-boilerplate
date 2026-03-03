import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your free SaaS Boilerplate account and start building today.",
  alternates: { canonical: "/register" },
  robots: { index: true, follow: true },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
