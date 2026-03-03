/**
 * Middleware Next.js — protection des routes authentifiées.
 * Protège : /dashboard/*, /api/protected/*
 * Vérifie le JWT dans le cookie "token", redirige vers /login si invalide.
 * Rafraîchit automatiquement le token quand il expire dans moins d'1 heure.
 * Transmet l'ID utilisateur via l'en-tête X-User-Id aux Server Components.
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

/** Seuil de rafraîchissement du token : 1 heure avant expiration */
const TOKEN_REFRESH_THRESHOLD = 3600;

const PROTECTED_ROUTES = ["/dashboard", "/api/protected"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

function getJwtSecretKey(): Uint8Array {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET manquant");
  return new TextEncoder().encode(secret);
}

/** Émet un nouveau JWT de session (Edge-safe — pas de bcrypt). */
async function mintToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .setSubject(userId)
    .sign(getJwtSecretKey());
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  if (isProtectedRoute) {
    if (!token) {
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

      const response = NextResponse.next();
      response.headers.set("X-User-Id", userId);

      // Rafraîchit le token s'il expire dans moins d'1 heure
      const exp = payload.exp;
      if (typeof exp === "number") {
        const now = Math.floor(Date.now() / 1000);
        if (exp - now < TOKEN_REFRESH_THRESHOLD) {
          const refreshed = await mintToken(userId);
          response.cookies.set("token", refreshed, {
            httpOnly: true,
            secure: process.env["NODE_ENV"] === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 12,
            path: "/",
          });
          // Transmet également le nouveau token aux Server Components
          response.headers.set("X-Auth-Token", refreshed);
        }
      }

      return response;
    } catch {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      return response;
    }
  }

  // Redirige les utilisateurs authentifiés loin des pages d'auth
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && token) {
    try {
      await jwtVerify(token, getJwtSecretKey());
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch {
      // Token invalide, accès autoris à la page d'auth
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
