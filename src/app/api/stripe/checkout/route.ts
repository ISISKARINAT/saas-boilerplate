/**
 * POST /api/stripe/checkout — Creates a Stripe Checkout Session.
 * Body: { priceId: string }
 * Redirects the user to the Stripe Checkout page.
 * Supports both one-time payments and subscriptions (auto-detected from price type).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";

const checkoutBodySchema = z.object({
  priceId: z.string().min(1, "priceId is required"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = checkoutBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
        { status: 400 }
      );
    }

    const { priceId } = parsed.data;

    // Auto-detect mode from price type
    const price = await stripe.prices.retrieve(priceId);
    const mode = price.recurring ? "subscription" : "payment";

    const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
    });

    if (!checkoutSession.url) {
      console.error("[stripe/checkout] Session URL missing", {
        sessionId: checkoutSession.id,
      });
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.redirect(checkoutSession.url, { status: 303 });
  } catch (err) {
    console.error("[stripe/checkout] Error creating session", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
