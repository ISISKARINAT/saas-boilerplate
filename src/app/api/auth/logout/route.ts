/**
 * GET|POST /api/auth/logout — Déconnexion de l'utilisateur.
 * Supprime le cookie JWT et retourne une réponse 200.
 */
import { NextResponse } from "next/server";

function buildLogoutResponse(): NextResponse {
  const response = NextResponse.json({ success: true }, { status: 200 });
  // Suppression du cookie JWT en le faisant expirer immédiatement
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return response;
}

export function GET(): NextResponse {
  return buildLogoutResponse();
}

export function POST(): NextResponse {
  return buildLogoutResponse();
}
