/**
 * Email de facture / confirmation de paiement.
 */
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceEmailProps {
  userName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  total: number;
  currency: string;
  downloadUrl: string;
}

export default function InvoiceEmail({
  userName = "John Doe",
  invoiceNumber = "INV-2024-001",
  invoiceDate = "2024-01-15",
  dueDate = "2024-02-15",
  items = [{ description: "Pro Plan — Monthly", quantity: 1, unitPrice: 99 }],
  total = 99,
  currency = "USD",
  downloadUrl = "https://app.example.com/invoices/download/xxx",
}: InvoiceEmailProps) {
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  return (
    <Html>
      <Head />
      <Preview>Invoice {invoiceNumber} — {formatAmount(total)}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Row>
              <Column>
                <Heading style={styles.logo}>Boilerplate</Heading>
              </Column>
              <Column style={{ textAlign: "right" as const }}>
                <Text style={styles.invoiceLabel}>INVOICE</Text>
                <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
              </Column>
            </Row>
          </Section>

          {/* Meta */}
          <Section style={styles.metaSection}>
            <Row>
              <Column>
                <Text style={styles.metaLabel}>Billed to</Text>
                <Text style={styles.metaValue}>{userName}</Text>
              </Column>
              <Column style={{ textAlign: "right" as const }}>
                <Text style={styles.metaLabel}>Invoice date</Text>
                <Text style={styles.metaValue}>{invoiceDate}</Text>
                <Text style={styles.metaLabel}>Due date</Text>
                <Text style={styles.metaValue}>{dueDate}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={styles.hr} />

          {/* Items */}
          <Section style={styles.tableSection}>
            <Row style={styles.tableHeader}>
              <Column style={styles.colDescription}>
                <Text style={styles.tableHeaderText}>Description</Text>
              </Column>
              <Column style={styles.colQty}>
                <Text style={styles.tableHeaderText}>Qty</Text>
              </Column>
              <Column style={styles.colPrice}>
                <Text style={styles.tableHeaderTextRight}>Amount</Text>
              </Column>
            </Row>
            {items.map((item, index) => (
              <Row key={index} style={styles.tableRow}>
                <Column style={styles.colDescription}>
                  <Text style={styles.tableCell}>{item.description}</Text>
                </Column>
                <Column style={styles.colQty}>
                  <Text style={styles.tableCell}>{item.quantity}</Text>
                </Column>
                <Column style={styles.colPrice}>
                  <Text style={styles.tableCellRight}>
                    {formatAmount(item.quantity * item.unitPrice)}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={styles.hr} />

          {/* Total */}
          <Section style={styles.totalSection}>
            <Row>
              <Column />
              <Column style={{ textAlign: "right" as const }}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>{formatAmount(total)}</Text>
              </Column>
            </Row>
          </Section>

          {/* CTA */}
          <Section style={styles.ctaSection}>
            <Button href={downloadUrl} style={styles.button}>
              Download Invoice PDF
            </Button>
          </Section>

          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Boilerplate. All rights reserved.
            </Text>
            <Text style={styles.footerText}>Questions? Contact us at billing@example.com</Text>
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
    padding: "20px 24px 48px",
    maxWidth: "600px",
    backgroundColor: "#111111",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  header: { padding: "32px 0 16px" },
  logo: { color: "#6366f1", fontSize: "24px", fontWeight: "700", margin: "0" },
  invoiceLabel: {
    color: "#71717a",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    margin: "0 0 4px",
  },
  invoiceNumber: { color: "#ffffff", fontSize: "16px", fontWeight: "600", margin: "0" },
  metaSection: { padding: "8px 0 16px" },
  metaLabel: {
    color: "#71717a",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    margin: "0 0 2px",
  },
  metaValue: { color: "#d4d4d8", fontSize: "14px", fontWeight: "500", margin: "0 0 8px" },
  hr: { borderColor: "rgba(255,255,255,0.08)", margin: "16px 0" },
  tableSection: { padding: "8px 0" },
  tableHeader: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "8px 0" },
  tableHeaderText: {
    color: "#71717a",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    margin: "0",
    padding: "8px 4px",
  },
  tableHeaderTextRight: {
    color: "#71717a",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    margin: "0",
    padding: "8px 4px",
    textAlign: "right" as const,
  },
  tableRow: { borderBottom: "1px solid rgba(255,255,255,0.04)" },
  tableCell: { color: "#d4d4d8", fontSize: "14px", lineHeight: "1.5", margin: "0", padding: "10px 4px" },
  tableCellRight: {
    color: "#d4d4d8",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0",
    padding: "10px 4px",
    textAlign: "right" as const,
  },
  colDescription: { width: "60%" },
  colQty: { width: "15%", textAlign: "center" as const },
  colPrice: { width: "25%", textAlign: "right" as const },
  totalSection: { padding: "8px 0 16px" },
  totalLabel: { color: "#a1a1aa", fontSize: "14px", fontWeight: "500", margin: "0 0 4px" },
  totalAmount: { color: "#ffffff", fontSize: "28px", fontWeight: "700", margin: "0" },
  ctaSection: { textAlign: "center" as const, padding: "16px 0" },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "12px 28px",
    display: "inline-block",
  },
  footer: { textAlign: "center" as const },
  footerText: { color: "#52525b", fontSize: "13px", lineHeight: "1.5", margin: "0 0 4px" },
} as const;
