"use client";

/**
 * Sidebar de navigation principale — responsive drawer sur mobile, statique sur desktop.
 * Mobile : overlay drawer caché par défaut, activé par bouton hamburger.
 * Desktop (md+) : toujours visible, intégré dans le layout flex.
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  LogOut,
  Moon,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function toggleDarkMode() {
    document.documentElement.classList.toggle("dark");
  }

  return (
    <>
      {/* Bouton hamburger — visible uniquement sur mobile */}
      <button
        aria-label="Ouvrir le menu de navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center w-9 h-9 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panneau sidebar */}
      <aside
        className={[
          "flex flex-col flex-shrink-0 w-64 bg-card border-r border-border",
          "fixed inset-y-0 left-0 z-40 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:translate-x-0 md:transition-none",
        ].join(" ")}
      >
        {/* Logo + bouton fermeture mobile */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <span className="text-xl font-bold text-primary">Boilerplate</span>
          <button
            aria-label="Fermer le menu de navigation"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors md:hidden"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Liens de navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Actions en pied de sidebar */}
        <div className="p-4 border-t border-border space-y-1">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Moon className="h-4 w-4" aria-hidden="true" />
            Dark Mode
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
