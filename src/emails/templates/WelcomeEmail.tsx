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
      <Preview>Welcome to Boilerplate — get started now</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.hero}>
            <Heading style={styles.logo}>Boilerplate</Heading>
            <Heading style={styles.heading}>Welcome, {userName}! 🎉</Heading>
            <Text style={styles.subheading}>
              Your account is ready. Start building something great today.
            </Text>
            <Button href={ctaUrl} style={styles.button}>
              Activate my account →
            </Button>
          </Section>
          <Hr style={styles.hr} />
          <Section style={styles.section}>
            <Heading as="h2" style={styles.sectionTitle}>
              What&apos;s next?
            </Heading>
            <Text style={styles.text}>
              Here are a few things you can do to get started:
            </Text>
            <Text style={styles.listItem}>✅ Complete your profile in settings</Text>
            <Text style={styles.listItem}>✅ Choose a subscription plan that fits your needs</Text>
            <Text style={styles.listItem}>✅ Explore the dashboard and features</Text>
          </Section>
          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Boilerplate. All rights reserved.
            </Text>
            <Text style={styles.footerText}>
              You received this email because you signed up for Boilerplate.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#0a0a0a",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "580px",
  },
  hero: {
    backgroundColor: "#111111",
    borderRadius: "12px",
    padding: "40px 32px",
    textAlign: "center" as const,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  logo: { color: "#6366f1", fontSize: "24px", fontWeight: "700", margin: "0 0 16px" },
  heading: { color: "#ffffff", fontSize: "28px", fontWeight: "700", lineHeight: "1.3", margin: "0 0 12px" },
  subheading: { color: "#a1a1aa", fontSize: "16px", lineHeight: "1.6", margin: "0 0 28px" },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "12px 28px",
    display: "inline-block",
  },
  hr: { borderColor: "rgba(255,255,255,0.08)", margin: "24px 0" },
  section: { padding: "0 8px" },
  sectionTitle: { color: "#ffffff", fontSize: "20px", fontWeight: "600", margin: "0 0 12px" },
  text: { color: "#a1a1aa", fontSize: "15px", lineHeight: "1.6", margin: "0 0 8px" },
  listItem: { color: "#d4d4d8", fontSize: "15px", lineHeight: "1.6", margin: "0 0 6px", paddingLeft: "8px" },
  footer: { padding: "0 8px", textAlign: "center" as const },
  footerText: { color: "#52525b", fontSize: "13px", lineHeight: "1.5", margin: "0 0 4px" },
} as const;
