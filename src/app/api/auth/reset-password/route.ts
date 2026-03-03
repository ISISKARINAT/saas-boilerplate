/**
 * POST /api/auth/reset-password — Réinitialisation du mot de passe.
 * Valide le token JWT de réinitialisation et met à jour le mot de passe en base.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { jwtVerify } from "jose";
import { z } from "zod";

const resetSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

function getJwtSecretKey(): Uint8Array {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET manquant");
  return new TextEncoder().encode(secret);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // Vérification et décodage du token de réinitialisation
    let userId: string;
    try {
      const { payload } = await jwtVerify(token, getJwtSecretKey());

      if (payload["type"] !== "password-reset") {
        throw new Error("Type de token invalide");
      }

      userId = String(payload["userId"]);
    } catch {
      return NextResponse.json(
        { error: "Lien de réinitialisation invalide ou expiré" },
        { status: 400 }
      );
    }

    // Mise à jour du mot de passe
    const hashedPassword = await hashPassword(password);
    await db.execute({
      sql: "UPDATE users SET hashed_password = ?, updated_at = datetime('now') WHERE id = ?",
      args: [hashedPassword, userId],
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
