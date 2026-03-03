"use client";

/**
 * Page d'inscription — formulaire email, mot de passe et confirmation.
 * Envoie une requête POST /api/auth/register et redirige vers /dashboard.
 */
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Erreur lors de l'inscription";
        setError(message);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Impossible de s'inscrire. Vérifiez votre connexion internet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text">Créer un compte</h1>
            <p className="text-sm text-text/60 mt-1">
              Rejoignez-nous dès aujourd&apos;hui
            </p>
          </div>

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
                htmlFor="email"
                className="block text-sm font-medium text-text mb-1"
              >
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text mb-1"
              >
                Mot de passe
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
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Inscription…" : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-sm text-text/60">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
