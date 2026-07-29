import type { Invoice } from "@/lib/invoice-utils";
import { formatCurrency, formatDate, qrImageUrl, verificationUrl } from "@/lib/invoice-utils";

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  return (
    <div className="bg-white text-slate-950 p-6 sm:p-8 rounded-sm border border-border print:border-0 print:rounded-none print:p-0">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-slate-200 pb-6">
        <div className="flex gap-4">
          <img src={invoice.company.logoUrl || "/sa-logo.svg"} alt={invoice.company.name} className="h-16 w-16 object-contain" />
          <div>
            <h2 className="text-2xl font-bold">{invoice.company.name}</h2>
            <p className="text-sm text-slate-600 max-w-md">{invoice.company.address}</p>
            <p className="text-sm text-slate-600">{invoice.company.phone} | {invoice.company.email}</p>
            {invoice.company.gstNumber ? <p className="text-sm text-slate-600">GST: {invoice.company.gstNumber}</p> : null}
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-3xl font-bold tracking-tight">INVOICE</div>
          <div className="font-mono text-sm text-slate-600">{invoice.invoiceNumber}</div>
          <div className="mt-2 inline-flex rounded-sm bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">{invoice.status}</div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3 py-6 border-b border-slate-200">
        <div className="sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Bill To</p>
          <h3 className="mt-2 text-xl font-bold">{invoice.customer.companyName || invoice.customer.name}</h3>
          {invoice.customer.companyName ? <p className="text-sm text-slate-700">{invoice.customer.name}</p> : null}
          <p className="text-sm text-slate-700">{invoice.customer.phone} | {invoice.customer.email}</p>
          <p className="text-sm text-slate-700">{invoice.customer.address}</p>
          {invoice.customer.gstNumber ? <p className="text-sm text-slate-700">GST: {invoice.customer.gstNumber}</p> : null}
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4"><span className="text-slate-500">Invoice Date</span><strong>{formatDate(invoice.invoiceDate)}</strong></div>
          <div className="flex justify-between gap-4"><span className="text-slate-500">Due Date</span><strong>{formatDate(invoice.dueDate)}</strong></div>
          <div className="flex justify-between gap-4"><span className="text-slate-500">Verify</span><strong>QR / Token</strong></div>
        </div>
      </div>

      <div className="overflow-x-auto py-6">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="bg-slate-950 text-white">
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3 text-right">Unit Price</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.services.map((item) => (
              <tr key={item.id} className="border-b border-slate-200">
                <td className="p-3 font-semibold">{item.name}</td>
                <td className="p-3 text-slate-600">{item.description}</td>
                <td className="p-3 text-right">{item.quantity}</td>
                <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="p-3 text-right font-semibold">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 border-t border-slate-200 pt-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Terms & Conditions</p>
          <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs leading-relaxed text-slate-600">
            {invoice.terms.map((term) => <li key={term}>{term}</li>)}
          </ol>
        </div>
        <div>
          <div className="ml-auto max-w-sm space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(invoice.totals.subtotal)}</strong></div>
            <div className="flex justify-between"><span>Discount ({invoice.totals.discountPercent}%)</span><strong>- {formatCurrency(invoice.totals.discountAmount)}</strong></div>
            <div className="flex justify-between"><span>GST ({invoice.totals.gstPercent}%)</span><strong>{formatCurrency(invoice.totals.gstAmount)}</strong></div>
            <div className="flex justify-between"><span>Round Off</span><strong>{formatCurrency(invoice.totals.roundOff)}</strong></div>
            <div className="flex justify-between border-t border-slate-300 pt-3 text-xl"><span>Grand Total</span><strong>{formatCurrency(invoice.totals.roundedTotal)}</strong></div>
            <p className="text-xs capitalize text-slate-600">{invoice.totals.amountInWords}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 sm:items-end">
        <div className="flex items-center gap-4">
          <img src={qrImageUrl(invoice.verificationToken)} alt="Invoice verification QR code" className="h-28 w-28" />
          <div className="text-xs text-slate-600">
            <p className="font-bold text-slate-950">Secure Verification</p>
            <p className="break-all">{verificationUrl(invoice.verificationToken)}</p>
          </div>
        </div>
        <div className="text-right">
          {invoice.company.signatureUrl ? (
            <img src={invoice.company.signatureUrl} alt="Authorized signature" className="ml-auto h-16 max-w-48 object-contain" />
          ) : <div className="ml-auto h-16" />}
          <div className="mt-2 border-t border-slate-400 pt-2 text-sm font-bold">Authorized Signature</div>
        </div>
      </div>
    </div>
  );
}
