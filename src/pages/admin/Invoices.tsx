import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Download, Edit, Eye, Mail, Plus, Printer, Search, Send, Trash2 } from "lucide-react";
import { useInvoices, useInvoiceActions } from "@/hooks/use-invoices";
import {
  DEFAULT_COMPANY,
  INVOICE_STATUSES,
  Invoice,
  InvoiceServiceItem,
  calculateTotals,
  buildBusinessTerms,
  createVerificationToken,
  formatCurrency,
  makeInvoiceNumber,
  makeService,
  verificationUrl,
} from "@/lib/invoice-utils";

const today = () => new Date().toISOString().slice(0, 10);
const due = () => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

function blankInvoice(count: number): Omit<Invoice, "id"> {
  const services = [{ ...makeService(), name: "Heavy machinery diagnostics", description: "Electrical, engine, hydraulic or fleet service support.", quantity: 1 }];
  return {
    invoiceNumber: makeInvoiceNumber(count),
    verificationToken: createVerificationToken(),
    customer: { name: "", phone: "", email: "", address: "", gstNumber: "", companyName: "" },
    company: DEFAULT_COMPANY,
    services: services.map((s) => ({ ...s, total: s.quantity * s.unitPrice })),
    totals: calculateTotals(services, 0, 18),
    terms: buildBusinessTerms(),
    status: "Pending",
    invoiceDate: today(),
    dueDate: due(),
    timeline: [{ label: "Invoice Created", at: new Date().toISOString(), note: "Draft prepared by admin." }],
  };
}

export default function AdminInvoices() {
  const { invoices, loading, refetch } = useInvoices();
  const actions = useInvoiceActions(refetch);
  const [draft, setDraft] = useState<Omit<Invoice, "id">>(() => blankInvoice(0));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const filtered = useMemo(() => invoices.filter((invoice) => {
    const haystack = [
      invoice.invoiceNumber,
      invoice.customer.name,
      invoice.customer.phone,
      invoice.customer.email,
      invoice.customer.companyName,
    ].join(" ").toLowerCase();
    return haystack.includes(query.toLowerCase())
      && (status === "All" || invoice.status === status)
      && (!date || invoice.invoiceDate === date);
  }), [date, invoices, query, status]);

  const updateServices = (services: InvoiceServiceItem[]) => {
    const normalized = services.map((item) => ({ ...item, total: Number(item.quantity || 0) * Number(item.unitPrice || 0) }));
    setDraft((prev) => ({ ...prev, services: normalized, totals: calculateTotals(normalized, prev.totals.discountPercent, prev.totals.gstPercent) }));
  };

  const setDiscount = (value: number) => setDraft((prev) => ({ ...prev, totals: calculateTotals(prev.services, value, prev.totals.gstPercent) }));
  const setGst = (value: number) => setDraft((prev) => ({ ...prev, totals: calculateTotals(prev.services, prev.totals.discountPercent, value) }));

  const validate = () => {
    const phoneDigits = draft.customer.phone.replace(/\D/g, "");
    if (!draft.customer.name || !draft.customer.phone || !draft.customer.email || !draft.customer.address) return "Customer name, phone, email, and address are required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.customer.email)) return "Enter a valid customer email.";
    if (phoneDigits.length !== 10) return "Phone number must contain exactly 10 digits.";
    if (draft.services.some((s) => !s.name || s.quantity <= 0 || s.unitPrice < 0)) return "Each service needs a name, positive quantity, and valid unit price.";
    if (invoices.some((i) => i.invoiceNumber === draft.invoiceNumber && i.id !== editingId)) return "Invoice number already exists.";
    return "";
  };

  const save = async () => {
    const issue = validate();
    if (issue) { toast.error(issue); return; }
    setSaving(true);
    try {
      const payload = {
        ...draft,
        customer: { ...draft.customer, phone: draft.customer.phone.replace(/\D/g, "") },
        timeline: [...draft.timeline, { label: editingId ? "Invoice Edited" : "Invoice Created", at: new Date().toISOString() }],
      };
      if (editingId) await actions.update(editingId, payload);
      else await actions.create(payload);
      toast.success(editingId ? "Invoice updated" : "Invoice created");
      setDraft(blankInvoice(invoices.length + 1));
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const edit = (invoice: Invoice) => {
    setEditingId(invoice.id);
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = invoice;
    setDraft(rest);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const duplicate = (invoice: Invoice) => {
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = invoice;
    setEditingId(null);
    setDraft({ ...rest, invoiceNumber: makeInvoiceNumber(invoices.length), verificationToken: createVerificationToken(), status: "Pending", invoiceDate: today(), dueDate: due() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const printInvoice = (invoice: Invoice) => {
    setSelected(invoice);
    setTimeout(() => window.print(), 100);
  };

  const sendEmail = async (invoice: Invoice) => {
    setSendingId(invoice.id);
    try {
      const response = await fetch("/api/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Failed to send invoice");
      toast.success(`Invoice emailed to ${invoice.customer.email}`);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "SMTP invoice email failed");
      await refetch();
    } finally {
      setSendingId(null);
    }
  };

  const sendWhatsApp = (invoice: Invoice) => {
    const text = encodeURIComponent(`Singh Automobiles Invoice ${invoice.invoiceNumber}\nAmount: ${formatCurrency(invoice.totals.roundedTotal)}\nVerify/download: ${verificationUrl(invoice.verificationToken)}`);
    window.open(`https://wa.me/91${invoice.customer.phone.replace(/\D/g, "")}?text=${text}`, "_blank");
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
            <p className="text-muted-foreground">Create verified service invoices for heavy machinery diagnostics, repairs, and support.</p>
          </div>
          <Button onClick={() => { setEditingId(null); setDraft(blankInvoice(invoices.length)); }} variant="outline"><Plus className="mr-2 h-4 w-4" />New Invoice</Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6 rounded-sm border border-border bg-card p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Input value={draft.invoiceNumber} onChange={(e) => setDraft({ ...draft, invoiceNumber: e.target.value })} />
              <Input type="date" value={draft.invoiceDate} onChange={(e) => setDraft({ ...draft, invoiceDate: e.target.value })} />
              <Input type="date" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Customer name *" value={draft.customer.name} onChange={(e) => setDraft({ ...draft, customer: { ...draft.customer, name: e.target.value } })} />
              <Input placeholder="Company name" value={draft.customer.companyName} onChange={(e) => setDraft({ ...draft, customer: { ...draft.customer, companyName: e.target.value } })} />
              <Input placeholder="10 digit phone *" value={draft.customer.phone} onChange={(e) => setDraft({ ...draft, customer: { ...draft.customer, phone: e.target.value } })} />
              <Input type="email" placeholder="Customer email *" value={draft.customer.email} onChange={(e) => setDraft({ ...draft, customer: { ...draft.customer, email: e.target.value } })} />
              <Input placeholder="GST number optional" value={draft.customer.gstNumber} onChange={(e) => setDraft({ ...draft, customer: { ...draft.customer, gstNumber: e.target.value.toUpperCase() } })} />
              <select className="h-10 rounded-sm border border-input bg-background px-3 text-sm" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Invoice["status"] })}>
                {INVOICE_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <Textarea className="md:col-span-2" placeholder="Customer address *" value={draft.customer.address} onChange={(e) => setDraft({ ...draft, customer: { ...draft.customer, address: e.target.value } })} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Service Rows</h2>
                <Button size="sm" variant="outline" onClick={() => updateServices([...draft.services, makeService()])}><Plus className="mr-2 h-4 w-4" />Add Service</Button>
              </div>
              {draft.services.map((item, index) => (
                <div key={item.id} className="grid gap-3 rounded-sm border border-border bg-background p-3 md:grid-cols-[1fr_1.2fr_80px_120px_44px]">
                  <Input placeholder="Service name" value={item.name} onChange={(e) => updateServices(draft.services.map((s, i) => i === index ? { ...s, name: e.target.value } : s))} />
                  <Input placeholder="Description" value={item.description} onChange={(e) => updateServices(draft.services.map((s, i) => i === index ? { ...s, description: e.target.value } : s))} />
                  <Input type="number" min="1" value={item.quantity} onChange={(e) => updateServices(draft.services.map((s, i) => i === index ? { ...s, quantity: Number(e.target.value) } : s))} />
                  <Input type="number" min="0" value={item.unitPrice} onChange={(e) => updateServices(draft.services.map((s, i) => i === index ? { ...s, unitPrice: Number(e.target.value) } : s))} />
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => updateServices(draft.services.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input type="number" min="0" max="100" placeholder="Discount %" value={draft.totals.discountPercent} onChange={(e) => setDiscount(Number(e.target.value))} />
              <Input type="number" min="0" max="28" placeholder="GST %" value={draft.totals.gstPercent} onChange={(e) => setGst(Number(e.target.value))} />
            </div>
            <Button onClick={save} disabled={saving} className="w-full sm:w-auto">{saving ? "Saving..." : editingId ? "Update Invoice" : "Create Invoice"}</Button>
          </div>

          <div className="rounded-sm border border-border bg-card p-4">
            <h2 className="mb-4 font-bold">Live Totals</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(draft.totals.subtotal)}</strong></div>
              <div className="flex justify-between"><span>Discount</span><strong>{formatCurrency(draft.totals.discountAmount)}</strong></div>
              <div className="flex justify-between"><span>GST</span><strong>{formatCurrency(draft.totals.gstAmount)}</strong></div>
              <div className="flex justify-between"><span>Round Off</span><strong>{formatCurrency(draft.totals.roundOff)}</strong></div>
              <div className="flex justify-between border-t border-border pt-3 text-xl"><span>Total</span><strong className="text-primary">{formatCurrency(draft.totals.roundedTotal)}</strong></div>
              <p className="text-xs capitalize text-muted-foreground">{draft.totals.amountInWords}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-sm border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search invoice, customer, phone, email" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            <select className="h-10 rounded-sm border border-input bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option>{INVOICE_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-3">Invoice</th><th>Customer</th><th>Status</th><th>Total</th><th>Due</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td className="py-6" colSpan={6}>Loading invoices...</td></tr> : filtered.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-border">
                    <td className="py-3 font-mono">{invoice.invoiceNumber}</td>
                    <td>{invoice.customer.name}<div className="text-xs text-muted-foreground">{invoice.customer.phone}</div></td>
                    <td>
                      {invoice.status}
                      <div className="text-xs text-muted-foreground">{invoice.deliveryStatus || "Not Sent"}</div>
                    </td>
                    <td>{formatCurrency(invoice.totals.roundedTotal)}</td>
                    <td>{invoice.dueDate}</td>
                    <td className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => setSelected(invoice)}><Eye className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => edit(invoice)}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => duplicate(invoice)}><Copy className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => printInvoice(invoice)}><Printer className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" disabled={sendingId === invoice.id} onClick={() => sendEmail(invoice)}>
                        <Mail className={`h-4 w-4 ${sendingId === invoice.id ? "animate-pulse" : ""}`} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => sendWhatsApp(invoice)}><Send className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => window.open(verificationUrl(invoice.verificationToken), "_blank")}><Download className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={async () => { await actions.remove(invoice.id); toast.success("Invoice deleted"); }}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected ? (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-background/90 p-4 print:static print:bg-white print:p-0">
            <div className="mx-auto max-w-5xl print:max-w-none">
              <div className="mb-4 flex justify-end gap-2 print:hidden">
                <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print / Save PDF</Button>
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              </div>
              <InvoiceDocument invoice={selected} />
            </div>
          </div>
        ) : null}
      </AdminLayout>
    </AuthGuard>
  );
}
