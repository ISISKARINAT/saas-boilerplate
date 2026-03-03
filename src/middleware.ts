/**
 * Middleware Next.js — protection des routes authentifiées.
 * Protège : /dashboard/*
 * Vérifie le JWT dans le cookie "token" via verifyAuthToken, redirige vers /login si invalide.
 * Redirige les utilisateurs authentifiés depuis /login et /register vers /dashboard.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

const PROTECTED_ROUTES: string[] = ["/dashboard"];
const AUTH_ROUTES: string[] = ["/login", "/register"];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((r) =>
    pathname.startsWith(r)
  );

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyAuthToken(token);

    if (!payload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      return response;
    }

    const response = NextResponse.next();
    response.headers.set("X-User-Id", payload.userId);
    return response;
  }

  // Redirige les utilisateurs authentifiés loin des pages d'auth
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && token) {
    const payload = await verifyAuthToken(token);
    if (payload) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
