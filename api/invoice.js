import { getAdminDb } from "./_firebase-admin.js";
import { serializeInvoiceForResponse } from "./_invoice-shared.js";

export async function getInvoiceByTokenHandler(req, res) {
  try {
    const token = String(req.query?.token || "").trim();
    if (!token) {
      res.status(400).json({ error: "Invoice verification token is required." });
      return;
    }

    const db = getAdminDb();
    const snap = await db.collection("invoices").where("verificationToken", "==", token).limit(1).get();

    if (snap.empty) {
      res.status(404).json({ error: "Invoice not found." });
      return;
    }

    const invoiceDoc = snap.docs[0];
    const invoice = { id: invoiceDoc.id, ...invoiceDoc.data() };

    res.json({ invoice: serializeInvoiceForResponse(invoice) });
  } catch (error) {
    console.error("Invoice lookup failed:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to load invoice." });
  }
}

export default getInvoiceByTokenHandler;
