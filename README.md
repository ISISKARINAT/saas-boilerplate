# SaaS Boilerplate — Next.js 15

Boilerplate production-ready pour applications SaaS, avec authentification JWT, base de données Turso et UI Shadcn/UI.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript strict |
| Base de données | Turso (libSQL) |
| Authentification | JWT (jose) + bcryptjs |
| UI | Tailwind CSS v4 + Shadcn/UI |
| Validation | Zod |
| Runtime | Node.js 20+ |

## Structure du projet

```
src/
 app/
   ├── api/auth/          # Routes API : login, register, logout, refresh,
   │                      #   forgot-password, reset-password
   ├── dashboard/         # Pages protégées du tableau de bord
   ├── login/             # Page de connexion
   ├── register/          # Page d'inscription
   ├── forgot-password/   # Demande de réinitialisation
   ├── reset-password/    # Réinitialisation du mot de passe
   ├── layout.tsx         # Layout racine
   ├── page.tsx           # Redirection / → /dashboard ou /login
   └── not-found.tsx      # Page 404
 components/
   ├── ui/                # Composants Shadcn/UI
   ├── Sidebar.tsx        # Barre de navigation
   ├── Header.tsx         # En-tête avec avatar
   └── Breadcrumbs.tsx    # Fil d'Ariane dynamique
 lib/
   ├── auth.ts            # hashPassword, verifyPassword, createToken, verifyToken
   ├── db.ts              # Client Turso (singleton)
   ├── schema.sql         # Schéma de la base de données
   └── utils.ts           # Utilitaire cn() (Shadcn)
 middleware.ts           # Protection des routes /dashboard/* et /api/protected/*
```

## Installation

### 1. Cloner et installer les dépendances

```bash
git clone <repo-url>
cd boilerplate
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

diter `.env.local` avec vos valeurs :

```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
JWT_SECRET=your-32-char-minimum-secret-key
```

### 3. Initialiser la base de données Turso

```bash
# Installer le CLI Turso
curl -sSfL https://get.tur.so/install.sh | bash

# Créer une base de données
turso db create my-saas-db

# Appliquer le schéma
turso db shell my-saas-db < src/lib/schema.sql

# Récupérer l'URL et le token
turso db show my-saas-db --url
turso db tokens create my-saas-db
```

## Lancer en développement

```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

## Commandes disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linter ESLint
npm run type-check   # Vérification TypeScript
```

## Déploiement

### Vercel (recommandé)

```bash
vercel deploy
```

Configurer les variables d'environnement dans le dashboard Vercel.

### Variables requises en production

- `TURSO_DATABASE_URL` — URL de connexion Turso
- `TURSO_AUTH_TOKEN` — Token d'authentification Turso
- `JWT_SECRET` — Clé secrète JWT (minimum 32 caractères)
- `NEXT_PUBLIC_APP_URL` — URL publique de l'application

## Fonctionnalités incluses

- **Authentification complète** : inscription, connexion, déconnexion, réinitialisation du mot de passe
- **JWT sécurisé** : cookies HttpOnly, SameSite strict, expiration 12h
- **Middleware Next.js** : protection automatique des routes dashboard
- **Design System** : mode sombre par défaut, tokens CSS, composants Shadcn
- **TypeScript strict** : `noImplicitAny`, `exactOptionalPropertyTypes`
- **Validation Zod** : toutes les entrées API validées

## Licence

MIT
