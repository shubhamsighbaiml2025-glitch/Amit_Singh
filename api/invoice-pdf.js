import { getAdminDb } from "./_firebase-admin.js";
import { generateInvoicePdf } from "./_invoice-pdf.js";
import { appOrigin, buildVerifyUrl } from "./_invoice-shared.js";

async function loadInvoice(token, invoiceId) {
  const db = getAdminDb();

  if (token) {
    const snap = await db.collection("invoices").where("verificationToken", "==", String(token)).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  if (invoiceId) {
    const snap = await db.collection("invoices").doc(String(invoiceId)).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  }

  return null;
}

export async function generateInvoicePdfResponse(req, res) {
  const token = req.query?.token || req.body?.token;
  const invoiceId = req.query?.invoiceId || req.body?.invoiceId;

  if (!token && !invoiceId) {
    res.status(400).json({ error: "Provide token or invoiceId." });
    return;
  }

  try {
    const invoice = await loadInvoice(token, invoiceId);
    if (!invoice) {
      res.status(404).json({ error: "Invoice not found." });
      return;
    }

    const verifyUrl = buildVerifyUrl(appOrigin(req), invoice.verificationToken);
    const pdf = await generateInvoicePdf(invoice, verifyUrl);
    const filename = `${invoice.invoiceNumber || "invoice"}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.status(200).send(pdf);
  } catch (error) {
    console.error("Invoice PDF failed:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate PDF." });
  }
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  await generateInvoicePdfResponse(req, res);
}
