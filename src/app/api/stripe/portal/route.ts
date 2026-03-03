/**
 * POST /api/stripe/portal — Creates a Stripe Customer Portal session.
 * Body: { customerId: string }
 * Redirects the user to the Stripe Customer Portal.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";

const portalBodySchema = z.object({
  customerId: z.string().min(1, "customerId is required"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = portalBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
        { status: 400 }
      );
    }

    const { customerId } = parsed.data;
    const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard`,
    });

    return NextResponse.redirect(portalSession.url, { status: 303 });
  } catch (err) {
    console.error("[stripe/portal] Error creating portal session", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
