/**
 * POST /api/stripe/checkout — Creates a Stripe Checkout Session.
 *
 * Body (JSON): { planId: "pro" | "enterprise" } OR { priceId: string }
 * Requires authentication via the "token" cookie (JWT).
 *
 * On success returns: { url: string } — the Stripe Checkout page URL.
 * Supports both one-time payments and subscriptions (auto-detected from price type).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  PLANS,
  getStripeCustomerId,
  createCheckoutSession,
  type PlanId,
} from "@/lib/stripe";

const checkoutBodySchema = z.union([
  z.object({ planId: z.enum(["pro", "enterprise"]) }),
  z.object({ priceId: z.string().min(1, "priceId is required") }),
]);

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Authentication ──────────────────────────────────────────────────────
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const session = await verifyToken(token);
  if (!session) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  const { userId } = session;

  // ── Body validation ──────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkoutBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
      { status: 400 }
    );
  }

  // Resolve priceId — from planId lookup or direct value
  let priceId: string;
  if ("planId" in parsed.data) {
    const plan = PLANS[parsed.data.planId as PlanId];
    if (!plan.priceId) {
      return NextResponse.json(
        { error: `No Stripe price configured for plan "${parsed.data.planId}"` },
        { status: 500 }
      );
    }
    priceId = plan.priceId;
  } else {
    priceId = parsed.data.priceId;
  }

  // ── Fetch user email ─────────────────────────────────────────────────────
  const userResult = await db.execute({
    sql: "SELECT email FROM users WHERE id = ? LIMIT 1",
    args: [userId],
  });
  const userEmail = String(userResult.rows[0]?.["email"] ?? "");
  if (!userEmail) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // ── Create Checkout Session ──────────────────────────────────────────────
  try {
    const existingCustomerId = await getStripeCustomerId(userId);
    const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

    const checkoutSession = await createCheckoutSession({
      userId,
      userEmail,
      priceId,
      existingCustomerId,
      successUrl: `${appUrl}/dashboard?checkout=success`,
      cancelUrl: `${appUrl}/dashboard?checkout=cancelled`,
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

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
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
