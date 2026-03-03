/**
 * POST /api/stripe/checkout — Crée une session Stripe Checkout.
 * Corps attendu : { priceId: string, userId: string }
 * Retourne : { url: string } — URL de redirection vers Stripe Checkout
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

// Schéma de validation du corps de la requête
const checkoutBodySchema = z.object({
  priceId: z.string().min(1, "priceId requis"),
  userId: z.string().min(1, "userId requis"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validation de la session JWT via le cookie "token"
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    // Validation du corps de la requête
    const body: unknown = await request.json();
    const parsed = checkoutBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const { priceId, userId } = parsed.data;

    // Vérification que l'utilisateur JWT correspond à l'userId fourni
    if (session.userId !== userId) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

    // Création de la session Stripe Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
    });

    if (!checkoutSession.url) {
      console.error("[stripe/checkout] URL de session manquante", {
        sessionId: checkoutSession.id,
      });
      return NextResponse.json(
        { error: "Impossible de créer la session de paiement" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
  } catch (err) {
    console.error("[stripe/checkout] Erreur lors de la création de la session", {
      message: err instanceof Error ? err.message : "Erreur inconnue",
    });
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
