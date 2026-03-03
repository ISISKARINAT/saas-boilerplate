/**
 * Middleware Next.js — protection des routes authentifiées.
 * Protège : /dashboard/*, /api/protected/*
 * Vérifie le JWT dans le cookie "token", redirige vers /login si invalide.
 * Transmet l'ID utilisateur via l'en-tête X-User-Id aux routes API.
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Routes protégées par l'authentification
const PROTECTED_ROUTES = ["/dashboard", "/api/protected"];

// Routes accessibles uniquement aux utilisateurs non-authentifiés
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

/**
 * Récupère la clé secrète JWT depuis les variables d'environnement.
 */
function getJwtSecretKey(): Uint8Array {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET manquant");
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Vérification si la route est protégée
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Récupération du token JWT depuis les cookies
  const token = request.cookies.get("token")?.value;

  if (isProtectedRoute) {
    if (!token) {
      // Pas de token — redirection vers /login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, getJwtSecretKey());
      const userId = payload["userId"];

      if (typeof userId !== "string") {
        throw new Error("userId manquant dans le payload JWT");
      }

      // Transmet l'ID utilisateur aux routes API via header
      const response = NextResponse.next();
      response.headers.set("X-User-Id", userId);
      return response;
    } catch {
      // Token invalide ou expiré — redirection vers /login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      // Supprime le cookie invalide
      response.cookies.delete("token");
      return response;
    }
  }

  // Redirige les utilisateurs déjà authentifiés loin des pages d'auth
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && token) {
    try {
      await jwtVerify(token, getJwtSecretKey());
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch {
      // Token invalide, laisse accéder à la page d'auth
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/protected/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
