/**
 * Template d'email de bienvenue envoyé après l'inscription.
 * Inclut logo, message de bienvenue et CTA vers le tableau de bord.
 */
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export interface WelcomeEmailProps {
  /** Prénom ou nom d'utilisateur affiché dans le mail */
  userName: string;
  /** URL du bouton d'activation / tableau de bord */
  ctaUrl: string;
}

/**
 * Email de bienvenue responsive, compatible dark mode.
 * @param props - Données personnalisées de l'email
 */
export default function WelcomeEmail({
  userName = "there",
  ctaUrl = "https://app.example.com/dashboard",
}: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Tailwind>
        <Preview>Welcome to Boilerplate — get started now</Preview>
        <Body className="bg-[#0a0a0a] m-0 p-0" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <Container className="mx-auto py-8 px-4 max-w-[580px]">

            {/* Hero */}
            <Section className="bg-[#111111] rounded-xl px-8 py-10 text-center border border-[rgba(255,255,255,0.08)]">
              <Heading className="text-indigo-500 text-2xl font-bold m-0 mb-1 tracking-tight">
                Boilerplate
              </Heading>
              <div className="w-12 h-0.5 bg-indigo-500 mx-auto mb-6 opacity-60" />
              <Heading className="text-white text-[28px] font-bold leading-snug m-0 mb-3">
                Welcome, {userName}! 🎉
              </Heading>
              <Text className="text-zinc-400 text-base leading-relaxed m-0 mb-8 max-w-[420px] mx-auto">
                Your account is ready. Start building something great today —
                everything you need is waiting in your dashboard.
              </Text>
              <Button
                href={ctaUrl}
                className="bg-indigo-600 text-white text-base font-semibold rounded-lg px-8 py-3 no-underline inline-block"
              >
                Activate my account →
              </Button>
            </Section>

            <Hr className="border-[rgba(255,255,255,0.08)] my-6" />

            {/* Next steps */}
            <Section className="px-2">
              <Heading as="h2" className="text-white text-xl font-semibold m-0 mb-4">
                What&apos;s next?
              </Heading>

              {[
                { icon: "✅", text: "Complete your profile in Settings" },
                { icon: "💳", text: "Choose a subscription plan that fits your needs" },
                { icon: "🚀", text: "Explore the dashboard and all features" },
              ].map(({ icon, text }) => (
                <Section key={text} className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-lg px-4 py-3 mb-2">
                  <Text className="text-zinc-300 text-sm leading-relaxed m-0">
                    {icon} &nbsp;{text}
                  </Text>
                </Section>
              ))}
            </Section>

            <Hr className="border-[rgba(255,255,255,0.08)] my-6" />

            {/* Footer */}
            <Section className="px-2 text-center">
              <Text className="text-zinc-600 text-xs leading-relaxed m-0 mb-1">
                © {new Date().getFullYear()} Boilerplate. All rights reserved.
              </Text>
              <Text className="text-zinc-600 text-xs leading-relaxed m-0">
                You received this email because you signed up for Boilerplate.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
