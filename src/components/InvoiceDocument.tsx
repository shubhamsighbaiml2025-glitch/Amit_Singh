import type { Invoice } from "@/lib/invoice-utils";
import { DEFAULT_COMPANY, formatCurrency, formatDate, statusStyles } from "@/lib/invoice-utils";

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const company = {
    ...DEFAULT_COMPANY,
    ...(invoice.company || {}),
  };
  const signatureSrc = company.signatureUrl || "/assets/authorized-signature.png";
  const showSignature = Boolean(signatureSrc && signatureSrc.trim());

  return (
    <article className="invoice-document mx-auto max-w-[820px] bg-white text-slate-950 shadow-sm print:max-w-none print:shadow-none">
      {/* Accent header bar */}
      <div className="h-1.5 bg-[#f5b800] print:bg-[#f5b800]" />

      <div className="border border-slate-200 p-6 sm:p-8 print:border-0 print:p-0">
        {/* Header */}
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <img
              src={company.logoUrl || "/sa-logo.svg"}
              alt={company.name}
              className="h-16 w-16 shrink-0 object-contain"
            />
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{company.name}</h2>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-600">{company.address}</p>
              <p className="mt-1 text-sm text-slate-600">
                {company.phone} · {company.email}
              </p>
              {company.gstNumber ? (
                <p className="text-sm text-slate-600">GSTIN: {company.gstNumber}</p>
              ) : null}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tax Invoice</p>
            <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">INVOICE</p>
            <p className="mt-1 font-mono text-sm text-slate-600">{invoice.invoiceNumber}</p>
            <span className={`mt-3 inline-flex rounded-sm border px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusStyles(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
        </header>

        {/* Bill To + Dates */}
        <section className="grid gap-6 border-b border-slate-200 py-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Bill To</p>
            <h3 className="mt-2 text-lg font-bold sm:text-xl">
              {invoice.customer.companyName || invoice.customer.name}
            </h3>
            {invoice.customer.companyName ? (
              <p className="text-sm text-slate-700">{invoice.customer.name}</p>
            ) : null}
            <p className="mt-1 text-sm text-slate-700">
              {invoice.customer.phone} · {invoice.customer.email}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{invoice.customer.address}</p>
            {invoice.customer.gstNumber ? (
              <p className="mt-1 text-sm text-slate-700">GSTIN: {invoice.customer.gstNumber}</p>
            ) : null}
          </div>

          <div className="rounded-sm border border-slate-200 bg-slate-50 p-4 text-sm print:bg-white">
            <dl className="space-y-2">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Invoice Date</dt>
                <dd className="font-semibold">{formatDate(invoice.invoiceDate)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Due Date</dt>
                <dd className="font-semibold">{formatDate(invoice.dueDate)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
                <dt className="text-slate-500">Amount Due</dt>
                <dd className="font-bold text-slate-950">{formatCurrency(invoice.totals.roundedTotal)}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Services table */}
        <section className="overflow-x-auto py-6">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="bg-slate-950 text-white">
                <th className="p-3 text-left font-semibold">#</th>
                <th className="p-3 text-left font-semibold">Service</th>
                <th className="p-3 text-left font-semibold">Description</th>
                <th className="p-3 text-right font-semibold">Qty</th>
                <th className="p-3 text-right font-semibold">Rate</th>
                <th className="p-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.services.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-200">
                  <td className="p-3 text-slate-500">{index + 1}</td>
                  <td className="p-3 font-semibold">{item.name}</td>
                  <td className="p-3 text-slate-600">{item.description}</td>
                  <td className="p-3 text-right">{item.quantity}</td>
                  <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-3 text-right font-semibold">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals + Terms */}
        <section className="grid gap-8 border-t border-slate-200 pt-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Terms & Conditions</p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-slate-600">
              {invoice.terms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ol>
          </div>

          <div className="ml-auto w-full max-w-sm">
            <div className="space-y-2 rounded-sm border border-slate-200 bg-slate-50 p-4 text-sm print:bg-white">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <strong>{formatCurrency(invoice.totals.subtotal)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Discount ({invoice.totals.discountPercent}%)</span>
                <strong>- {formatCurrency(invoice.totals.discountAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">GST ({invoice.totals.gstPercent}%)</span>
                <strong>{formatCurrency(invoice.totals.gstAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Round Off</span>
                <strong>{formatCurrency(invoice.totals.roundOff)}</strong>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-3 text-lg font-bold">
                <span>Grand Total</span>
                <span className="text-slate-950">{formatCurrency(invoice.totals.roundedTotal)}</span>
              </div>
              <p className="border-t border-slate-200 pt-2 text-xs capitalize text-slate-600">
                {invoice.totals.amountInWords}
              </p>
            </div>
          </div>
        </section>

        {/* Signature */}
        <footer className="mt-8 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2 sm:items-end">
          <div className="rounded-sm border border-slate-200 bg-slate-50 p-4 print:bg-white">
            <p className="text-sm font-bold text-slate-950">Invoice details</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              This invoice is prepared for the listed service work and can be downloaded directly from the billing section.
            </p>
          </div>

          <div className="text-right">
            {showSignature ? (
              <img
                src={signatureSrc}
                alt="Authorized signature"
                className="ml-auto h-20 max-w-56 object-contain"
              />
            ) : (
              <div className="ml-auto flex h-20 w-56 items-center justify-center rounded-sm border border-dashed border-slate-300 text-xs text-slate-500">
                Signature preview unavailable
              </div>
            )}
            <div className="mt-2 border-t border-slate-400 pt-2 text-sm font-bold">Authorized Signature</div>
            <p className="mt-1 text-xs text-slate-500">{company.name}</p>
          </div>
        </footer>

        <p className="mt-6 text-center text-[10px] text-slate-400 print:mt-4">
          This is a computer-generated invoice. Please retain this document for your records.
        </p>
      </div>
    </article>
  );
}
