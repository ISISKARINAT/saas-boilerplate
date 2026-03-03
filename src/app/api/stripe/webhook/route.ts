/**
 * POST /api/stripe/webhook — Stripe webhook event receiver.
 *
 * SECURITY — Signature verification:
 *   Stripe signs each webhook with STRIPE_WEBHOOK_SECRET (whsec_...).
 *   We must read the raw body BEFORE any JSON parsing, then call
 *   stripe.webhooks.constructEvent() which recomputes the HMAC-SHA256 signature
 *   and compares it to the "stripe-signature" header.
 *   Any body modification (even a space) invalidates the signature.
 *   => Never parse the body with request.json() before constructEvent.
 *
 * Handled events:
 *   - checkout.session.completed       : subscription activated or one-time payment
 *   - customer.subscription.updated    : plan or status change
 *   - customer.subscription.deleted    : subscription cancelled
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { client } from "@/lib/db";
import { sendEmail } from "@/lib/email";

/**
 * Disable Next.js automatic body parsing to preserve the raw body.
 * Required for Stripe signature verification.
 */
export const config = {
  api: { bodyParser: false },
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Read raw body (required for signature verification)
  const rawBody = await request.text();

  // Signature header sent by Stripe with every webhook
  const signature = request.headers.get("stripe-signature");

  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Invalid server configuration" },
      { status: 500 }
    );
  }

  if (!signature) {
    console.warn("[stripe/webhook] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    /**
     * constructEvent verifies:
     *  1. HMAC-SHA256 signature of the payload using STRIPE_WEBHOOK_SECRET
     *  2. Timestamp tolerance (default ±300s) to prevent replay attacks
     * Throws if the signature is invalid or expired.
     */
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Route event to the appropriate handler
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        // Unhandled events — silently ignored (Stripe expects 200)
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook] Error processing event", {
      type: event.type,
      message: err instanceof Error ? err.message : String(err),
    });
    // Return 500 so Stripe retries the event
    return NextResponse.json(
      { error: "Event processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

/**
 * Maps a Stripe subscription status to our internal SubscriptionStatus enum.
 */
function mapStatus(
  stripeStatus: Stripe.Subscription.Status
): "active" | "inactive" | "cancelled" {
  if (stripeStatus === "active" || stripeStatus === "trialing") return "active";
  if (stripeStatus === "canceled") return "cancelled";
  return "inactive";
}

/**
 * Handles checkout.session.completed.
 * Creates or updates the subscription record in the database.
 * Sends an invoice email for subscription purchases.
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.client_reference_id;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (!userId || !customerId) {
    console.error(
      "[stripe/webhook] checkout.session.completed: missing userId or customerId",
      { userId, customerId }
    );
    return;
  }

  let stripeSubscriptionId: string;
  let stripePriceId: string;
  let currentPeriodEnd: number; // unix timestamp in seconds

  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    stripeSubscriptionId = subscription.id;
    stripePriceId = subscription.items.data[0]?.price.id ?? "";
    // billing_cycle_anchor replaces current_period_end in API 2026-02-25.clover
    currentPeriodEnd = subscription.billing_cycle_anchor;
  } else {
    // One-time payment — use session ID as unique subscription identifier
    stripeSubscriptionId = session.id;
    const sessionWithItems = await stripe.checkout.sessions.retrieve(
      session.id,
      { expand: ["line_items"] }
    );
    stripePriceId = sessionWithItems.line_items?.data[0]?.price?.id ?? "";
    currentPeriodEnd = Math.floor(Date.now() / 1000);
  }

  await client.execute({
    sql: `
      INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, status, current_period_end)
      VALUES (?, ?, ?, ?, ?, 'active', ?)
      ON CONFLICT(user_id) DO UPDATE SET
        stripe_customer_id     = excluded.stripe_customer_id,
        stripe_subscription_id = excluded.stripe_subscription_id,
        stripe_price_id        = excluded.stripe_price_id,
        status                 = 'active',
        current_period_end     = excluded.current_period_end,
        updated_at             = unixepoch()
    `,
    args: [
      crypto.randomUUID(),
      userId,
      customerId,
      stripeSubscriptionId,
      stripePriceId,
      currentPeriodEnd,
    ],
  });

  console.info("[stripe/webhook] Subscription activated", { userId });

  if (session.mode !== "subscription") return;

  // Send invoice email for subscription purchases
  const userResult = await client.execute({
    sql: "SELECT email FROM users WHERE id = ? LIMIT 1",
    args: [userId],
  });

  const userEmail = String(userResult.rows[0]?.["email"] ?? "");
  if (!userEmail) {
    console.warn("[stripe/webhook] User email not found for invoice", {
      userId,
    });
    return;
  }

  const total = (session.amount_total ?? 0) / 100;
  const currency = (session.currency ?? "usd").toUpperCase();
  const invoiceDate = new Date().toISOString().slice(0, 10);
  const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

  sendEmail(userEmail, "invoice", {
    userName: userEmail,
    invoiceNumber: `INV-${session.id.slice(-8).toUpperCase()}`,
    invoiceDate,
    dueDate: invoiceDate,
    items: [{ description: "Pro Plan — Monthly", quantity: 1, unitPrice: total }],
    total,
    currency,
    downloadUrl: `${appUrl}/billing`,
  }).catch((err: unknown) => {
    console.error("[stripe/webhook] Failed to send invoice email", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
  });
}

/**
 * Handles customer.subscription.updated.
 * Updates status and period end in the subscriptions table.
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const currentPeriodEnd = subscription.billing_cycle_anchor;
  const status = mapStatus(subscription.status);

  await client.execute({
    sql: `
      UPDATE subscriptions
      SET stripe_subscription_id = ?,
          stripe_price_id        = ?,
          status                 = ?,
          current_period_end     = ?,
          updated_at             = unixepoch()
      WHERE stripe_customer_id = ?
    `,
    args: [
      subscription.id,
      subscription.items.data[0]?.price.id ?? "",
      status,
      currentPeriodEnd,
      customerId,
    ],
  });

  console.info("[stripe/webhook] Subscription updated", {
    subscriptionId: subscription.id,
    status,
  });
}

/**
 * Handles customer.subscription.deleted.
 * Sets status to "cancelled" in the subscriptions table.
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  await client.execute({
    sql: `
      UPDATE subscriptions
      SET status     = 'cancelled',
          updated_at = unixepoch()
      WHERE stripe_customer_id = ?
    `,
    args: [customerId],
  });

  console.info("[stripe/webhook] Subscription cancelled", {
    subscriptionId: subscription.id,
  });
}
