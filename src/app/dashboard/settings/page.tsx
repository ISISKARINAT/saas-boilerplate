/**
 * Page paramètres du tableau de bord.
 * Permet de modifier le profil et changer le mot de passe.
 */
"use client";

import { useState, FormEvent } from "react";

type Tab = "profile" | "password";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // ── Profile form state ──
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });
  const [profileStatus, setProfileStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Password form state ──
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ── Profile submit ──
  async function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileStatus(null);
    setProfileLoading(true);
    try {
      const res = await fetch("/api/protected/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setProfileStatus({ type: "error", message: data.error ?? "Erreur lors de la mise à jour" });
      } else {
        setProfileStatus({ type: "success", message: "Profil mis à jour avec succès." });
      }
    } catch {
      setProfileStatus({ type: "error", message: "Erreur réseau. Réessayez." });
    } finally {
      setProfileLoading(false);
    }
  }

  // ── Password submit ──
  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordStatus(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({ type: "error", message: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/protected/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setPasswordStatus({ type: "error", message: data.error ?? "Erreur lors du changement de mot de passe" });
      } else {
        setPasswordStatus({ type: "success", message: "Mot de passe changé avec succès." });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      setPasswordStatus({ type: "error", message: "Erreur réseau. Réessayez." });
    } finally {
      setPasswordLoading(false);
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profil" },
    { id: "password", label: "Mot de passe" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Paramètres</h1>
        <p className="mt-1 text-zinc-400">Gérez votre compte et vos préférences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/[0.08] bg-zinc-900 p-1 w-fit">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={[
              "rounded-lg px-5 py-2 text-sm font-medium transition-colors",
              activeTab === id
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-zinc-100",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="max-w-lg rounded-2xl border border-white/[0.08] bg-zinc-900 p-8">
          <h2 className="mb-6 text-xl font-semibold text-zinc-100">
            Informations du profil
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Nom complet
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Jean Dupont"
                className="w-full rounded-lg border border-white/[0.08] bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="jean@example.com"
                className="w-full rounded-lg border border-white/[0.08] bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {profileStatus && (
              <div
                className={[
                  "rounded-lg px-4 py-3 text-sm",
                  profileStatus.type === "success"
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border border-red-500/20 bg-red-500/10 text-red-400",
                ].join(" ")}
              >
                {profileStatus.message}
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {profileLoading ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="max-w-lg rounded-2xl border border-white/[0.08] bg-zinc-900 p-8">
          <h2 className="mb-6 text-xl font-semibold text-zinc-100">
            Changer le mot de passe
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                }
                required
                className="w-full rounded-lg border border-white/[0.08] bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                }
                required
                minLength={8}
                className="w-full rounded-lg border border-white/[0.08] bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-zinc-500">Minimum 8 caractères.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                required
                className="w-full rounded-lg border border-white/[0.08] bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {passwordStatus && (
              <div
                className={[
                  "rounded-lg px-4 py-3 text-sm",
                  passwordStatus.type === "success"
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border border-red-500/20 bg-red-500/10 text-red-400",
                ].join(" ")}
              >
                {passwordStatus.message}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordLoading ? "Changement…" : "Changer le mot de passe"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
