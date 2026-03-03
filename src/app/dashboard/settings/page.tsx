/**
 * Page paramètres du tableau de bord.
 * Permet de modifier le profil et changer le mot de passe.
 * Composants shadcn/ui : Tabs, Input, Label, Button.
 */
"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  // ── Profile form state ──
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
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
        setProfileStatus({ type: "error", message: data.error ?? "Update failed" });
      } else {
        setProfileStatus({ type: "success", message: "Profile updated successfully." });
      }
    } catch {
      setProfileStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordStatus(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Passwords do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({ type: "error", message: "Password must be at least 8 characters." });
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
        setPasswordStatus({ type: "error", message: data.error ?? "Password change failed" });
      } else {
        setPasswordStatus({ type: "success", message: "Password changed successfully." });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      setPasswordStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger
            value="profile"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            Password
          </TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ── */}
        <TabsContent value="profile" className="mt-6">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your name and email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="jane@example.com"
                  />
                </div>

                {profileStatus && (
                  <div
                    className={[
                      "rounded-lg px-4 py-3 text-sm",
                      profileStatus.type === "success"
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border border-destructive/20 bg-destructive/10 text-destructive",
                    ].join(" ")}
                  >
                    {profileStatus.message}
                  </div>
                )}

                <Button type="submit" disabled={profileLoading} className="w-full">
                  {profileLoading ? "Saving…" : "Save changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Password Tab ── */}
        <TabsContent value="password" className="mt-6">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Enter your current password and a new one.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-sm font-medium">
                    Current password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-sm font-medium">
                    New password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                    }
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm new password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
                    }
                    required
                  />
                </div>

                {passwordStatus && (
                  <div
                    className={[
                      "rounded-lg px-4 py-3 text-sm",
                      passwordStatus.type === "success"
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border border-destructive/20 bg-destructive/10 text-destructive",
                    ].join(" ")}
                  >
                    {passwordStatus.message}
                  </div>
                )}

                <Button type="submit" disabled={passwordLoading} className="w-full">
                  {passwordLoading ? "Changing…" : "Change password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
