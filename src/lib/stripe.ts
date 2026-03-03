/**
 * Stripe utility — client initialization, plan definitions, and helpers.
 * Required env vars : STRIPE_SECRET_KEY
 * Optional env vars : STRIPE_PRO_PRICE_ID, STRIPE_ENTERPRISE_PRICE_ID
 */
import Stripe from "stripe";
import { client } from "@/lib/db";

// Validate at startup
const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
if (!stripeSecretKey) {
  throw new Error("Missing environment variable: STRIPE_SECRET_KEY");
}

/**
 * Shared Stripe instance.
 * API version is pinned to prevent silent breaking changes.
 */
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-02-25.clover",
});

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------

export type PlanId = "free" | "pro" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly price in USD cents (0 for free) */
  priceUsd: number;
  /** Stripe Price ID — read from env vars so it differs across environments */
  priceId: string | null;
  description: string;
}

/**
 * Canonical plan catalog.
 * Free: $0 | Pro: $29/mo | Enterprise: $99/mo
 */
export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceUsd: 0,
    priceId: null,
    description: "Get started at no cost",
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceUsd: 2900, // $29.00 / month
    priceId: process.env["STRIPE_PRO_PRICE_ID"] ?? null,
    description: "For professionals — $29 / month",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceUsd: 9900, // $99.00 / month
    priceId: process.env["STRIPE_ENTERPRISE_PRICE_ID"] ?? null,
    description: "For teams — $99 / month",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the internal PlanId that matches a Stripe Price ID.
 * Falls back to "free" when no plan is configured for the given price.
 */
export function getPlanByPriceId(priceId: string): PlanId {
  for (const plan of Object.values(PLANS)) {
    if (plan.priceId === priceId) return plan.id;
  }
  return "free";
}

/**
 * Retrieves the Stripe Customer ID for a user from the subscriptions table.
 * @param userId - Internal user identifier
 * @returns stripe_customer_id or null when absent
 */
export async function getStripeCustomerId(
  userId: string
): Promise<string | null> {
  const result = await client.execute({
    sql: "SELECT stripe_customer_id FROM subscriptions WHERE user_id = ? LIMIT 1",
    args: [userId],
  });

  const row = result.rows[0];
  if (!row || row["stripe_customer_id"] === null) return null;

  return String(row["stripe_customer_id"]);
}

/**
 * Creates a Stripe Checkout Session for a subscription or one-time payment.
 * Reuses an existing Stripe customer when available; otherwise creates one.
 *
 * @param userId             - Internal user ID stored as client_reference_id
 * @param userEmail          - Used to create a new Stripe customer when needed
 * @param priceId            - Stripe Price ID to purchase
 * @param existingCustomerId - Existing stripe_customer_id (skips customer creation)
 * @param successUrl         - Redirect URL after successful payment
 * @param cancelUrl          - Redirect URL when the user cancels
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  priceId,
  existingCustomerId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  priceId: string;
  existingCustomerId?: string | null;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  // Reuse or create a Stripe customer to link subscriptions to one account
  let customerId = existingCustomerId ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: userEmail });
    customerId = customer.id;
  }

  // Auto-detect billing mode from price type
  const price = await stripe.prices.retrieve(priceId);
  const mode: Stripe.Checkout.SessionCreateParams.Mode = price.recurring
    ? "subscription"
    : "payment";

  // Derive the plan name from the priceId for webhook metadata
  const plan = getPlanByPriceId(priceId);

  return stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId,
    mode,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      user_id: userId,
      plan,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}
