"use client";

/**
 * Page mot de passe oublié — saisie de l'e-mail pour recevoir un lien de réinitialisation.
 * Utilise un Server Action qui envoie l'e-mail de manière sécurisée.
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
import { forgotPasswordAction, type ForgotPasswordState } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<ForgotPasswordState, FormData>(
    forgotPasswordAction,
    null
  );

  const isSuccess = state !== null && "success" in state;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
          <CardDescription>
            Saisissez votre e-mail pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isSuccess ? (
            <div
              role="status"
              className="rounded-md bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-600 dark:text-green-400 text-center"
            >
              Un e-mail vous a été envoyé si ce compte existe.
            </div>
          ) : (
            <>
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

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Envoi…" : "Envoyer le lien"}
                </Button>
              </form>
            </>
          )}
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
