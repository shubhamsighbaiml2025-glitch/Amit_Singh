import QRCode from "qrcode";
import { drawQrInPdf } from "./_invoice-qr.js";

function pdfEscape(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

function money(value = 0) {
  return `INR ${Number(value || 0).toFixed(2)}`;
}

function line(text, x, y, size = 10) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${pdfEscape(text)}) Tj ET\n`;
}

function bold(text, x, y, size = 12) {
  return `BT /F2 ${size} Tf ${x} ${y} Td (${pdfEscape(text)}) Tj ET\n`;
}

function rect(x, y, w, h, fill = false) {
  return fill ? `${x} ${y} ${w} ${h} re f\n` : `${x} ${y} ${w} ${h} re S\n`;
}

function formatDisplayDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function generateInvoicePdf(invoice, verifyUrl) {
  const chunks = [];
  let y = 790;

  // Accent bar
  chunks.push("0.96 0.72 0.0 rg\n");
  chunks.push(rect(0, 832, 595, 10, true));
  chunks.push("0 0 0 RG\n");

  // Header background
  chunks.push("1 1 1 rg\n");
  chunks.push(rect(0, 0, 595, 842, true));
  chunks.push("0 0 0 RG\n");

  chunks.push(bold(invoice.company?.name || "Singh Automobiles", 40, y, 16));
  y -= 16;
  chunks.push(line(invoice.company?.address || "India", 40, y, 9));
  y -= 13;
  chunks.push(line(`${invoice.company?.phone || ""} | ${invoice.company?.email || ""}`, 40, y, 9));
  if (invoice.company?.gstNumber) {
    y -= 13;
    chunks.push(line(`GSTIN: ${invoice.company.gstNumber}`, 40, y, 9));
  }

  chunks.push(bold("TAX INVOICE", 400, 790, 18));
  chunks.push(line(invoice.invoiceNumber, 400, 770, 10));
  chunks.push(bold(`Status: ${invoice.status}`, 400, 754, 10));

  // Bill To box
  chunks.push("0.95 0.95 0.95 rg\n");
  chunks.push(rect(40, 648, 515, 82, true));
  chunks.push("0.85 0.85 0.85 RG\n");
  chunks.push(rect(40, 648, 515, 82));
  chunks.push("0 0 0 RG\n");

  chunks.push(bold("Bill To", 54, 708, 10));
  chunks.push(bold(invoice.customer?.companyName || invoice.customer?.name || "", 54, 690, 12));
  chunks.push(line(invoice.customer?.companyName ? invoice.customer?.name : "", 54, 674, 9));
  chunks.push(line(`${invoice.customer?.phone || ""} | ${invoice.customer?.email || ""}`, 54, 660, 8));
  chunks.push(line(`Invoice Date: ${formatDisplayDate(invoice.invoiceDate)}`, 380, 704, 9));
  chunks.push(line(`Due Date: ${formatDisplayDate(invoice.dueDate)}`, 380, 688, 9));
  chunks.push(bold(`Amount Due: ${money(invoice.totals?.roundedTotal)}`, 380, 668, 10));
  if (invoice.customer?.gstNumber) {
    chunks.push(line(`GSTIN: ${invoice.customer.gstNumber}`, 54, 646, 8));
  }

  // Table header
  y = 620;
  chunks.push("0.07 0.07 0.07 rg\n");
  chunks.push(rect(40, 606, 515, 20, true));
  chunks.push("1 1 1 rg\n");
  chunks.push(bold("#", 46, 612, 9));
  chunks.push(bold("Service", 62, 612, 9));
  chunks.push(bold("Description", 170, 612, 9));
  chunks.push(bold("Qty", 360, 612, 9));
  chunks.push(bold("Rate", 400, 612, 9));
  chunks.push(bold("Amount", 478, 612, 9));
  chunks.push("0 0 0 rg\n");

  (invoice.services || []).slice(0, 14).forEach((item, index) => {
    y -= 18;
    chunks.push(line(String(index + 1), 46, y, 9));
    chunks.push(line(item.name || "", 62, y, 9));
    chunks.push(line((item.description || "").slice(0, 42), 170, y, 8));
    chunks.push(line(String(item.quantity || 0), 366, y, 9));
    chunks.push(line(money(item.unitPrice), 400, y, 9));
    chunks.push(line(money(item.total), 478, y, 9));
    chunks.push("0.9 0.9 0.9 RG\n");
    chunks.push(`${40} ${y - 4} 515 0.5 re f\n`);
    chunks.push("0 0 0 RG\n");
  });

  y -= 28;
  chunks.push(bold("Invoice Summary", 350, y, 11));
  y -= 18;
  [
    ["Subtotal", money(invoice.totals?.subtotal)],
    [`Discount (${invoice.totals?.discountPercent || 0}%)`, `- ${money(invoice.totals?.discountAmount)}`],
    [`GST (${invoice.totals?.gstPercent || 0}%)`, money(invoice.totals?.gstAmount)],
    ["Round Off", money(invoice.totals?.roundOff)],
    ["Grand Total", money(invoice.totals?.roundedTotal)],
  ].forEach(([label, value]) => {
    chunks.push(line(label, 350, y, 9));
    chunks.push(bold(value, 462, y, 9));
    y -= 15;
  });

  chunks.push(line(`Amount in words: ${invoice.totals?.amountInWords || ""}`, 40, 250, 8));

  chunks.push(bold("Terms & Conditions", 40, 228, 10));
  let termY = 212;
  (invoice.terms || []).slice(0, 6).forEach((term, index) => {
    chunks.push(line(`${index + 1}. ${String(term).slice(0, 95)}`, 48, termY, 7));
    termY -= 11;
  });

  // QR verification section
  chunks.push("0.95 0.95 0.95 rg\n");
  chunks.push(rect(40, 52, 280, 96, true));
  chunks.push("0.85 0.85 0.85 RG\n");
  chunks.push(rect(40, 52, 280, 96));
  chunks.push("0 0 0 RG\n");

  drawQrInPdf(chunks, verifyUrl, 48, 60, 72);
  chunks.push(bold("Scan to Verify Invoice", 132, 128, 9));
  chunks.push(line("Scan with any phone camera", 132, 114, 8));
  chunks.push(line("to open the verification page.", 132, 102, 8));
  chunks.push(line(verifyUrl.slice(0, 48), 132, 88, 6));
  if (verifyUrl.length > 48) {
    chunks.push(line(verifyUrl.slice(48, 96), 132, 78, 6));
  }

  chunks.push(bold("Authorized Signature", 400, 100, 10));
  chunks.push(line(invoice.company?.name || "", 400, 84, 8));
  chunks.push(line("Computer-generated invoice.", 400, 68, 7));

  const stream = chunks.join("");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}endstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

/** Generate QR as PNG buffer (for optional future use). */
export async function generateQrPng(data, size = 180) {
  return QRCode.toBuffer(String(data), { width: size, margin: 1, errorCorrectionLevel: "M" });
}
