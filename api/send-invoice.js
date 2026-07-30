import { assertSmtpConfigured, createTransporter, allowOnlyPost, appendCredit } from "./_mail.js";
import { getAdminDb } from "./_firebase-admin.js";
import { renderBrandedEmail } from "./_branded-email.js";
import { generateInvoicePdf } from "./_invoice-pdf.js";
import { appOrigin, buildVerifyUrl } from "./_invoice-shared.js";

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export async function sendInvoiceEmailHandler(req, res) {
  if (!allowOnlyPost(req, res) || !assertSmtpConfigured(res)) return;

  const { invoiceId } = req.body || {};
  if (!invoiceId) {
    res.status(400).json({ error: "Invoice id is required." });
    return;
  }

  const db = getAdminDb();
  const invoiceRef = db.collection("invoices").doc(String(invoiceId));

  try {
    const snap = await invoiceRef.get();
    if (!snap.exists) {
      res.status(404).json({ error: "Invoice not found." });
      return;
    }

    const invoice = { id: snap.id, ...snap.data() };
    if (!invoice.customer?.email) {
      res.status(400).json({ error: "Customer email is missing on this invoice." });
      return;
    }

    const verifyUrl = buildVerifyUrl(appOrigin(req), invoice.verificationToken);
    const pdf = await generateInvoicePdf(invoice, verifyUrl);
    if (!pdf?.length || pdf.length < 500) {
      throw new Error("Generated invoice PDF is empty.");
    }
    const subject = `Invoice ${invoice.invoiceNumber} - Singh Automobiles`;
    const message = [
      `Hello ${invoice.customer.name},`,
      `Please find attached your invoice from Singh Automobiles for heavy machinery service support.`,
      `Invoice Number: ${invoice.invoiceNumber}`,
      `Total Amount: ${formatCurrency(invoice.totals?.roundedTotal)}`,
      `Payment Status: ${invoice.status}`,
      `This invoice has been generated and verified by Singh Automobiles. The attached PDF includes a QR code for anytime verification.`,
    ].join("\n\n");

    const html = renderBrandedEmail({
      themeId: "precision",
      subject,
      introText: `Hello ${invoice.customer.name}, your verified service invoice is attached as a PDF.`,
      message,
      details: [
        { label: "Invoice Number", value: invoice.invoiceNumber },
        { label: "Customer", value: invoice.customer.name },
        { label: "Phone", value: invoice.customer.phone },
        { label: "Status", value: invoice.status },
        { label: "Grand Total", value: formatCurrency(invoice.totals?.roundedTotal) },
      ],
      attachmentsCount: 1,
    });

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Singh Automobiles" <${process.env.SMTP_FROM_EMAIL}>`,
      to: invoice.customer.email,
      subject,
      text: appendCredit(message),
      html,
      attachments: [{
        filename: `${invoice.invoiceNumber}.pdf`,
        content: pdf,
        contentType: "application/pdf",
        contentDisposition: "attachment",
      }],
    });

    await invoiceRef.set({
      emailSent: true,
      emailSentAt: new Date(),
      deliveryStatus: "Sent",
      updatedAt: new Date(),
      timeline: [
        ...(Array.isArray(invoice.timeline) ? invoice.timeline : []),
        { label: "Invoice Sent", at: new Date().toISOString(), note: `Sent to ${invoice.customer.email} via SMTP.` },
      ],
    }, { merge: true });

    res.status(200).json({ ok: true, deliveryStatus: "Sent" });
  } catch (error) {
    console.error("Invoice email failed:", error);
    try {
      await invoiceRef.set({
        emailSent: false,
        deliveryStatus: "Failed",
        emailError: error instanceof Error ? error.message : "SMTP delivery failed",
        updatedAt: new Date(),
      }, { merge: true });
    } catch (updateError) {
      console.error("Invoice failure status update failed:", updateError);
    }
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to send invoice email." });
  }
}

export default sendInvoiceEmailHandler;
