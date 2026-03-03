/**
 * Utilitaire Stripe — initialisation du client et helpers.
 * Variables requises : STRIPE_SECRET_KEY
 */
import Stripe from "stripe";
import { db } from "@/lib/db";

// Validation au démarrage
const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
if (!stripeSecretKey) {
  throw new Error("Variable d'environnement manquante : STRIPE_SECRET_KEY");
}

/**
 * Instance Stripe partagée, initialisée avec la clé secrète.
 * L'API version est fixée pour éviter les breaking changes silencieux.
 */
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-02-25.clover",
});

/**
 * Récupère le Stripe Customer ID d'un utilisateur depuis la table subscriptions.
 * @param userId - Identifiant interne de l'utilisateur
 * @returns stripe_customer_id ou null si absent
 */
export async function getStripeCustomerId(
  userId: string
): Promise<string | null> {
  const result = await db.execute({
    sql: "SELECT stripe_customer_id FROM subscriptions WHERE user_id = ? LIMIT 1",
    args: [userId],
  });

  const row = result.rows[0];
  if (!row || row["stripe_customer_id"] === null) return null;

  return String(row["stripe_customer_id"]);
}
