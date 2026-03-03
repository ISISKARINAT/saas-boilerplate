"use client";

/**
 * Page de réinitialisation du mot de passe (étape 2).
 * Récupère le token dans l'URL et envoie le nouveau mot de passe via POST /api/auth/reset-password.
 */
import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Lien de réinitialisation invalide ou expiré.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Erreur lors de la réinitialisation";
        setError(message);
        return;
      }

      router.push("/login?reset=success");
    } catch {
      setError("Impossible de réinitialiser. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text">
              Nouveau mot de passe
            </h1>
            <p className="text-sm text-text/60 mt-1">
              Choisissez un mot de passe sécurisé
            </p>
          </div>

          {!token && (
            <div
              role="alert"
              className="bg-error/10 border border-error/30 text-error rounded-lg px-4 py-3 text-sm"
            >
              Lien de réinitialisation manquant ou invalide.
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="bg-error/10 border border-error/30 text-error rounded-lg px-4 py-3 text-sm"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text mb-1"
              >
                Nouveau mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Minimum 8 caractères"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-text mb-1"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Répétez votre mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Réinitialisation…" : "Réinitialiser"}
            </button>
          </form>

          <p className="text-center text-sm text-text/60">
            <Link href="/login" className="text-primary hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
