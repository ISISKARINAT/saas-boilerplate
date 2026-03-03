/**
 * Template d'email de facture / confirmation de paiement.
 * Affiche les lignes de facture, le total, le logo et un lien de téléchargement PDF.
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
  Tailwind,
  Text,
} from "@react-email/components";

export interface InvoiceItem {
  /** Description de la ligne (ex : "Pro Plan — Monthly") */
  description: string;
  /** Quantité */
  quantity: number;
  /** Prix unitaire HT */
  unitPrice: number;
}

export interface InvoiceEmailProps {
  /** Nom ou email du client */
  userName: string;
  /** Numéro de facture (ex : "INV-2024-001") */
  invoiceNumber: string;
  /** Date d'émission (ex : "2024-01-15") */
  invoiceDate: string;
  /** Date d'échéance (ex : "2024-02-15") */
  dueDate: string;
  /** Lignes de facture */
  items: InvoiceItem[];
  /** Montant total TTC */
  total: number;
  /** Code devise ISO 4217 (ex : "USD", "EUR") */
  currency: string;
  /** URL de téléchargement du PDF de facture */
  downloadUrl: string;
}

/**
 * Email de facture responsive, compatible dark mode.
 * @param props - Données de la facture
 */
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
    <Html lang="en">
      <Head />
      <Tailwind>
        <Preview>Invoice {invoiceNumber} — {formatAmount(total)}</Preview>
        <Body className="bg-[#0a0a0a] m-0 p-0" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <Container className="mx-auto py-8 px-4 max-w-[600px]">

            {/* Main card */}
            <Section className="bg-[#111111] rounded-xl px-8 pt-8 pb-6 border border-[rgba(255,255,255,0.08)]">

              {/* Header row: logo + invoice badge */}
              <Row className="mb-6">
                <Column>
                  <Heading className="text-indigo-500 text-2xl font-bold m-0 tracking-tight">
                    Boilerplate
                  </Heading>
                  <Text className="text-zinc-500 text-xs m-0 mt-1 uppercase tracking-widest">
                    Payment Receipt
                  </Text>
                </Column>
                <Column style={{ textAlign: "right" as const }}>
                  <Text className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest m-0 mb-1">
                    Invoice
                  </Text>
                  <Text className="text-white text-base font-semibold m-0">
                    {invoiceNumber}
                  </Text>
                  <Text className="text-emerald-500 text-xs font-medium m-0 mt-1">
                    ✓ &nbsp;Paid
                  </Text>
                </Column>
              </Row>

              <Hr className="border-[rgba(255,255,255,0.08)] my-5" />

              {/* Meta: billed to + dates */}
              <Row className="mb-5">
                <Column>
                  <Text className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest m-0 mb-1">
                    Billed to
                  </Text>
                  <Text className="text-zinc-200 text-sm font-medium m-0">
                    {userName}
                  </Text>
                </Column>
                <Column style={{ textAlign: "right" as const }}>
                  <Text className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest m-0 mb-1">
                    Invoice date
                  </Text>
                  <Text className="text-zinc-200 text-sm m-0 mb-2">{invoiceDate}</Text>
                  <Text className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest m-0 mb-1">
                    Due date
                  </Text>
                  <Text className="text-zinc-200 text-sm m-0">{dueDate}</Text>
                </Column>
              </Row>

              <Hr className="border-[rgba(255,255,255,0.08)] my-5" />

              {/* Line items table */}
              <Section className="mb-4">
                {/* Table header */}
                <Row className="bg-[rgba(255,255,255,0.04)] rounded-md">
                  <Column style={{ width: "60%", padding: "8px 4px" }}>
                    <Text className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest m-0">
                      Description
                    </Text>
                  </Column>
                  <Column style={{ width: "15%", textAlign: "center" as const, padding: "8px 4px" }}>
                    <Text className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest m-0">
                      Qty
                    </Text>
                  </Column>
                  <Column style={{ width: "25%", textAlign: "right" as const, padding: "8px 4px" }}>
                    <Text className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest m-0">
                      Amount
                    </Text>
                  </Column>
                </Row>

                {/* Table rows */}
                {items.map((item, index) => (
                  <Row key={index} className="border-b border-[rgba(255,255,255,0.05)]">
                    <Column style={{ width: "60%", padding: "10px 4px" }}>
                      <Text className="text-zinc-300 text-sm m-0">{item.description}</Text>
                    </Column>
                    <Column style={{ width: "15%", textAlign: "center" as const, padding: "10px 4px" }}>
                      <Text className="text-zinc-300 text-sm m-0">{item.quantity}</Text>
                    </Column>
                    <Column style={{ width: "25%", textAlign: "right" as const, padding: "10px 4px" }}>
                      <Text className="text-zinc-300 text-sm m-0">
                        {formatAmount(item.quantity * item.unitPrice)}
                      </Text>
                    </Column>
                  </Row>
                ))}
              </Section>

              <Hr className="border-[rgba(255,255,255,0.08)] my-4" />

              {/* Total */}
              <Row className="mb-8">
                <Column />
                <Column style={{ textAlign: "right" as const }}>
                  <Text className="text-zinc-400 text-sm font-medium m-0 mb-1">
                    Total paid
                  </Text>
                  <Text className="text-white text-3xl font-bold m-0">
                    {formatAmount(total)}
                  </Text>
                </Column>
              </Row>

              {/* Download CTA */}
              <Section className="text-center pb-2">
                <Button
                  href={downloadUrl}
                  className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-8 py-3 no-underline inline-block"
                >
                  ↓ &nbsp;Download Invoice PDF
                </Button>
              </Section>

            </Section>

            <Hr className="border-[rgba(255,255,255,0.08)] my-6" />

            {/* Footer */}
            <Section className="text-center px-2">
              <Text className="text-zinc-600 text-xs leading-relaxed m-0 mb-1">
                © {new Date().getFullYear()} Boilerplate. All rights reserved.
              </Text>
              <Text className="text-zinc-600 text-xs leading-relaxed m-0">
                Questions? Contact us at billing@example.com
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}


