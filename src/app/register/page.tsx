"use client";

/**
 * Page d'inscription — formulaire email, mot de passe et confirmation.
 * Utilise un Server Action pour l'inscription et redirige vers /dashboard.
 */
import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { registerAction, type AuthActionState } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    registerAction,
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>Rejoignez-nous dès aujourd&apos;hui</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {state?.error && (
            <div
              role="alert"
              className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
            >
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Adresse e-mail
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="vous@exemple.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Minimum 8 caractères"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmer le mot de passe
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Répétez votre mot de passe"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Inscription…" : "Créer mon compte"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          Déjà un compte ?&nbsp;
          <Link href="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
