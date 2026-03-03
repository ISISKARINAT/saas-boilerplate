/**
 * Page 404 — page non trouvée.
 */
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text px-4">
      <div className="text-center space-y-4">
        <p className="text-8xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-semibold">Page introuvable</h1>
        <p className="text-text/60 max-w-md">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-6 py-2.5 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
