import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const signatureCandidates = [
  path.resolve(__dirname, "../public/assets/authorized-signature.png"),
  path.resolve(__dirname, "./assets/authorized-signature.png"),
  path.resolve(process.cwd(), "public/assets/authorized-signature.png"),
];

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDisplayDate(value) {
  if (!value) return "-";
  const raw = typeof value === "object" && value !== null && "toDate" in value
    ? value.toDate()
    : value;
  const date = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeInvoice(invoice = {}) {
  return {
    ...invoice,
    company: {
      name: "Singh Automobiles",
      address: "India",
      phone: "+91 89876 89694",
      email: "singhautomobiles.in@gmail.com",
      gstNumber: "",
      ...(invoice.company || {}),
    },
    customer: invoice.customer || {},
    services: Array.isArray(invoice.services) ? invoice.services : [],
    totals: invoice.totals || {},
    terms: Array.isArray(invoice.terms) ? invoice.terms : [],
    status: invoice.status || "Pending",
  };
}

function resolveSignaturePath() {
  const candidate = signatureCandidates.find((entry) => fs.existsSync(entry));
  if (candidate) {
    return candidate;
  }

  const fallback = path.resolve(process.cwd(), "public/assets/authorized-signature.png");
  return fs.existsSync(fallback) ? fallback : null;
}

function writeLabelValue(doc, label, value, x, y, width = 170) {
  doc.font("Helvetica").fontSize(9).fillColor("#64748b").text(label, x, y, { width });
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#0f172a").text(String(value || "-"), x, y + 12, { width });
}

export async function generateInvoicePdf(invoiceInput, verifyUrl) {
  const invoice = normalizeInvoice(invoiceInput);
  const qrBuffer = await QRCode.toBuffer(String(verifyUrl), {
    width: 140,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  const signaturePath = resolveSignaturePath();

  const pdfBuffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 36, autoFirstPage: true });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const buffer = Buffer.concat(chunks);
      if (buffer.length < 500) {
        reject(new Error("Generated PDF buffer is empty."));
        return;
      }
      resolve(buffer);
    });
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - 72;
    const left = 36;
    let cursorY = 56;

    doc.save();
    doc.rect(left, 36, contentWidth, 6).fill("#f5b800");
    doc.restore();

    doc.font("Helvetica-Bold").fontSize(16).fillColor("#0f172a")
      .text(invoice.company.name, left, cursorY, { width: 320 });
    cursorY = doc.y + 4;

    doc.font("Helvetica").fontSize(9).fillColor("#475569")
      .text(invoice.company.address || "India", left, cursorY, { width: 320 });
    cursorY = doc.y + 2;
    doc.text(`${invoice.company.phone || ""} · ${invoice.company.email || ""}`, left, cursorY, { width: 320 });
    cursorY = doc.y + 2;

    if (invoice.company.gstNumber) {
      doc.text(`GSTIN: ${invoice.company.gstNumber}`, left, cursorY, { width: 320 });
      cursorY = doc.y + 2;
    }

    doc.font("Helvetica-Bold").fontSize(20).fillColor("#0f172a")
      .text("INVOICE", pageWidth - 170, 56, { width: 130, align: "right" });
    doc.font("Helvetica").fontSize(10).fillColor("#475569")
      .text(invoice.invoiceNumber || "-", pageWidth - 170, 82, { width: 130, align: "right" })
      .text(`Status: ${invoice.status}`, pageWidth - 170, 96, { width: 130, align: "right" });

    const boxTop = Math.max(cursorY + 18, 118);
    doc.roundedRect(left, boxTop, contentWidth, 88, 4).fillAndStroke("#f8fafc", "#e2e8f0");

    doc.font("Helvetica-Bold").fontSize(10).fillColor("#64748b")
      .text("BILL TO", 48, boxTop + 12);
    doc.font("Helvetica-Bold").fontSize(13).fillColor("#0f172a")
      .text(invoice.customer.companyName || invoice.customer.name || "-", 48, boxTop + 28, { width: 280 });

    let billY = doc.y + 2;
    if (invoice.customer.companyName) {
      doc.font("Helvetica").fontSize(9).fillColor("#334155")
        .text(invoice.customer.name || "", 48, billY, { width: 280 });
      billY = doc.y + 2;
    }

    doc.font("Helvetica").fontSize(9).fillColor("#334155")
      .text(`${invoice.customer.phone || ""} · ${invoice.customer.email || ""}`, 48, billY, { width: 280 });
    billY = doc.y + 2;
    doc.text(invoice.customer.address || "", 48, billY, { width: 280 });
    billY = doc.y + 2;

    if (invoice.customer.gstNumber) {
      doc.text(`GSTIN: ${invoice.customer.gstNumber}`, 48, billY, { width: 280 });
    }

    writeLabelValue(doc, "Invoice Date", formatDisplayDate(invoice.invoiceDate), pageWidth - 210, boxTop + 18);
    writeLabelValue(doc, "Due Date", formatDisplayDate(invoice.dueDate), pageWidth - 210, boxTop + 44);
    writeLabelValue(doc, "Amount Due", formatCurrency(invoice.totals.roundedTotal), pageWidth - 210, boxTop + 70);

    const tableTop = boxTop + 104;
    const columns = [
      { label: "#", x: 40, w: 20 },
      { label: "Service", x: 62, w: 120 },
      { label: "Description", x: 185, w: 170 },
      { label: "Qty", x: 360, w: 30 },
      { label: "Rate", x: 395, w: 70 },
      { label: "Amount", x: 470, w: 80 },
    ];

    doc.rect(left, tableTop, contentWidth, 24).fill("#0f172a");
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff");
    columns.forEach((col) => doc.text(col.label, col.x, tableTop + 8, { width: col.w }));

    const defaultRowHeight = 22;
    const pageBottom = pageHeight - 42;
    let rowY = tableTop + 32;

    const drawServiceTableHeader = () => {
      doc.rect(left, 28, contentWidth, 24).fill("#0f172a");
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff");
      columns.forEach((col) => doc.text(col.label, col.x, 36, { width: col.w }));
      rowY = 64;
    };

    invoice.services.forEach((item, index) => {
      doc.font("Helvetica").fontSize(9).fillColor("#0f172a");
      const nameHeight = doc.heightOfString(item.name || "-", { width: columns[1].w });
      const descHeight = doc.heightOfString(item.description || "", { width: columns[2].w, lineGap: 3 });
      const qtyHeight = doc.heightOfString(String(item.quantity || 0), { width: columns[3].w, align: "right" });
      const rateHeight = doc.heightOfString(formatCurrency(item.unitPrice), { width: columns[4].w, align: "right" });
      const amountHeight = doc.heightOfString(formatCurrency(item.total), { width: columns[5].w, align: "right" });
      const rowHeight = Math.max(defaultRowHeight, nameHeight, descHeight, qtyHeight, rateHeight, amountHeight) + 8;

      if (rowY + rowHeight > pageBottom) {
        doc.addPage();
        drawServiceTableHeader();
      }

      doc.font("Helvetica").fontSize(9).fillColor("#0f172a");
      doc.text(String(index + 1), columns[0].x, rowY, { width: columns[0].w });
      doc.font("Helvetica-Bold").text(item.name || "-", columns[1].x, rowY, { width: columns[1].w });
      doc.font("Helvetica").fillColor("#475569").text(item.description || "", columns[2].x, rowY, { width: columns[2].w, lineGap: 3 });
      doc.fillColor("#0f172a").text(String(item.quantity || 0), columns[3].x, rowY, { width: columns[3].w, align: "right" });
      doc.text(formatCurrency(item.unitPrice), columns[4].x, rowY, { width: columns[4].w, align: "right" });
      doc.font("Helvetica-Bold").text(formatCurrency(item.total), columns[5].x, rowY, { width: columns[5].w, align: "right" });
      doc.strokeColor("#e2e8f0").lineWidth(0.5).moveTo(left, rowY + rowHeight - 6).lineTo(pageWidth - left, rowY + rowHeight - 6).stroke();
      rowY += rowHeight;
    });

    let summaryTop = rowY + 12;
    doc.font("Helvetica").fontSize(8);
    const totalTermsTextHeight = invoice.terms.reduce((sum, term, index) => {
      const height = doc.heightOfString(`${index + 1}. ${String(term)}`, {
        width: contentWidth - 240,
        lineGap: 3,
      });
      return sum + height + 6;
    }, 0);
    const summaryHeight = 112;
    const termsBoxHeight = Math.max(totalTermsTextHeight + 32, 110);
    const footerGap = 10;
    const totalFooterBlockHeight = summaryHeight + 12 + termsBoxHeight + footerGap + 92 + 28;
    if (summaryTop + totalFooterBlockHeight > pageBottom) {
      doc.addPage();
      summaryTop = 56;
    }

    const summaryX = pageWidth - 220;
    const summary = [
      ["Subtotal", formatCurrency(invoice.totals.subtotal)],
      [`Discount (${invoice.totals.discountPercent || 0}%)`, `- ${formatCurrency(invoice.totals.discountAmount)}`],
      [`GST (${invoice.totals.gstPercent || 0}%)`, formatCurrency(invoice.totals.gstAmount)],
      ["Round Off", formatCurrency(invoice.totals.roundOff)],
      ["Grand Total", formatCurrency(invoice.totals.roundedTotal)],
    ];

    doc.roundedRect(summaryX - 12, summaryTop - 8, 200, summaryHeight, 6).fillAndStroke("#f8fafc", "#e2e8f0");
    summary.forEach(([label, value], index) => {
      const y = summaryTop + index * 18;
      doc.font(index === summary.length - 1 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(index === summary.length - 1 ? 11 : 9)
        .fillColor("#0f172a")
        .text(label, summaryX, y, { width: 90 });
      doc.text(value, summaryX + 95, y, { width: 90, align: "right" });
    });

    doc.font("Helvetica").fontSize(8).fillColor("#64748b")
      .text(`Amount in words: ${invoice.totals.amountInWords || ""}`, summaryX, summaryTop + 102, { width: 200, align: "right" });

    const termsTop = summaryTop + summaryHeight + 12;
    doc.roundedRect(left, termsTop, contentWidth - 220, termsBoxHeight, 6).fillAndStroke("#f8fafc", "#e2e8f0");
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f172a")
      .text("Terms & Conditions", left + 12, termsTop + 12, { width: contentWidth - 240 });

    let termY = termsTop + 30;
    invoice.terms.forEach((term, index) => {
      doc.font("Helvetica").fontSize(8).fillColor("#475569");
      doc.text(`${index + 1}. ${String(term)}`, left + 12, termY, { width: contentWidth - 240, lineGap: 3 });
      termY = doc.y + 6;
    });

    let actualFooterY = Math.max(termY + footerGap, termsTop + termsBoxHeight + footerGap);
    if (actualFooterY + 110 > pageBottom) {
      doc.addPage();
      actualFooterY = 56;
    }

    doc.roundedRect(left, actualFooterY, 250, 92, 6).fillAndStroke("#f8fafc", "#e2e8f0");
    doc.image(qrBuffer, 44, actualFooterY + 8, { width: 72, height: 72 });
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#0f172a")
      .text("Scan to Verify Invoice", 126, actualFooterY + 14, { width: 150 })
      .font("Helvetica").fontSize(8).fillColor("#475569")
      .text("Anyone can scan anytime to verify this invoice online. No expiry or view limit.", 126, actualFooterY + 28, { width: 150 })
      .fontSize(6.5).fillColor("#64748b")
      .text(String(verifyUrl).slice(0, 70), 126, actualFooterY + 58, { width: 150 });

    const signatureX = pageWidth - 190;
    if (signaturePath) {
      try {
        doc.image(signaturePath, signatureX, actualFooterY + 4, { fit: [130, 52], align: "right" });
      } catch (error) {
        console.warn("Invoice signature image could not be embedded:", error);
      }
    }

    doc.moveTo(signatureX, actualFooterY + 62).lineTo(pageWidth - left, actualFooterY + 62).strokeColor("#94a3b8").stroke();
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#0f172a")
      .text("Authorized Signature", signatureX, actualFooterY + 68, { width: 154, align: "right" })
      .font("Helvetica").fontSize(8).fillColor("#64748b")
      .text(invoice.company.name, signatureX, actualFooterY + 80, { width: 154, align: "right" });

    const bottomNoteY = doc.page.height - 20;
    doc.font("Helvetica").fontSize(7).fillColor("#94a3b8")
      .text("This is a computer-generated invoice. Scan the QR code to verify authenticity online.", left, bottomNoteY - 6, {
        width: contentWidth,
        align: "center",
      });

    doc.end();
  });

  return pdfBuffer;
}
