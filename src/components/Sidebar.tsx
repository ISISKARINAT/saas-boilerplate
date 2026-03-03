"use client";

/**
 * Barre latérale de navigation principale.
 * Inclut les liens de navigation, le bouton de déconnexion et le toggle dark mode.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: "⊞" },
  { href: "/dashboard/settings", label: "Paramètres", icon: "⚙" },
  { href: "/dashboard/billing", label: "Facturation", icon: "💳" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function toggleDarkMode() {
    document.documentElement.classList.toggle("dark");
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-surface border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <span className="text-xl font-bold text-primary">Boilerplate</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text/60 hover:text-text hover:bg-white/5",
              ].join(" ")}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Actions bas de page */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text/60 hover:text-text hover:bg-white/5 transition-colors"
        >
          <span aria-hidden="true">◐</span>
          Mode sombre
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-error/80 hover:text-error hover:bg-error/5 transition-colors"
        >
          <span aria-hidden="true">→</span>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
