import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { useEnquiries } from "@/hooks/use-firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Check,
  Eye,
  EyeOff,
  FileText,
  ImageIcon,
  Loader2,
  Mail,
  Maximize2,
  Minimize2,
  Paperclip,
  Palette,
  Send,
  Sparkles,
  X,
} from "lucide-react";

type MailAttachment = {
  name: string;
  type: string;
  content: string;
};

interface EmailThemeOption {
  id: string;
  label: string;
  desc: string;
  bg: string;
  panel: string;
  panel2: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentGlow: string;
  buttonText: string;
  gradient: string;
  previewBorder: string;
}

const TEMPLATE_OPTIONS: EmailThemeOption[] = [
  {
    id: "precision",
    label: "1. Precision Gold",
    desc: "Industrial Dark & Amber Gold (Website Match)",
    bg: "#07090E",
    panel: "#0F172A",
    panel2: "#131C31",
    border: "#26334D",
    text: "#E2E8F0",
    muted: "#94A3B8",
    accent: "#F59E0B",
    accentGlow: "rgba(245, 158, 11, 0.15)",
    buttonText: "#090D16",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #FCD34D 100%)",
    previewBorder: "border-amber-500/50",
  },
  {
    id: "performance",
    label: "2. Performance Red",
    desc: "High-Energy Crimson & Flame Orange",
    bg: "#0D0406",
    panel: "#1A0A0F",
    panel2: "#260E16",
    border: "#4A1523",
    text: "#FFF1F2",
    muted: "#FCA5A5",
    accent: "#EF4444",
    accentGlow: "rgba(239, 68, 68, 0.15)",
    buttonText: "#18070A",
    gradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #F97316 100%)",
    previewBorder: "border-red-500/50",
  },
  {
    id: "trust",
    label: "3. Electric Blue",
    desc: "Tech Diagnostics Sapphire & Cyan",
    bg: "#040D1A",
    panel: "#0B192E",
    panel2: "#10233F",
    border: "#1E3A5F",
    text: "#E0F2FE",
    muted: "#93C5FD",
    accent: "#38BDF8",
    accentGlow: "rgba(56, 189, 248, 0.15)",
    buttonText: "#04111D",
    gradient: "linear-gradient(135deg, #38BDF8 0%, #0284C7 50%, #34D399 100%)",
    previewBorder: "border-sky-500/50",
  },
  {
    id: "luxury",
    label: "4. Emerald Green",
    desc: "Premium Machinery Care & Emerald",
    bg: "#03140E",
    panel: "#082119",
    panel2: "#0E3025",
    border: "#184E3D",
    text: "#ECFDF5",
    muted: "#A7F3D0",
    accent: "#10B981",
    accentGlow: "rgba(16, 185, 129, 0.15)",
    buttonText: "#03120E",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 50%, #F59E0B 100%)",
    previewBorder: "border-emerald-500/50",
  },
];

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Escapes HTML special chars for safe inline injection */
function escHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Builds the premium HTML email string for live preview using selected theme */
function buildPreviewHtml(themeId: string, subject: string, message: string, attachmentsCount: number): string {
  const theme = TEMPLATE_OPTIONS.find((t) => t.id === themeId) || TEMPLATE_OPTIONS[0];
  const safeSubject = escHtml(subject || "Your Subject Line Here");
  const safeMessage = escHtml(message || "Start typing your message to see the colorful email layout live...");

  const paragraphs = safeMessage
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 16px 0;font-size:15px;color:${theme.text};line-height:1.75;white-space:pre-wrap;">${p.trim()}</p>`)
    .join("");

  const attachBanner = attachmentsCount > 0
    ? `<div style="margin-top:20px;padding:12px 16px;background:${theme.accentGlow};border:1px solid ${theme.border};border-radius:8px;">
        <span style="color:${theme.accent};font-size:13px;font-weight:700;">📎 ${attachmentsCount} Attachment${attachmentsCount > 1 ? "s" : ""} Included</span>
       </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeSubject}</title></head>
<body style="margin:0;padding:0;background-color:${theme.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${theme.text};-webkit-font-smoothing:antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${theme.bg};padding:32px 12px;">
    <tr><td align="center">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:${theme.panel};border-radius:14px;border:1px solid ${theme.border};box-shadow:0 20px 40px rgba(0,0,0,0.6);overflow:hidden;">

        <!-- Top Accent Metallic Bar -->
        <tr><td style="height:5px;background:${theme.gradient};"></td></tr>

        <!-- Header -->
        <tr><td style="padding:32px 32px 24px;background-color:${theme.panel2};border-bottom:1px solid ${theme.border};">
          <h1 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:-0.3px;line-height:1.3;">${safeSubject}</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;background-color:${theme.panel};">
          ${paragraphs}
          ${attachBanner}
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid ${theme.border};">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#FFFFFF;">Warm Regards,</p>
            <p style="margin:0;font-size:14px;font-weight:700;color:${theme.accent};">Singh Automobiles</p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px 28px;background-color:${theme.panel2};border-top:1px solid ${theme.border};text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:800;color:#FFFFFF;letter-spacing:0.5px;">SINGH AUTOMOBILES ENGINE ENGINEERING</p>
          <p style="margin:0 0 12px;font-size:11px;color:${theme.muted};line-height:1.5;">Engine Rebuilding • Precision Diagnostics • Heavy Performance Services</p>
          <div style="padding-top:12px;border-top:1px solid ${theme.border};">
            <span style="font-size:10px;color:${theme.muted};letter-spacing:1px;text-transform:uppercase;">
              Crafted with Precision by <a href="https://asrvtech.in" target="_blank" style="color:${theme.accent};text-decoration:none;font-weight:700;">asrvtech.in</a>
            </span>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default function AdminMail() {
  const { enquiries, loading } = useEnquiries();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState("precision");
  const [attachments, setAttachments] = useState<MailAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [readingFiles, setReadingFiles] = useState(false);
  const [sent, setSent] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const enquiryOptions = useMemo(() => {
    const unique = new Map<string, string>();
    enquiries.forEach((q) => {
      if (q.email) unique.set(q.email, `${q.name} — ${q.email}`);
    });
    return Array.from(unique.entries()).map(([email, label]) => ({ email, label }));
  }, [enquiries]);

  // Live preview HTML (recomputes on theme change or input change)
  const previewHtml = useMemo(
    () => buildPreviewHtml(selectedThemeId, subject, message, attachments.length),
    [selectedThemeId, subject, message, attachments.length],
  );

  const activeTheme = TEMPLATE_OPTIONS.find((t) => t.id === selectedThemeId) || TEMPLATE_OPTIONS[0];

  const handleFiles = async (files?: FileList | null) => {
    if (!files?.length) return;
    const allowed = Array.from(files).filter(
      (f) => f.type.startsWith("image/") || f.type === "application/pdf",
    );
    if (allowed.length !== files.length) toast.error("Only images and PDFs allowed");

    const slots = 5 - attachments.length;
    const toRead = allowed.slice(0, slots);
    if (!toRead.length) { toast.error("Maximum 5 attachments"); return; }

    setReadingFiles(true);
    try {
      const next = await Promise.all(
        toRead.map(async (f) => ({ name: f.name, type: f.type, content: await readFileAsBase64(f) })),
      );
      setAttachments((prev) => [...prev, ...next]);
    } catch {
      toast.error("Failed to read file");
    } finally {
      setReadingFiles(false);
    }
  };

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!to || !subject || !message) { toast.error("To, subject, and message are required"); return; }

    setSending(true);
    try {
      const res = await fetch("/api/admin-send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, message, attachments, themeId: selectedThemeId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error || "Failed to send");
      }
      setSent(true);
      toast.success(`Mail sent successfully using ${activeTheme.label} template!`);
      setSubject(""); setMessage(""); setAttachments([]); setShowPreview(false);
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send mail");
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthGuard>
      <AdminLayout>

        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Admin Mail Center</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Send Colorful Branded Mail</h1>
          <p className="text-sm text-muted-foreground">
            Select one of the 4 colorful email templates, compose your message, and preview live before sending.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl">

          {/* ── COMPOSE FORM ── */}
          <form
            onSubmit={handleSend}
            className="xl:col-span-2 rounded-xl border border-border bg-card shadow-md overflow-hidden"
          >
            {/* Form top bar */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">New Message</p>
                <p className="text-xs text-muted-foreground">Sent via Singh Automobiles SMTP</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">SMTP Active</span>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* ── 4 TEMPLATE OPTIONS SELECTION ── */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-primary" /> Choose Email Template (4 Options)
                  </label>
                  <span className="text-xs font-medium text-primary">Selected: {activeTheme.label}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TEMPLATE_OPTIONS.map((tmpl) => {
                    const isSelected = selectedThemeId === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => setSelectedThemeId(tmpl.id)}
                        className={`relative cursor-pointer rounded-xl p-3.5 border transition-all duration-200 ${
                          isSelected
                            ? `bg-muted/80 ${tmpl.previewBorder} ring-2 ring-primary/40 shadow-md`
                            : "bg-muted/30 border-border hover:border-border/80 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            {/* Color Circle */}
                            <div
                              className="h-4 w-4 rounded-full border border-white/20 shrink-0"
                              style={{ background: tmpl.gradient }}
                            />
                            <p className="text-xs font-bold text-foreground leading-tight">{tmpl.label}</p>
                          </div>
                          {isSelected && (
                            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <Check className="h-2.5 w-2.5 text-primary-foreground stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-snug">{tmpl.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick-fill from Enquiries */}
              <div className="space-y-1.5">
                <label htmlFor="enquiryPick" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick-fill from Enquiries
                </label>
                <div className="relative">
                  <select
                    id="enquiryPick"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    disabled={loading}
                    className="h-11 w-full rounded-lg border border-input bg-background/60 px-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
                  >
                    <option value="">{loading ? "Loading..." : "— Select customer from enquiries —"}</option>
                    {enquiryOptions.map((o) => (
                      <option key={o.email} value={o.email}>{o.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">▾</div>
                </div>
              </div>

              {/* OR divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or type manually</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* To */}
              <div className="space-y-1.5">
                <label htmlFor="mailTo" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</label>
                <Input
                  id="mailTo"
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="customer@example.com"
                  className="h-11 rounded-lg bg-background/60"
                />
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label htmlFor="mailSubject" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</label>
                <Input
                  id="mailSubject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Your Engine Service Quotation from Singh Automobiles"
                  className="h-11 rounded-lg bg-background/60"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="mailMessage" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
                <Textarea
                  id="mailMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your email message here... Use blank lines between paragraphs for clean formatting."
                  className="min-h-[200px] rounded-lg bg-background/60 resize-y"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Sent as a premium colorful HTML email using the <strong>{activeTheme.label}</strong> theme.
                </p>
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Attachments
                  </label>
                  <span className="text-xs text-muted-foreground">{attachments.length}/5</span>
                </div>

                <Button asChild type="button" variant="outline" disabled={readingFiles || attachments.length >= 5} className="h-10 rounded-lg border-dashed w-full">
                  <label className="cursor-pointer gap-2 flex items-center justify-center">
                    {readingFiles ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                    {readingFiles ? "Reading files..." : "Attach Image or PDF"}
                    <input type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                  </label>
                </Button>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((att, i) => (
                      <div key={`${att.name}-${i}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 group hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {att.type === "application/pdf"
                            ? <div className="h-7 w-7 flex items-center justify-center rounded-md bg-red-500/10 border border-red-500/20 shrink-0"><FileText className="h-3.5 w-3.5 text-red-400" /></div>
                            : <div className="h-7 w-7 flex items-center justify-center rounded-md bg-primary/10 border border-primary/20 shrink-0"><ImageIcon className="h-3.5 w-3.5 text-primary" /></div>
                          }
                          <span className="text-xs font-medium truncate">{att.name}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-md opacity-50 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setAttachments((p) => p.filter((_, idx) => idx !== i))}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {to ? <span className="text-foreground font-medium">To: {to}</span> : "No recipient selected"}
              </p>
              <div className="flex items-center gap-2">
                {/* Preview Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-5 rounded-lg gap-2"
                  onClick={() => { setShowPreview((v) => !v); setFullscreen(false); }}
                >
                  {showPreview ? <><EyeOff className="h-4 w-4" /> Hide Preview</> : <><Eye className="h-4 w-4" /> Preview Email</>}
                </Button>

                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={sending || readingFiles || !to || !subject || !message}
                  className="h-11 px-8 rounded-lg font-semibold gap-2 shadow-md shadow-primary/10"
                >
                  {sending ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</>
                    : sent ? <><span>✓</span> Sent!</>
                    : <><Send className="h-4 w-4" />Send Mail</>}
                </Button>
              </div>
            </div>
          </form>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-4">
            {/* Template Info Card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Active Theme Overview
              </h3>
              <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-full" style={{ background: activeTheme.gradient }} />
                  <span className="text-xs font-bold text-foreground">{activeTheme.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{activeTheme.desc}</p>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                Tips & Guidelines
              </h3>
              <ul className="space-y-2.5">
                {[
                  "Select any of the 4 templates above to customize look",
                  "Use blank lines between paragraphs for clean layout",
                  'Click "Preview Email" to see the live iframe preview',
                  "Attach up to 5 files (images or PDFs)",
                  "Automatic customer & admin emails are also pre-styled",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[8px] text-primary font-bold">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mini preview hint */}
            {!showPreview && (
              <div
                className="rounded-xl border border-primary/20 bg-primary/5 p-4 cursor-pointer hover:bg-primary/10 transition-colors group"
                onClick={() => setShowPreview(true)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold">Live Email Preview</p>
                </div>
                {/* Tiny mockup */}
                <div className="rounded-lg overflow-hidden border border-border/40 text-[0]">
                  <div className="h-1.5" style={{ background: activeTheme.gradient }} />
                  <div className="p-3" style={{ background: activeTheme.panel }}>
                    <p className="text-[11px] font-semibold text-white truncate">{subject || "Your subject line"}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{message || "Your message preview..."}</p>
                  </div>
                  <div className="px-3 py-1.5 border-t border-slate-800" style={{ background: activeTheme.panel2 }}>
                    <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest">Singh Automobiles</p>
                  </div>
                </div>
                <p className="text-xs text-primary font-medium mt-2.5 text-center">Click to open full live preview →</p>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            LIVE EMAIL PREVIEW PANEL (below form)
        ══════════════════════════════════════════ */}
        {showPreview && (
          <div className={`mt-6 rounded-xl border border-primary/30 bg-card shadow-xl overflow-hidden ${fullscreen ? "fixed inset-3 z-50 mt-0 flex flex-col" : "max-w-7xl"}`}>

            {/* Preview Header Bar */}
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-border bg-muted/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Live Email Preview ({activeTheme.label})</p>
                  <p className="text-xs text-muted-foreground">Exact colorful HTML delivered to recipient's inbox</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {subject && (
                  <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary max-w-[180px] truncate">
                    {subject}
                  </span>
                )}
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                  title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                  onClick={() => setFullscreen((f) => !f)}>
                  {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => { setShowPreview(false); setFullscreen(false); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Metadata strip */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 px-5 py-2 bg-muted/20 border-b border-border shrink-0">
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">From:</span> Singh Automobiles
              </span>
              {to && <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">To:</span> {to}</span>}
              {subject && <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Subject:</span> {subject}</span>}
              <span className="text-xs font-medium" style={{ color: activeTheme.accent }}>
                Theme: {activeTheme.label}
              </span>
              {attachments.length > 0 && (
                <span className="text-xs text-primary font-medium">📎 {attachments.length} attachment{attachments.length > 1 ? "s" : ""}</span>
              )}
            </div>

            {/* ── THE ACTUAL EMAIL PREVIEW RENDERED IN IFRAME ── */}
            <div className={`w-full bg-[#07090E] ${fullscreen ? "flex-1" : "h-[620px]"}`}>
              <iframe
                title="Email Preview"
                srcDoc={previewHtml}
                sandbox="allow-same-origin"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}

      </AdminLayout>
    </AuthGuard>
  );
}
