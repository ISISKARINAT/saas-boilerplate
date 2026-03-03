/**
 * Layout du tableau de bord — composant serveur.
 * Protégé par le middleware (src/middleware.ts).
 * Inclut Sidebar, Header et Breadcrumbs.
 */
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  // Récupère l'ID utilisateur transmis par le middleware
  const headersList = await headers();
  const userId = headersList.get("X-User-Id");

  // Double vérification côté serveur (le middleware gère déjà la redirection)
  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-bg text-text overflow-hidden">
      {/* Navigation sidebar — responsive drawer on mobile, static on md+ */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header userId={userId} />

        {/* Extra left padding on mobile to clear the fixed hamburger button */}
        <main className="flex-1 overflow-y-auto p-6 pl-16 md:pl-6">
          <Breadcrumbs />
          <div className="mt-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
