"use client";

/**
 * Page réinitialisation du mot de passe — saisie du nouveau mot de passe.
 * Récupère le token depuis l'URL et utilise un Server Action pour la mise à jour.
 */
import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { resetPasswordAction, type AuthActionState } from "@/app/actions/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    resetPasswordAction,
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
          <CardDescription>Choisissez un mot de passe sécurisé</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!token && (
            <div
              role="alert"
              className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
            >
              Lien de réinitialisation manquant ou invalide.
            </div>
          )}

          {state?.error && (
            <div
              role="alert"
              className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
            >
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Nouveau mot de passe
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

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !token}
            >
              {isPending ? "Réinitialisation…" : "Réinitialiser"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Retour à la connexion
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background" />
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
