/**
 * Client Turso (libSQL) — connexion à la base de données.
 * Variables requises : TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
 */
import { createClient as createLibSQLClient } from "@libsql/client";

// Validation des variables d'environnement au démarrage
const rawUrl = process.env["TURSO_DATABASE_URL"];
const authToken = process.env["TURSO_AUTH_TOKEN"];

if (!rawUrl) {
  throw new Error("Variable d'environnement manquante : TURSO_DATABASE_URL");
}

// Après la vérification, on sait que rawUrl est une chaîne non-vide
const url: string = rawUrl;

/**
 * Crée et retourne un client libSQL connecté à Turso.
 * Utilise un token si présent (prod), sinon connexion non-authentifiée (dev local).
 */
export function createClient() {
  return createLibSQLClient({
    url,
    ...(authToken ? { authToken } : {}),
  });
}

// Instance partagée pour toute l'application (singleton)
export const db = createClient();
