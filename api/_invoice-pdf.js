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

function rect(x, y, w, h) {
  return `${x} ${y} ${w} ${h} re S\n`;
}

export function generateInvoicePdf(invoice, verifyUrl) {
  const chunks = [];
  let y = 790;

  chunks.push("0.95 0.95 0.95 rg 0 0 595 842 re f\n0 0 0 RG\n");
  chunks.push(bold(invoice.company?.name || "Singh Automobiles Engine Engineering", 40, y, 18));
  y -= 18;
  chunks.push(line(invoice.company?.address || "India", 40, y, 9));
  y -= 14;
  chunks.push(line(`${invoice.company?.phone || ""} | ${invoice.company?.email || ""}`, 40, y, 9));
  y -= 28;

  chunks.push(bold("TAX INVOICE", 420, 790, 20));
  chunks.push(line(invoice.invoiceNumber, 420, 770, 10));
  chunks.push(line(`Status: ${invoice.status}`, 420, 754, 10));

  chunks.push(rect(40, 650, 515, 78));
  chunks.push(bold("Bill To", 54, 708, 11));
  chunks.push(bold(invoice.customer?.companyName || invoice.customer?.name || "", 54, 690, 13));
  chunks.push(line(invoice.customer?.companyName ? invoice.customer?.name : "", 54, 674, 9));
  chunks.push(line(`${invoice.customer?.phone || ""} | ${invoice.customer?.email || ""}`, 54, 660, 9));
  chunks.push(line(`Invoice Date: ${invoice.invoiceDate || ""}`, 390, 704, 9));
  chunks.push(line(`Due Date: ${invoice.dueDate || ""}`, 390, 688, 9));
  chunks.push(line(`GST: ${invoice.customer?.gstNumber || "Not provided"}`, 390, 672, 9));

  y = 620;
  chunks.push(bold("Service", 44, y, 10));
  chunks.push(bold("Description", 172, y, 10));
  chunks.push(bold("Qty", 372, y, 10));
  chunks.push(bold("Unit", 420, y, 10));
  chunks.push(bold("Total", 492, y, 10));
  y -= 10;
  chunks.push("40 606 515 1 re f\n");

  (invoice.services || []).slice(0, 12).forEach((item) => {
    y -= 18;
    chunks.push(line(item.name || "", 44, y, 9));
    chunks.push(line(item.description || "", 172, y, 8));
    chunks.push(line(String(item.quantity || 0), 378, y, 9));
    chunks.push(line(money(item.unitPrice), 414, y, 9));
    chunks.push(line(money(item.total), 484, y, 9));
  });

  y -= 34;
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

  chunks.push(line(`Amount in words: ${invoice.totals?.amountInWords || ""}`, 40, 230, 9));
  chunks.push(bold("Terms & Conditions", 40, 204, 11));
  let termY = 188;
  (invoice.terms || []).slice(0, 7).forEach((term, index) => {
    chunks.push(line(`${index + 1}. ${term}`, 48, termY, 7));
    termY -= 12;
  });

  chunks.push(bold("Verification Link", 40, 70, 9));
  chunks.push(line(verifyUrl, 40, 56, 8));
  chunks.push(bold("Authorized Signature", 410, 70, 10));

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
