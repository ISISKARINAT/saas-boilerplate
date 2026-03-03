/**
 * Email de réinitialisation de mot de passe.
 * Contient un lien de reset valable 30 minutes.
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

interface ResetPasswordEmailProps {
  userName: string;
  resetUrl: string;
}

export default function ResetPasswordEmail({
  userName = "there",
  resetUrl = "https://app.example.com/reset-password?token=xxx",
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Boilerplate password</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading style={styles.logo}>Boilerplate</Heading>
          </Section>
          <Section style={styles.main}>
            <Heading style={styles.heading}>Reset your password</Heading>
            <Text style={styles.text}>Hi {userName},</Text>
            <Text style={styles.text}>
              We received a request to reset the password for your account.
              Click the button below to choose a new password.
            </Text>
            <Section style={styles.buttonContainer}>
              <Button href={resetUrl} style={styles.button}>
                Reset Password
              </Button>
            </Section>
            <Section style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⏱ This link expires in{" "}
                <strong style={{ color: "#fbbf24" }}>30 minutes</strong>.
              </Text>
              <Text style={styles.warningText}>
                If you didn&apos;t request a password reset, you can safely
                ignore this email — your password will not be changed.
              </Text>
            </Section>
            <Hr style={styles.hr} />
            <Text style={styles.smallText}>
              If the button above doesn&apos;t work, copy and paste this URL into your browser:
            </Text>
            <Text style={styles.urlText}>{resetUrl}</Text>
          </Section>
          <Section style={styles.footer}>
            <Hr style={styles.hr} />
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Boilerplate. All rights reserved.
            </Text>
            <Text style={styles.footerText}>
              For security reasons, never share this link with anyone.
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
  container: { margin: "0 auto", padding: "20px 0 48px", maxWidth: "580px" },
  header: { padding: "24px 0 0", textAlign: "center" as const },
  logo: { color: "#6366f1", fontSize: "24px", fontWeight: "700", margin: "0 0 24px" },
  main: {
    backgroundColor: "#111111",
    borderRadius: "12px",
    padding: "40px 32px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  heading: { color: "#ffffff", fontSize: "26px", fontWeight: "700", lineHeight: "1.3", margin: "0 0 20px" },
  text: { color: "#a1a1aa", fontSize: "15px", lineHeight: "1.6", margin: "0 0 12px" },
  buttonContainer: { textAlign: "center" as const, margin: "28px 0" },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "12px 32px",
    display: "inline-block",
  },
  warningBox: {
    backgroundColor: "rgba(251,191,36,0.08)",
    borderRadius: "8px",
    border: "1px solid rgba(251,191,36,0.2)",
    padding: "16px",
    margin: "0 0 24px",
  },
  warningText: { color: "#d4d4d8", fontSize: "14px", lineHeight: "1.6", margin: "0 0 6px" },
  hr: { borderColor: "rgba(255,255,255,0.08)", margin: "20px 0" },
  smallText: { color: "#71717a", fontSize: "13px", lineHeight: "1.5", margin: "0 0 6px" },
  urlText: { color: "#6366f1", fontSize: "12px", wordBreak: "break-all" as const, margin: "0" },
  footer: { padding: "0 8px", textAlign: "center" as const },
  footerText: { color: "#52525b", fontSize: "13px", lineHeight: "1.5", margin: "0 0 4px" },
} as const;
