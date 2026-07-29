import QRCode from "qrcode";

/** Draw a QR code into a raw PDF content stream using filled rectangles. */
export function drawQrInPdf(chunks, data, x, y, size) {
  const qr = QRCode.create(String(data), { errorCorrectionLevel: "M" });
  const modules = qr.modules;
  const count = modules.size;
  const cell = size / count;

  chunks.push("0 0 0 rg\n");

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (modules.get(row, col)) {
        const px = x + col * cell;
        const py = y + size - (row + 1) * cell;
        chunks.push(`${px.toFixed(2)} ${py.toFixed(2)} ${cell.toFixed(2)} ${cell.toFixed(2)} re f\n`);
      }
    }
  }
}
