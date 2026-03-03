/**
 * POST /api/stripe/webhook — Récepteur des événements Stripe.
 *
 * SÉCURITÉ — Vérification de signature :
 *   Stripe signe chaque webhook avec STRIPE_WEBHOOK_SECRET (whsec_...).
 *   On doit lire le corps brut (raw body) AVANT tout parsing JSON,
 *   puis appeler stripe.webhooks.constructEvent() qui recompute la signature
 *   HMAC-SHA256 et la compare à l'en-tête "stripe-signature".
 *   Toute modification du corps (même un espace) invalide la signature.
 *   => Ne jamais parser le body avec request.json() avant constructEvent.
 *
 * Événements gérés :
 *   - checkout.session.completed       : abonnement activé après paiement
 *   - customer.subscription.updated    : changement de plan ou de statut
 *   - customer.subscription.deleted    : résiliation de l'abonnement
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { client } from "@/lib/db";
import { sendEmail } from "@/lib/email";

/**
 * Désactive le body parsing automatique de Next.js pour conserver le raw body.
 * Requis pour la vérification de signature Stripe.
 */
export const config = {
  api: { bodyParser: false },
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Récupération du corps brut (nécessaire pour la vérification de signature)
  const rawBody = await request.text();

  // En-tête de signature envoyé par Stripe avec chaque webhook
  const signature = request.headers.get("stripe-signature");

  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET manquant");
    return NextResponse.json(
      { error: "Configuration serveur invalide" },
      { status: 500 }
    );
  }

  if (!signature) {
    // Absence de signature = requête non émise par Stripe
    console.warn("[stripe/webhook] En-tête stripe-signature manquant");
    return NextResponse.json(
      { error: "Signature manquante" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    /**
     * constructEvent vérifie :
     *  1. La signature HMAC-SHA256 du payload avec STRIPE_WEBHOOK_SECRET
     *  2. La tolérance temporelle (défaut : ±300 secondes) pour éviter les replays
     * Lance une erreur si la signature est invalide ou expirée.
     */
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    // Ne pas exposer le détail de l'erreur dans la réponse (info sensible)
    console.error("[stripe/webhook] Échec de la vérification de signature", {
      message: err instanceof Error ? err.message : "Erreur inconnue",
    });
    return NextResponse.json(
      { error: "Signature invalide" },
      { status: 400 }
    );
  }

  // Traitement des événements selon leur type
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
        // Événements non gérés — ignorés silencieusement (Stripe attend 200)
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook] Erreur lors du traitement de l'événement", {
      type: event.type,
      message: err instanceof Error ? err.message : "Erreur inconnue",
    });
    // On retourne 500 pour que Stripe retente l'événement
    return NextResponse.json(
      { error: "Erreur lors du traitement" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

/**
 * Gère l'événement checkout.session.completed.
 * Crée ou met à jour l'enregistrement subscription avec le Customer ID Stripe.
 * Envoie un email de facture au client après le paiement.
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.client_reference_id;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!userId || !customerId) {
    console.error("[stripe/webhook] checkout.session.completed : données manquantes", {
      userId,
      customerId,
    });
    return;
  }

  // Upsert : crée ou met à jour la ligne subscription pour cet utilisateur
  await client.execute({
    sql: `
      INSERT INTO subscriptions (user_id, stripe_customer_id, subscription_id, status, plan)
      VALUES (?, ?, ?, 'active', 'pro')
      ON CONFLICT(user_id) DO UPDATE SET
        stripe_customer_id = excluded.stripe_customer_id,
        subscription_id    = excluded.subscription_id,
        status             = 'active',
        plan               = 'pro'
    `,
    args: [userId, customerId, subscriptionId ?? null],
  });

  console.info("[stripe/webhook] Abonnement activé", { userId });

  // Récupération de l'email utilisateur pour l'envoi de la facture
  const userResult = await client.execute({
    sql: "SELECT email FROM users WHERE id = ? LIMIT 1",
    args: [userId],
  });

  const userEmail = String(userResult.rows[0]?.["email"] ?? "");
  if (!userEmail) {
    console.warn("[stripe/webhook] Email utilisateur introuvable pour InvoiceEmail", { userId });
    return;
  }

  // Montant en unité monétaire (Stripe retourne les centimes)
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
    console.error("[stripe/webhook] Échec envoi InvoiceEmail", {
      userId,
      error: err instanceof Error ? err.message : "Erreur inconnue",
    });
  });
}

/**
 * Gère l'événement customer.subscription.updated.
 * Met à jour le statut et la date de fin de période dans la table subscriptions.
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  // Dans l'API Stripe 2026-02-25.clover, current_period_end est remplacé par
  // billing_cycle_anchor (point d'ancrage du cycle de facturation).
  const currentPeriodEnd = new Date(
    subscription.billing_cycle_anchor * 1000
  ).toISOString();

  await client.execute({
    sql: `
      UPDATE subscriptions
      SET subscription_id      = ?,
          status               = ?,
          current_period_end   = ?
      WHERE stripe_customer_id = ?
    `,
    args: [subscription.id, subscription.status, currentPeriodEnd, customerId],
  });

  console.info("[stripe/webhook] Abonnement mis à jour", {
    subscriptionId: subscription.id,
    status: subscription.status,
  });
}

/**
 * Gère l'événement customer.subscription.deleted.
 * Passe le statut à "cancelled" et supprime la date de fin de période.
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
      SET status             = 'cancelled',
          current_period_end = NULL
      WHERE stripe_customer_id = ?
    `,
    args: [customerId],
  });

  console.info("[stripe/webhook] Abonnement résilié", {
    subscriptionId: subscription.id,
  });
}
