import { Layout } from "@/components/Layout";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { useInvoiceByToken } from "@/hooks/use-invoices";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadInvoicePdf } from "@/lib/invoice-pdf-client";

export default function VerifyInvoice() {
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const { invoice, loading, error } = useInvoiceByToken(token);

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    try {
      await downloadInvoicePdf({
        token: invoice.verificationToken,
        filename: `${invoice.invoiceNumber}.pdf`,
      });
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to download PDF");
    }
  };

  return (
    <Layout>
      <div className="print:hidden bg-card border-b border-border pt-32 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Invoice</h1>
          <p className="text-muted-foreground max-w-2xl">
            Open this page to view the bill and download the PDF directly.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 print:max-w-none print:p-0">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : invoice ? (
          <div className="space-y-6 print:space-y-0">
            <div className="print:hidden flex flex-col gap-3 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-emerald-500">Invoice Ready</h2>
                <p className="text-sm text-muted-foreground">
                  {invoice.invoiceNumber} is ready to view or download.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleDownloadPdf}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
            <InvoiceDocument invoice={invoice} />
          </div>
        ) : (
          <div className="rounded-sm border border-destructive/40 bg-destructive/10 p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h2 className="text-2xl font-bold text-destructive">Invoice Not Found</h2>
            <p className="mt-2 text-muted-foreground">{error || "No invoice was found for this link."}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
