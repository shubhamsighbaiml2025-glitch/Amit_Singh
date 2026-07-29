import { Layout } from "@/components/Layout";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { useInvoiceByToken } from "@/hooks/use-invoices";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2, Printer } from "lucide-react";

export default function VerifyInvoice() {
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const { invoice, loading, error } = useInvoiceByToken(token);

  return (
    <Layout>
      <div className="bg-card border-b border-border pt-32 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Invoice Verification</h1>
          <p className="text-muted-foreground max-w-2xl">Secure invoice verification for Singh Automobiles Engine Engineering customers.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : invoice ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <div>
                  <h2 className="font-bold text-emerald-500">Verified Invoice</h2>
                  <p className="text-sm text-muted-foreground">{invoice.invoiceNumber} is a valid Singh Automobiles invoice.</p>
                </div>
              </div>
              <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print / Save PDF</Button>
            </div>
            <InvoiceDocument invoice={invoice} />
          </div>
        ) : (
          <div className="rounded-sm border border-destructive/40 bg-destructive/10 p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h2 className="text-2xl font-bold text-destructive">Invalid Invoice</h2>
            <p className="mt-2 text-muted-foreground">{error || "No invoice was found for this verification token."}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
