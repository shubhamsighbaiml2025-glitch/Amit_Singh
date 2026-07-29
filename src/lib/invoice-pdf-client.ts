type DownloadInvoicePdfParams = {
  filename: string;
  token?: string;
  invoiceId?: string;
};

export async function downloadInvoicePdf({ filename, token, invoiceId }: DownloadInvoicePdfParams) {
  if (!token && !invoiceId) {
    throw new Error("Invoice verification token or id is required.");
  }

  const query = token
    ? `token=${encodeURIComponent(token)}`
    : `invoiceId=${encodeURIComponent(String(invoiceId))}`;

  const response = await fetch(`/api/invoice-pdf?${query}`);
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Failed to download PDF");
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new Error("Downloaded PDF is empty. Please try again.");
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
