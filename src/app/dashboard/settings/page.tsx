/**
 * Settings page — Server Component.
 * Loads the current user's profile from DB and passes it to the SettingsForms client component.
 * Forms use Server Actions (updateProfileAction, changePasswordAction) for zero-client-fetch UX.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/lib/db";
import { SettingsForms } from "../_components/SettingsForms";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account profile and preferences.",
  robots: { index: false, follow: false },
};

async function getCurrentUser(userId: string) {
  try {
    const result = await client.execute({
      sql: "SELECT name, email FROM users WHERE id = ? LIMIT 1",
      args: [userId],
    });
    const row = result.rows[0];
    if (!row) return null;
    return {
      name: String(row["name"] ?? ""),
      email: String(row["email"] ?? ""),
    };
  } catch {
    return null;
  }
}

export default async function SettingsPage() {
  const headersList = await headers();
  const userId = headersList.get("X-User-Id");

  if (!userId) redirect("/login");

  const user = await getCurrentUser(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <SettingsForms
        initialName={user?.name ?? ""}
        initialEmail={user?.email ?? ""}
      />
    </div>
  );
}
