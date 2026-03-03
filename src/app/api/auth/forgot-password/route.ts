/**
 * POST /api/auth/forgot-password — Demande de réinitialisation du mot de passe.
 * Génère un token de réinitialisation (JWT avec JTI) et envoie un e-mail.
 * Retourne toujours 200 pour éviter l'énumération d'adresses e-mail.
 */
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";
import { SignJWT } from "jose";
import { sendResetPasswordEmail } from "@/lib/auth";
import { z } from "zod";
import { randomUUID } from "crypto";

const forgotSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
});

function getJwtSecretKey(): Uint8Array {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET manquant");
  return new TextEncoder().encode(secret);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      // Retourne toujours 200 pour éviter l'énumération
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const { email } = parsed.data;

    // Recherche de l'utilisateur (silencieuse si absent)
    const result = await client.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });

    if (result.rows.length > 0) {
      const userId = String(result.rows[0]?.["id"]);
      const jti = randomUUID();

      // Token de réinitialisation valide 1 heure avec JTI unique
      const resetToken = await new SignJWT({ userId, type: "password-reset" })
        .setProtectedHeader({ alg: "HS256" })
        .setJti(jti)
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(getJwtSecretKey());

      const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
      const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

      // Envoi de l'email de réinitialisation via sendResetPasswordEmail
      await sendResetPasswordEmail(email, resetToken).catch((err: unknown) => {
        console.error("[forgot-password] Échec envoi ResetPasswordEmail", {
          error: err instanceof Error ? err.message : "Erreur inconnue",
        });
      });

      // En développement, on logue également l'URL pour faciliter les tests
      if (process.env["NODE_ENV"] !== "production") {
        console.log(`[RESET PASSWORD] URL: ${resetUrl}`);
      }
    }

    // Réponse identique qu'un utilisateur existe ou non
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
