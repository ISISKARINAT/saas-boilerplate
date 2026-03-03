/**
 * Utilitaire centralisé d'envoi d'e-mails via Resend.
 * Toutes les intégrations email du projet doivent passer par ce module.
 */
import { Resend } from "resend";
import { render } from "@react-email/components";
import WelcomeEmail, { type WelcomeEmailProps } from "@/emails/templates/WelcomeEmail";
import ResetPasswordEmail, { type ResetPasswordEmailProps } from "@/emails/templates/ResetPasswordEmail";
import InvoiceEmail, { type InvoiceEmailProps } from "@/emails/templates/InvoiceEmail";

/** Données associées au template "welcome" */
export type { WelcomeEmailProps as WelcomeEmailData };
/** Données associées au template "reset-password" */
export type { ResetPasswordEmailProps as ResetPasswordEmailData };
/** Données associées au template "invoice" */
export type { InvoiceEmailProps as InvoiceEmailData };

/** Résultat d'un envoi d'email */
export interface SendEmailResult {
  success: boolean;
  /** Identifiant du message retourné par Resend */
  messageId?: string;
}

type TemplateMap = {
  welcome: WelcomeEmailProps;
  "reset-password": ResetPasswordEmailProps;
  invoice: InvoiceEmailProps;
};

const SUBJECTS: Record<keyof TemplateMap, string> = {
  welcome: "Welcome to Boilerplate 🎉",
  "reset-password": "Reset your password",
  invoice: "Your invoice is ready",
};

/**
 * Envoie un e-mail typé via Resend en rendant un template React Email.
 * Lit RESEND_API_KEY et EMAIL_FROM depuis les variables d'environnement.
 *
 * @param to - Adresse e-mail du destinataire
 * @param template - Identifiant du template à utiliser
 * @param data - Données passées au template (typées selon le template choisi)
 * @returns Résultat de l'envoi avec messageId si succès
 */
export async function sendEmail<T extends keyof TemplateMap>(
  to: string,
  template: T,
  data: TemplateMap[T]
): Promise<SendEmailResult> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY manquant — email non envoyé", { to, template });
    return { success: false };
  }

  const from = process.env["EMAIL_FROM"] ?? "noreply@example.com";
  const resend = new Resend(apiKey);

  let html: string;
  switch (template) {
    case "welcome":
      html = await render(WelcomeEmail(data as WelcomeEmailProps));
      break;
    case "reset-password":
      html = await render(ResetPasswordEmail(data as ResetPasswordEmailProps));
      break;
    case "invoice":
      html = await render(InvoiceEmail(data as InvoiceEmailProps));
      break;
    default:
      console.error("[email] Template inconnu", { template });
      return { success: false };
  }

  const { data: result, error } = await resend.emails.send({
    from,
    to,
    subject: SUBJECTS[template],
    html,
  });

  if (error) {
    console.error("[email] Échec de l'envoi via Resend", {
      template,
      to,
      error: error.message,
    });
    return { success: false };
  }

  return { success: true, messageId: result?.id };
}
