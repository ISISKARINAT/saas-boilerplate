/**
 * POST /api/auth/refresh — Renouvellement du token JWT.
 * Valide l'ancien token, émet un nouveau JWT valide 12h.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, createToken } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const existingToken = request.cookies.get("token")?.value;

    if (!existingToken) {
      return NextResponse.json(
        { error: "Aucun token trouvé" },
        { status: 401 }
      );
    }

    // Validation de l'ancien token
    const payload = await verifyToken(existingToken);

    if (!payload) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    // Émission d'un nouveau token
    const newToken = await createToken(payload.userId);

    const response = NextResponse.json(
      { userId: payload.userId },
      { status: 200 }
    );

    response.cookies.set("token", newToken, {
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
