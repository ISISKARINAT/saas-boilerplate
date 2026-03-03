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
 *   - checkout.session.completed    : subscription activated or one-time payment
 *   - customer.subscription.deleted : subscription cancelled
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, getPlanByPriceId } from "@/lib/stripe";
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
 * Upserts a subscription row for the given user.
 * Because user_id has no UNIQUE constraint we do an explicit check-then-write.
 */
async function upsertSubscription(
  userId: string,
  customerId: string,
  plan: string,
  status: "active" | "inactive" | "cancelled"
): Promise<void> {
  const existing = await client.execute({
    sql: "SELECT id FROM subscriptions WHERE user_id = ? LIMIT 1",
    args: [userId],
  });

  if (existing.rows.length > 0) {
    await client.execute({
      sql: `UPDATE subscriptions
            SET stripe_customer_id = ?,
                plan               = ?,
                status             = ?
            WHERE user_id = ?`,
      args: [customerId, plan, status, userId],
    });
  } else {
    await client.execute({
      sql: `INSERT INTO subscriptions (id, user_id, stripe_customer_id, plan, status)
            VALUES (?, ?, ?, ?, ?)`,
      args: [crypto.randomUUID(), userId, customerId, plan, status],
    });
  }
}

/**
 * Handles checkout.session.completed.
 * Creates or updates the subscription record and sends an invoice email.
 *
 * Reads client_reference_id (set to the internal user ID at checkout creation)
 * and the Stripe Customer ID to persist the subscription in the database.
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

  // Determine which plan was purchased from the Stripe Price ID
  let plan = "pro"; // default for paid sessions
  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id ?? "";
    plan = getPlanByPriceId(priceId);
    if (plan === "free") plan = "pro"; // paid checkout → at least pro
  } else if (session.mode === "payment") {
    const sessionWithItems = await stripe.checkout.sessions.retrieve(
      session.id,
      { expand: ["line_items"] }
    );
    const priceId = sessionWithItems.line_items?.data[0]?.price?.id ?? "";
    plan = getPlanByPriceId(priceId);
    if (plan === "free") plan = "pro";
  }

  // Update subscriptions table
  await upsertSubscription(userId, customerId, plan, "active");

  console.info("[stripe/webhook] Subscription activated", { userId, plan });

  if (session.mode !== "subscription") return;

  // Send invoice email — fetch user email from the users table
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
    items: [
      {
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan — Monthly`,
        quantity: 1,
        unitPrice: total,
      },
    ],
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
 * Handles customer.subscription.deleted.
 * Sets plan back to "free" and status to "cancelled" in the subscriptions table.
 * Matches the row by stripe_customer_id since we don't store stripe_subscription_id.
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  await client.execute({
    sql: `UPDATE subscriptions
          SET plan   = 'free',
              status = 'cancelled'
          WHERE stripe_customer_id = ?`,
    args: [customerId],
  });

  console.info("[stripe/webhook] Subscription cancelled", {
    subscriptionId: subscription.id,
    customerId,
  });
}


