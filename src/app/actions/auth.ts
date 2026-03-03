"use server";

/**
 * Server Actions d'authentification.
 * Gèrent la connexion, l'inscription, la réinitialisation de mot de passe.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import { randomUUID } from "crypto";
import { client } from "@/lib/db";
import { verifyPassword, createToken, hashPassword, sendResetPasswordEmail } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

function getJwtSecretKey(): Uint8Array {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET manquant");
  return new TextEncoder().encode(secret);
}

const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env["NODE_ENV"] === "production",
  sameSite: "strict" as const,
  maxAge: 60 * 60 * 12, // 12h
  path: "/",
};

/** État retourné par les actions d'authentification (login, register, reset) */
export type AuthActionState = { error: string } | null;

/** État retourné par l'action forgot-password */
export type ForgotPasswordState = { error: string } | { success: true } | null;

// ── Connexion ──────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const redirectPath = String(formData.get("redirect") || "/dashboard");

  try {
    const { email, password } = parsed.data;

    const result = await client.execute({
      sql: "SELECT id, hashed_password FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });

    const row = result.rows[0];
    if (!row) {
      return { error: "Identifiants incorrects" };
    }

    const isValid = await verifyPassword(password, String(row["hashed_password"]));
    if (!isValid) {
      return { error: "Identifiants incorrects" };
    }

    const token = await createToken(String(row["id"]));
    const cookieStore = await cookies();
    cookieStore.set("token", token, TOKEN_COOKIE_OPTIONS);
  } catch {
    return { error: "Erreur interne du serveur" };
  }

  redirect(redirectPath);
}

// ── Inscription ────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
});

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { email, password, confirmPassword } = parsed.data;

  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas" };
  }

  try {
    const existing = await client.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });

    if (existing.rows.length > 0) {
      return { error: "Cette adresse e-mail est déjà utilisée" };
    }

    const hashedPassword = await hashPassword(password);
    const insertResult = await client.execute({
      sql: "INSERT INTO users (email, hashed_password) VALUES (?, ?) RETURNING id",
      args: [email, hashedPassword],
    });

    const userId = String(insertResult.rows[0]?.["id"]);
    const token = await createToken(userId);
    const cookieStore = await cookies();
    cookieStore.set("token", token, TOKEN_COOKIE_OPTIONS);

    const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
    sendEmail(email, "welcome", {
      userName: email.split("@")[0] ?? email,
      ctaUrl: `${appUrl}/dashboard`,
    }).catch((err: unknown) => {
      console.error("[register] Échec envoi WelcomeEmail", err);
    });
  } catch {
    return { error: "Erreur interne du serveur" };
  }

  redirect("/dashboard");
}

// ── Mot de passe oublié ────────────────────────────────────────────────────

const forgotSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
});

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    const { email } = parsed.data;

    const result = await client.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });

    if (result.rows.length > 0) {
      const userId = String(result.rows[0]?.["id"]);
      const jti = randomUUID();

      const resetToken = await new SignJWT({ userId, type: "password-reset" })
        .setProtectedHeader({ alg: "HS256" })
        .setJti(jti)
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(getJwtSecretKey());

      await sendResetPasswordEmail(email, resetToken).catch((err: unknown) => {
        console.error("[forgot-password] Échec envoi email", err);
      });
    }

    // Toujours succès pour éviter l'énumération d'adresses e-mail
    return { success: true };
  } catch {
    return { error: "Erreur interne du serveur" };
  }
}

// ── Réinitialisation du mot de passe ──────────────────────────────────────

const resetSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
});

export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { token, password, confirmPassword } = parsed.data;

  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas" };
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());

    if (payload["type"] !== "password-reset") {
      return { error: "Lien de réinitialisation invalide ou expiré" };
    }

    const userId = String(payload["userId"]);
    const hashedPassword = await hashPassword(password);

    await client.execute({
      sql: "UPDATE users SET hashed_password = ?, updated_at = datetime('now') WHERE id = ?",
      args: [hashedPassword, userId],
    });
  } catch {
    return { error: "Lien de réinitialisation invalide ou expiré" };
  }

  redirect("/login?reset=success");
}
