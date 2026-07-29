import type { Timestamp } from "firebase/firestore";

export type InvoiceStatus = "Pending" | "Paid" | "Cancelled" | "Overdue" | "Partial";

export interface InvoiceServiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber?: string;
  companyName?: string;
}

export interface InvoiceCompany {
  logoUrl: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  website: string;
  signatureUrl: string;
}

export interface InvoiceTotals {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  gstPercent: number;
  gstAmount: number;
  grandTotal: number;
  roundOff: number;
  roundedTotal: number;
  amountInWords: string;
}

export interface InvoiceTimelineEvent {
  label: string;
  at: Date | Timestamp | string;
  note?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  verificationToken: string;
  customer: InvoiceCustomer;
  company: InvoiceCompany;
  services: InvoiceServiceItem[];
  totals: InvoiceTotals;
  terms: string[];
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  emailSent?: boolean;
  emailSentAt?: Timestamp;
  deliveryStatus?: "Not Sent" | "Sent" | "Failed";
  emailError?: string;
  timeline: InvoiceTimelineEvent[];
}

export const DEFAULT_COMPANY: InvoiceCompany = {
  logoUrl: "/sa-logo.svg",
  name: "Singh Automobiles Engine Engineering",
  address: "India",
  phone: "+91 9905804791",
  email: "amitsingh6061.innet@gmail.com",
  gstNumber: "",
  website: typeof window === "undefined" ? "https://amit-singh-sepia.vercel.app" : window.location.origin,
  signatureUrl: "/assets/authorized-signature.png",
};

export const INVOICE_STATUSES: InvoiceStatus[] = ["Pending", "Paid", "Partial", "Overdue", "Cancelled"];

export function createVerificationToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value?: string | Date | Timestamp) {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : "toDate" in value ? value.toDate() : value;
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function makeService(): InvoiceServiceItem {
  return {
    id: createVerificationToken().slice(0, 10),
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    total: 0,
  };
}

export function calculateTotals(
  services: InvoiceServiceItem[],
  discountPercent: number,
  gstPercent: number,
): InvoiceTotals {
  const subtotal = services.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = subtotal * (Math.max(0, discountPercent) / 100);
  const taxable = Math.max(0, subtotal - discountAmount);
  const gstAmount = taxable * (Math.max(0, gstPercent) / 100);
  const grandTotal = taxable + gstAmount;
  const roundedTotal = Math.round(grandTotal);
  const roundOff = roundedTotal - grandTotal;

  return {
    subtotal,
    discountPercent,
    discountAmount,
    gstPercent,
    gstAmount,
    grandTotal,
    roundOff,
    roundedTotal,
    amountInWords: `${numberToIndianWords(roundedTotal)} rupees only`,
  };
}

function numberToIndianWords(amount: number) {
  if (!amount) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (n: number) => (n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""}`);
  const three = (n: number) => `${n > 99 ? `${ones[Math.floor(n / 100)]} Hundred ` : ""}${two(n % 100)}`.trim();
  const crore = Math.floor(amount / 10000000);
  const lakh = Math.floor((amount / 100000) % 100);
  const thousand = Math.floor((amount / 1000) % 100);
  const rest = amount % 1000;
  return [
    crore ? `${two(crore)} Crore` : "",
    lakh ? `${two(lakh)} Lakh` : "",
    thousand ? `${two(thousand)} Thousand` : "",
    rest ? three(rest) : "",
  ].filter(Boolean).join(" ");
}

export function buildBusinessTerms() {
  return [
    "Service charges cover diagnostics, repair labour, calibration, and machinery support performed by Singh Automobiles Engine Engineering.",
    "Parts, consumables, travel, and on-site assistance are billed as listed in the invoice or as approved during the service workflow.",
    "Payment is due by the invoice due date. Work marked Pending, Partial, or Overdue remains payable until the account is settled.",
    "Warranty support applies to workmanship for the serviced system only and excludes unrelated faults, misuse, contaminated fuel/oil, electrical shorting, overheating, or third-party repairs.",
    "Customer approval is required before major engine, hydraulic, ECU, wiring harness, alternator, or self-starter replacement work proceeds.",
    "Completed machinery is considered delivered after handover, site completion confirmation, or customer acceptance of the repair report.",
    "GST, where applicable, is calculated on taxable service value after discount and before round-off.",
  ];
}

export function makeInvoiceNumber(existingCount: number) {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `INV-${stamp}-${String(existingCount + 1).padStart(3, "0")}`;
}

export const PUBLIC_SITE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_PUBLIC_SITE_URL) ||
  (typeof window !== "undefined" ? window.location.origin : "https://amit-singh-sepia.vercel.app");

export function verificationUrl(token: string, origin = PUBLIC_SITE_URL) {
  return `${origin.replace(/\/$/, "")}/verify?token=${encodeURIComponent(token)}`;
}

export function statusStyles(status: InvoiceStatus) {
  switch (status) {
    case "Paid":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Partial":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "Overdue":
      return "bg-red-100 text-red-800 border-red-200";
    case "Cancelled":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-amber-100 text-amber-900 border-amber-200";
  }
}
