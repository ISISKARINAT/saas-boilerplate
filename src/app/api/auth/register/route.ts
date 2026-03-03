/**
 * POST /api/auth/register — Inscription d'un nouvel utilisateur.
 * Vérifie l'unicité de l'e-mail, hache le mot de passe, insère l'utilisateur et retourne un JWT.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

// Schéma de validation de la requête
const registerSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Vérification de l'unicité de l'e-mail
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Cette adresse e-mail est déjà utilisée" },
        { status: 400 }
      );
    }

    // Hachage du mot de passe et insertion
    const hashedPassword = await hashPassword(password);
    const insertResult = await db.execute({
      sql: "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?) RETURNING id",
      args: [email, hashedPassword, ""],
    });

    const userId = String(insertResult.rows[0]?.["id"]);
    const token = await createToken(userId);

    // Envoi de l'email de bienvenue (non bloquant)
    const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
    sendEmail(email, "welcome", {
      userName: email.split("@")[0] ?? email,
      ctaUrl: `${appUrl}/dashboard`,
    }).catch((err: unknown) => {
      console.error("[register] Échec envoi WelcomeEmail", {
        email,
        error: err instanceof Error ? err.message : "Erreur inconnue",
      });
    });

    const response = NextResponse.json(
      { userId, email },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 12, // 12 heures
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
