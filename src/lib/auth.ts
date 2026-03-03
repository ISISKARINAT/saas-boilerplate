import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { db, type User, type Session } from "@/lib/db";
import { sendEmail } from "@/lib/email";

// Nombre de rounds bcrypt (12 = bon équilibre sécurité/performance en 2024)
const BCRYPT_ROUNDS = 12;

// Durée de validité d'un JWT (12 heures)
const TOKEN_EXPIRY = "12h";

/**
 * Récupère la clé secrète JWT encodée depuis les variables d'environnement.
 * Lance une erreur si JWT_SECRET est absent.
 */
function getJwtSecretKey(): Uint8Array {
  const secret = process.env["JWT_SECRET"];
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET manquant ou trop court (minimum 32 caractères requis)"
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Hache un mot de passe en clair avec bcrypt.
 * @param password - Mot de passe en clair
 * @returns Hash bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Vérifie qu'un mot de passe correspond à un hash bcrypt.
 * @param password - Mot de passe en clair
 * @param hash - Hash bcrypt stocké en base
 * @returns true si le mot de passe correspond
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Crée un token JWT signé pour un utilisateur.
 * @param userId - Identifiant de l'utilisateur
 * @returns Token JWT signé (valide 12h)
 */
export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setSubject(userId)
    .sign(getJwtSecretKey());
}

/**
 * Vérifie et décode un token JWT.
 * @param token - Token JWT à vérifier
 * @returns Payload { userId } ou null si invalide/expiré
 */
export async function verifyToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    if (typeof payload["userId"] !== "string") return null;
    return { userId: payload["userId"] };
  } catch {
    // Token expiré, signature invalide ou malformé
    return null;
  }
}

/** Alias of verifyToken for middleware use. */
export const verifyAuthToken = verifyToken;

/**
 * Envoie un e-mail de réinitialisation de mot de passe à l'utilisateur.
 * L'e-mail contient un lien avec un token JWT valide 1 heure.
 *
 * @param email - Adresse e-mail du destinataire
 * @param resetToken - Token JWT de réinitialisation (signé, expiration 1h)
 */
export async function sendResetPasswordEmail(
  email: string,
  resetToken: string
): Promise<void> {
  const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  await sendEmail(email, "reset-password", {
    userName: email.split("@")[0] ?? email,
    resetUrl,
  });
}

// ---------------------------------------------------------------------------
// Session management (persisted in the `sessions` table)
// ---------------------------------------------------------------------------

/**
 * Crée une entrée en base pour une session utilisateur.
 * @param userId - Identifiant de l'utilisateur
 * @param token  - Token JWT émis pour cette session
 * @param expiresAt - Date d'expiration
 * @returns La session créée
 */
export async function createSession(
  userId: string,
  token: string,
  expiresAt: Date
): Promise<Session> {
  const id = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
    args: [id, userId, token, expiresAt.toISOString()],
  });
  return { id, userId, token, expiresAt: expiresAt.toISOString() };
}

/**
 * Supprime une session en base (déconnexion).
 * @param token - Token JWT de la session à supprimer
 */
export async function deleteSession(token: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM sessions WHERE token = ?",
    args: [token],
  });
}

/**
 * Récupère l'utilisateur associé à un token de session valide (non expiré).
 * @param token - Token JWT de la session
 * @returns L'utilisateur correspondant, ou null si session absente/expirée
 */
export async function getUserFromSession(
  token: string
): Promise<User | null> {
  try {
    const result = await db.execute({
      sql: `SELECT u.id, u.email, u.password_hash, u.name, u.created_at
            FROM users u
            INNER JOIN sessions s ON s.user_id = u.id
            WHERE s.token = ?
              AND s.expires_at > datetime('now')`,
      args: [token],
    });

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row["id"] as string,
      email: row["email"] as string,
      passwordHash: row["password_hash"] as string,
      name: row["name"] as string,
      createdAt: row["created_at"] as string,
    };
  } catch {
    return null;
  }
}
