/**
 * POST /api/stripe/webhook -- Stripe webhook event receiver.
 *
 * SECURITY -- Signature verification:
 *   Stripe signs each webhook with STRIPE_WEBHOOK_SECRET (whsec_...).
 *   We must read the raw body BEFORE any JSON parsing, then call
 *   stripe.webhooks.constructEvent() which recomputes the HMAC-SHA256 signature
 *   and compares it to the "stripe-signature" header.
 *   Any body modification (even a space) invalidates the signature.
 *   => Never parse the body with request.json() before constructEvent.
 *
 * Handled events:
 *   - checkout.session.completed    : subscription activated or one-time payment
 *   - customer.subscription.updated : plan or status changed
 *   - customer.subscription.deleted : subscription cancelled
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { stripe, getPlanByPriceId, type PlanId } from "@/lib/stripe";
import { client, type SubscriptionStatus } from "@/lib/db";
import { sendEmail } from "@/lib/email";

/**
 * Disable Next.js automatic body parsing to preserve the raw body.
 * Required for Stripe signature verification.
 */
export const config = {
  api: { bodyParser: false },
};

// ---------------------------------------------------------------------------
// Drizzle client + inline schema matching the subscriptions table
// (schema: id, user_id, stripe_customer_id, plan, status)
// ---------------------------------------------------------------------------

const subscriptionsTable = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  plan: text("plan", { enum: ["free", "pro", "enterprise"] })
    .notNull()
    .$type<PlanId>(),
  status: text("status", { enum: ["active", "inactive", "cancelled"] })
    .notNull()
    .$type<SubscriptionStatus>(),
});

/** Drizzle client wrapping the shared libSQL connection. */
const db = drizzle(client);

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
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
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    /**
     * constructEvent verifies:
     *  1. HMAC-SHA256 signature of the payload using STRIPE_WEBHOOK_SECRET
     *  2. Timestamp tolerance (default +-300s) to prevent replay attacks
     * Throws if the signature is invalid or expired.
     */
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "customer.subscription.updated": {        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        // Unhandled events -- silently ignored (Stripe expects 200)
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Maps a Stripe subscription status to our internal SubscriptionStatus. */
function mapStatus(
  stripeStatus: Stripe.Subscription.Status
): SubscriptionStatus {
  if (stripeStatus === "active" || stripeStatus === "trialing") return "active";
  if (stripeStatus === "canceled") return "cancelled";
  return "inactive";
}

/**
 * Resolves a PlanId from a Stripe Price ID.
 * Falls back to `fallback` (default "pro") when the price maps to "free",
 * since a paid checkout can never result in a free plan.
 */
function resolvePlan(priceId: string, fallback: PlanId = "pro"): PlanId {
  const plan = getPlanByPriceId(priceId);
  return plan === "free" ? fallback : plan;
}

/**
 * Atomically upserts a subscription row for the given user using
 * db.transaction. Uses db.update for existing rows and db.insert for new ones.
 */
async function upsertSubscription(
  userId: string,
  customerId: string,
  plan: PlanId,
  status: SubscriptionStatus
): Promise<void> {
  await db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: subscriptionsTable.id })
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await tx
        .update(subscriptionsTable)
        .set({ stripeCustomerId: customerId, plan, status })
        .where(eq(subscriptionsTable.userId, userId));
    } else {
      await tx.insert(subscriptionsTable).values({
        id: crypto.randomUUID(),
        userId,
        stripeCustomerId: customerId,
        plan,
        status,
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

/**
 * Handles checkout.session.completed.
 *
 * Retrieves user_id from session.metadata.user_id (primary) or
 * client_reference_id (fallback). Extracts stripe_customer_id from
 * session.customer. Determines the plan from the purchased Price ID and
 * upserts the subscriptions row atomically.
 * Sends an invoice email for subscription purchases.
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  // Prefer metadata.user_id; fall back to client_reference_id
  const userId: string | null =
    session.metadata?.["user_id"] ?? session.client_reference_id ?? null;

  const customerId: string | null =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer?.id ?? null);

  if (!userId || !customerId) {
    console.error(
      "[stripe/webhook] checkout.session.completed: missing userId or customerId",
      { userId, customerId }
    );
    return;
  }

  let plan: PlanId = "pro";

  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id ?? "";
    plan = resolvePlan(priceId);
  } else if (session.mode === "payment") {
    const sessionWithItems = await stripe.checkout.sessions.retrieve(
      session.id,
      { expand: ["line_items"] }
    );
    const priceId = sessionWithItems.line_items?.data[0]?.price?.id ?? "";
    plan = resolvePlan(priceId);
  }

  await upsertSubscription(userId, customerId, plan, "active");

  console.info("[stripe/webhook] Subscription activated", { userId, plan });

  if (session.mode !== "subscription") return;

  // Send invoice email -- fetch user email from the users table
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
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan -- Monthly`,
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
 * Handles customer.subscription.updated.
 * Updates the plan (derived from the price ID) and status in the subscriptions
 * table, matched by stripe_customer_id.
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const priceId = subscription.items.data[0]?.price.id ?? "";
  const plan: PlanId = getPlanByPriceId(priceId);
  const status: SubscriptionStatus = mapStatus(subscription.status);

  await db
    .update(subscriptionsTable)
    .set({ plan, status })
    .where(eq(subscriptionsTable.stripeCustomerId, customerId));

  console.info("[stripe/webhook] Subscription updated", {
    subscriptionId: subscription.id,
    plan,
    status,
  });
}

/**
 * Handles customer.subscription.deleted.
 * Sets plan to "free" and status to "cancelled" in the subscriptions table,
 * matched by stripe_customer_id.
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  await db
    .update(subscriptionsTable)
    .set({ plan: "free", status: "cancelled" })
    .where(eq(subscriptionsTable.stripeCustomerId, customerId));

  console.info("[stripe/webhook] Subscription cancelled", {
    subscriptionId: subscription.id,
    customerId,
  });
}

/**
 * Handles invoice.paid.
 *
 * Keeps subscription status "active" on renewals (subscription_cycle) and
 * sends an invoice confirmation email for recurring billing cycles.
 * Initial subscription invoices are already handled via checkout.session.completed.
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : (invoice.customer as Stripe.Customer | null)?.id ?? null;

  if (!customerId) {
    console.warn("[stripe/webhook] invoice.paid: missing customerId");
    return;
  }

  // Re-activate subscription in case it was past_due before payment
  await db
    .update(subscriptionsTable)
    .set({ status: "active" })
    .where(eq(subscriptionsTable.stripeCustomerId, customerId));

  console.info("[stripe/webhook] Invoice paid — subscription reactivated", {
    invoiceId: invoice.id,
    customerId,
    billingReason: invoice.billing_reason,
  });

  // Only send invoice emails for recurring renewals to avoid duplicates with
  // the checkout.session.completed handler (which covers subscription_create).
  if (invoice.billing_reason !== "subscription_cycle") return;

  // Resolve userId + plan from the subscriptions table
  const subRows = await db
    .select({ userId: subscriptionsTable.userId, plan: subscriptionsTable.plan })
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.stripeCustomerId, customerId))
    .limit(1);

  const userId = subRows[0]?.userId;
  const plan = subRows[0]?.plan ?? "pro";

  if (!userId) {
    console.warn("[stripe/webhook] invoice.paid: userId not found for customer", { customerId });
    return;
  }

  const userResult = await client.execute({
    sql: "SELECT email FROM users WHERE id = ? LIMIT 1",
    args: [userId],
  });

  const userEmail = String(userResult.rows[0]?.["email"] ?? "");
  if (!userEmail) {
    console.warn("[stripe/webhook] invoice.paid: email not found for user", { userId });
    return;
  }

  const total = (invoice.amount_paid ?? 0) / 100;
  const currency = (invoice.currency ?? "usd").toUpperCase();
  const invoiceDate = new Date().toISOString().slice(0, 10);
  const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
  const invoiceNumber =
    invoice.number ?? `INV-${invoice.id.slice(-8).toUpperCase()}`;

  sendEmail(userEmail, "invoice", {
    userName: userEmail,
    invoiceNumber,
    invoiceDate,
    dueDate: invoiceDate,
    items: [
      {
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan — Renewal`,
        quantity: 1,
        unitPrice: total,
      },
    ],
    total,
    currency,
    downloadUrl: `${appUrl}/billing`,
  }).catch((err: unknown) => {
    console.error("[stripe/webhook] Failed to send invoice email for invoice.paid", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
  });
}
