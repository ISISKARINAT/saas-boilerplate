"use server";

/**
 * Server Actions for user settings (profile update, password change).
 * Both actions read the authenticated userId from the JWT cookie.
 */
import { cookies } from "next/headers";
import { z } from "zod";
import { client } from "@/lib/db";
import { verifyToken, verifyPassword, hashPassword } from "@/lib/auth";

export type SettingsActionState = {
  type: "success" | "error";
  message: string;
} | null;

// ── Helpers ────────────────────────────────────────────────────────────────

async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}

// ── Profile Update ─────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
});

export async function updateProfileAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { type: "error", message: "Not authenticated. Please log in again." };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      type: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { name, email } = parsed.data;

  try {
    // Check for email uniqueness (excluding current user)
    const existing = await client.execute({
      sql: "SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1",
      args: [email, userId],
    });

    if (existing.rows.length > 0) {
      return { type: "error", message: "That email address is already in use." };
    }

    await client.execute({
      sql: "UPDATE users SET name = ?, email = ? WHERE id = ?",
      args: [name, email, userId],
    });

    return { type: "success", message: "Profile updated successfully." };
  } catch {
    return { type: "error", message: "Internal server error. Please try again." };
  }
}

// ── Password Change ────────────────────────────────────────────────────────

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
});

export async function changePasswordAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { type: "error", message: "Not authenticated. Please log in again." };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      type: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { currentPassword, newPassword, confirmPassword } = parsed.data;

  if (newPassword !== confirmPassword) {
    return { type: "error", message: "New passwords do not match." };
  }

  try {
    const result = await client.execute({
      sql: "SELECT password_hash FROM users WHERE id = ? LIMIT 1",
      args: [userId],
    });

    const row = result.rows[0];
    if (!row) {
      return { type: "error", message: "User not found." };
    }

    const isValid = await verifyPassword(currentPassword, String(row["password_hash"]));
    if (!isValid) {
      return { type: "error", message: "Current password is incorrect." };
    }

    const newHash = await hashPassword(newPassword);
    await client.execute({
      sql: "UPDATE users SET password_hash = ? WHERE id = ?",
      args: [newHash, userId],
    });

    return { type: "success", message: "Password changed successfully." };
  } catch {
    return { type: "error", message: "Internal server error. Please try again." };
  }
}
