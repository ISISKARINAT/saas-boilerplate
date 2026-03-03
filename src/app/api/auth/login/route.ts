/**
 * POST /api/auth/login — Authentification utilisateur.
 * Vérifie les identifiants, crée un JWT et le stocke dans un cookie HttpOnly.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createToken } from "@/lib/auth";
import { z } from "zod";

// Schéma de validation de la requête
const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Recherche de l'utilisateur en base
    const result = await db.execute({
      sql: "SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });

    const row = result.rows[0];

    // Même message d'erreur pour éviter l'énumération d'utilisateurs
    if (!row) {
      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    const hashedPassword = String(row["password_hash"]);
    const isValid = await verifyPassword(password, hashedPassword);

    if (!isValid) {
      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    const userId = String(row["id"]);
    const userEmail = String(row["email"]);
    const token = await createToken(userId);

    // Cookie HttpOnly, Secure en production, SameSite strict
    const response = NextResponse.json(
      { userId, email: userEmail },
      { status: 200 }
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
