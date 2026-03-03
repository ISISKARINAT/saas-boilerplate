"use client";

/**
 * Page de réinitialisation du mot de passe (étape 1).
 * Envoie un e-mail avec un lien de réinitialisation via POST /api/auth/forgot-password.
 */
import { useState, FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Erreur lors de la demande";
        setError(message);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Impossible d'envoyer l'e-mail. Vérifiez votre connexion.");
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
              Mot de passe oublié
            </h1>
            <p className="text-sm text-text/60 mt-1">
              Saisissez votre e-mail pour recevoir un lien de réinitialisation
            </p>
          </div>

          {success ? (
            <div
              role="status"
              className="bg-success/10 border border-success/30 text-success rounded-lg px-4 py-3 text-sm text-center"
            >
              Un e-mail vous a été envoyé si ce compte existe.
            </div>
          ) : (
            <>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </button>
              </form>
            </>
          )}

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
