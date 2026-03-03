/**
 * POST /api/stripe/billing — Crée une session Stripe Billing Portal.
 * Permet à l'utilisateur de gérer son abonnement (annulation, mise à jour CB…)
 * Retourne : { url: string } — URL de redirection vers le portail de facturation
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { stripe, getStripeCustomerId } from "@/lib/stripe";

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

    // Récupération du Stripe Customer ID depuis la table subscriptions
    const customerId = await getStripeCustomerId(session.userId);
    if (!customerId) {
      return NextResponse.json(
        { error: "Aucun abonnement Stripe trouvé pour cet utilisateur" },
        { status: 404 }
      );
    }

    const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

    // Création de la session Billing Portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url }, { status: 200 });
  } catch (err) {
    console.error("[stripe/billing] Erreur lors de la création du portail", {
      message: err instanceof Error ? err.message : "Erreur inconnue",
    });
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
