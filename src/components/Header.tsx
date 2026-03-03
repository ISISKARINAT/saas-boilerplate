"use client";

/**
 * En-tête du tableau de bord.
 * Affiche le titre de la page, l'avatar de l'utilisateur et un menu déroulant.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userId: string;
}

export default function Header({ userId }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Initiales pour l'avatar (fallback si pas de nom)
  const initials = userId.slice(0, 2).toUpperCase();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="h-16 flex-shrink-0 border-b border-white/10 bg-surface px-6 flex items-center justify-between">
      {/* Titre dynamique (géré par les layouts enfants) */}
      <div className="text-sm text-text/40 font-medium">Tableau de bord</div>

      {/* Avatar + menu déroulant */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-48 rounded-xl bg-surface border border-white/10 shadow-xl py-1 z-50"
          >
            <div className="px-4 py-2 border-b border-white/10">
              <p className="text-xs text-text/40">Connecté en tant que</p>
              <p className="text-sm text-text font-medium truncate">{userId}</p>
            </div>

            <button
              role="menuitem"
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
