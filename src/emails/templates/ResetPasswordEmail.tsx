/**
 * Template d'email de réinitialisation de mot de passe.
 * Contient un lien de reset valable 1 heure avec instructions claires.
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

export interface ResetPasswordEmailProps {
  /** Prénom ou nom d'utilisateur affiché dans le mail */
  userName: string;
  /** URL du lien de réinitialisation (expire dans 1h) */
  resetUrl: string;
}

/**
 * Email de réinitialisation de mot de passe responsive, compatible dark mode.
 * Le lien expire après 1 heure.
 * @param props - Données personnalisées de l'email
 */
export default function ResetPasswordEmail({
  userName = "there",
  resetUrl = "https://app.example.com/reset-password?token=xxx",
}: ResetPasswordEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Tailwind>
        <Preview>Reset your Boilerplate password</Preview>
        <Body className="bg-[#0a0a0a] m-0 p-0" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <Container className="mx-auto py-8 px-4 max-w-[580px]">

            {/* Header */}
            <Section className="text-center pb-6">
              <Heading className="text-indigo-500 text-2xl font-bold m-0 tracking-tight">
                Boilerplate
              </Heading>
            </Section>

            {/* Main card */}
            <Section className="bg-[#111111] rounded-xl px-8 py-10 border border-[rgba(255,255,255,0.08)]">
              {/* Lock icon badge */}
              <Section className="text-center mb-6">
                <Text className="text-4xl m-0">🔐</Text>
              </Section>

              <Heading className="text-white text-[26px] font-bold leading-snug m-0 mb-5">
                Reset your password
              </Heading>
              <Text className="text-zinc-400 text-sm leading-relaxed m-0 mb-2">
                Hi {userName},
              </Text>
              <Text className="text-zinc-400 text-sm leading-relaxed m-0 mb-8">
                We received a request to reset the password for your Boilerplate account.
                Click the button below to choose a new password. If you didn&apos;t make
                this request, you can safely ignore this email.
              </Text>

              {/* CTA */}
              <Section className="text-center mb-8">
                <Button
                  href={resetUrl}
                  className="bg-indigo-600 text-white text-base font-semibold rounded-lg px-10 py-3 no-underline inline-block"
                >
                  Reset Password
                </Button>
              </Section>

              {/* Warning box */}
              <Section className="bg-[rgba(251,191,36,0.07)] rounded-lg border border-[rgba(251,191,36,0.2)] px-5 py-4 mb-6">
                <Text className="text-zinc-300 text-sm leading-relaxed m-0 mb-1">
                  ⏱ &nbsp;This link expires in <strong style={{ color: "#fbbf24" }}>1 hour</strong>.
                </Text>
                <Text className="text-zinc-400 text-sm leading-relaxed m-0 mb-1">
                  🔒 &nbsp;For your security, never share this link with anyone.
                </Text>
                <Text className="text-zinc-400 text-sm leading-relaxed m-0">
                  🚫 &nbsp;Your password will <em>not</em> be changed if you ignore this email.
                </Text>
              </Section>

              <Hr className="border-[rgba(255,255,255,0.08)] my-5" />

              <Text className="text-zinc-600 text-xs leading-relaxed m-0 mb-1">
                If the button doesn&apos;t work, copy and paste this URL into your browser:
              </Text>
              <Text className="text-indigo-500 text-xs m-0" style={{ wordBreak: "break-all" }}>
                {resetUrl}
              </Text>
            </Section>

            <Hr className="border-[rgba(255,255,255,0.08)] my-6" />

            {/* Footer */}
            <Section className="text-center px-2">
              <Text className="text-zinc-600 text-xs leading-relaxed m-0">
                © {new Date().getFullYear()} Boilerplate. All rights reserved.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
