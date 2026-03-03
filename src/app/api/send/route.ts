/**
 * POST /api/send — Envoi d'emails via Resend.
 * Protégé par middleware (X-User-Id requis).
 * Body: { to: string, template: "welcome" | "reset-password" | "invoice", data: object }
 */
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { render } from "@react-email/components";
import WelcomeEmail from "@/components/emails/welcome";
import ResetPasswordEmail from "@/components/emails/reset-password";
import InvoiceEmail from "@/components/emails/invoice";

const welcomeDataSchema = z.object({
  userName: z.string().min(1),
  ctaUrl: z.string().url(),
});

const resetPasswordDataSchema = z.object({
  userName: z.string().min(1),
  resetUrl: z.string().url(),
});

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

const invoiceDataSchema = z.object({
  userName: z.string().min(1),
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string().min(1),
  dueDate: z.string().min(1),
  items: z.array(invoiceItemSchema).min(1),
  total: z.number().positive(),
  currency: z.string().length(3),
  downloadUrl: z.string().url(),
});

const sendEmailSchema = z.discriminatedUnion("template", [
  z.object({
    to: z.string().email("Adresse e-mail destinataire invalide"),
    template: z.literal("welcome"),
    data: welcomeDataSchema,
  }),
  z.object({
    to: z.string().email("Adresse e-mail destinataire invalide"),
    template: z.literal("reset-password"),
    data: resetPasswordDataSchema,
  }),
  z.object({
    to: z.string().email("Adresse e-mail destinataire invalide"),
    template: z.literal("invoice"),
    data: invoiceDataSchema,
  }),
]);

type SendEmailPayload = z.infer<typeof sendEmailSchema>;

const SUBJECTS: Record<SendEmailPayload["template"], string> = {
  welcome: "Welcome to Boilerplate 🎉",
  "reset-password": "Reset your password",
  invoice: "Your invoice is ready",
};

async function renderEmail(payload: SendEmailPayload): Promise<string> {
  switch (payload.template) {
    case "welcome":
      return render(WelcomeEmail(payload.data));
    case "reset-password":
      return render(ResetPasswordEmail(payload.data));
    case "invoice":
      return render(InvoiceEmail(payload.data));
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get("X-User-Id");
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    return NextResponse.json(
      { error: "Configuration serveur manquante" },
      { status: 500 }
    );
  }

  try {
    const body: unknown = await request.json();
    const parsed = sendEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: parsed.error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const html = await renderEmail(payload);

    const resend = new Resend(apiKey);
    const from = process.env["EMAIL_FROM"] ?? "noreply@example.com";

    const { data, error } = await resend.emails.send({
      from,
      to: payload.to,
      subject: SUBJECTS[payload.template],
      html,
    });

    if (error) {
      return NextResponse.json(
        { error: "Échec de l'envoi de l'email", details: error.message },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Erreur interne du serveur", details: message },
      { status: 500 }
    );
  }
}
