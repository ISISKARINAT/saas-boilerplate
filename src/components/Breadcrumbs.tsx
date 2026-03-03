"use client";

/**
 * Breadcrumbs dynamiques basés sur l'URL courante.
 * Utilise usePathname() pour construire le fil d'Ariane.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

// Traductions des segments de l'URL en labels lisibles
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Tableau de bord",
  settings: "Paramètres",
  billing: "Facturation",
  profile: "Profil",
  users: "Utilisateurs",
};

function getLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    return { href, label: getLabel(segment), isLast };
  });

  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex items-center gap-1.5 text-sm">
        {crumbs.map(({ href, label, isLast }, index) => (
          <li key={href} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-text/30" aria-hidden="true">
                /
              </span>
            )}
            {isLast ? (
              <span className="text-text font-medium">{label}</span>
            ) : (
              <Link
                href={href}
                className="text-text/50 hover:text-text transition-colors"
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
