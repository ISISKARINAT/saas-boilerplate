/**
 * Utilitaires d'authentification : hachage de mots de passe et tokens JWT.
 * Utilise bcryptjs pour le hachage et jose pour les JWT.
 */
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

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
