import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { useEnquiries } from "@/hooks/use-firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Image, Loader2, Mail, Paperclip, Send, Sparkles, X } from "lucide-react";

type MailAttachment = {
  name: string;
  type: string;
  content: string;
};

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

export default function AdminMail() {
  const { enquiries, loading } = useEnquiries();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<MailAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [readingFiles, setReadingFiles] = useState(false);
  const [sent, setSent] = useState(false);

  const enquiryOptions = useMemo(() => {
    const unique = new Map<string, string>();
    enquiries.forEach((enquiry) => {
      if (enquiry.email) {
        unique.set(enquiry.email, `${enquiry.name} — ${enquiry.email}`);
      }
    });
    return Array.from(unique.entries()).map(([email, label]) => ({ email, label }));
  }, [enquiries]);

  const handleFiles = async (files?: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files);
    const allowed = selected.filter((file) => file.type.startsWith("image/") || file.type === "application/pdf");

    if (allowed.length !== selected.length) {
      toast.error("Only image and PDF files are allowed");
    }

    const remainingSlots = 5 - attachments.length;
    const filesToRead = allowed.slice(0, remainingSlots);

    if (filesToRead.length === 0) {
      toast.error("Maximum 5 attachments allowed");
      return;
    }

    setReadingFiles(true);
    try {
      const nextAttachments = await Promise.all(
        filesToRead.map(async (file) => ({
          name: file.name,
          type: file.type,
          content: await readFileAsBase64(file),
        })),
      );
      setAttachments((current) => [...current, ...nextAttachments]);
    } catch (error) {
      console.error("Attachment read failed:", error);
      toast.error("Failed to read attachment");
    } finally {
      setReadingFiles(false);
    }
  };

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!to || !subject || !message) {
      toast.error("Email, subject, and message are required");
      return;
    }

    setSending(true);
    setSent(false);
    try {
      const response = await fetch("/api/admin-send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, message, attachments }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to send mail");
      }

      setSent(true);
      toast.success("Mail sent successfully!");
      setSubject("");
      setMessage("");
      setAttachments([]);
      setTimeout(() => setSent(false), 4000);
    } catch (error) {
      console.error("Admin mail send failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send mail");
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthGuard>
      <AdminLayout>
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Admin Mail Center</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Send Mail
          </h1>
          <p className="text-muted-foreground text-sm">
            Compose and send beautifully formatted HTML emails to customers or any address.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-6xl">
          {/* Main Compose Form */}
          <form
            onSubmit={handleSend}
            className="xl:col-span-2 rounded-xl border border-border bg-card overflow-hidden shadow-md"
          >
            {/* Form Header */}
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

            <div className="p-6 space-y-5">
              {/* To: — Enquiry Quick-Fill */}
              <div className="space-y-2">
                <label htmlFor="enquiryEmail" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick-Fill from Enquiries
                </label>
                <div className="relative">
                  <select
                    id="enquiryEmail"
                    value={to}
                    onChange={(event) => setTo(event.target.value)}
                    className="h-11 w-full rounded-lg border border-input bg-background/50 px-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
                    disabled={loading}
                  >
                    <option value="">{loading ? "Loading enquiries..." : "— Select a customer from enquiries —"}</option>
                    {enquiryOptions.map((option) => (
                      <option key={option.email} value={option.email}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 -my-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium px-1">or type manually</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* To Email Input */}
              <div className="space-y-2">
                <label htmlFor="to" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  To
                </label>
                <Input
                  id="to"
                  type="email"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  placeholder="customer@example.com"
                  className="bg-background/50 h-11 rounded-lg border-input focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Subject
                </label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="e.g. Your Service Quotation from Singh Automobiles"
                  className="bg-background/50 h-11 rounded-lg border-input focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Message
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write your email message here... (Supports multi-paragraph formatting)"
                  className="bg-background/50 min-h-[200px] rounded-lg border-input focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-y"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  This message will be sent as a premium HTML email with Singh Automobiles branding.
                </p>
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Attachments ({attachments.length}/5)
                </label>
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  disabled={readingFiles || attachments.length >= 5}
                  className="rounded-lg h-10 border-dashed"
                >
                  <label className="cursor-pointer gap-2">
                    {readingFiles ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                    {readingFiles ? "Reading files..." : "Attach Image or PDF"}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      className="hidden"
                      onChange={(event) => handleFiles(event.target.files)}
                    />
                  </label>
                </Button>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((attachment, index) => (
                      <div
                        key={`${attachment.name}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm group hover:border-primary/30 transition-colors"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          {attachment.type === "application/pdf" ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/10 border border-red-500/20">
                              <FileText className="h-3.5 w-3.5 text-red-400" />
                            </div>
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 border border-primary/20">
                              <Image className="h-3.5 w-3.5 text-primary" />
                            </div>
                          )}
                          <span className="truncate font-medium text-xs">{attachment.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 rounded-md opacity-60 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                          onClick={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Footer / Send Button */}
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                {to ? (
                  <span className="text-foreground font-medium">To: {to}</span>
                ) : (
                  "No recipient selected"
                )}
              </p>
              <Button
                type="submit"
                disabled={sending || readingFiles || !to || !subject || !message}
                className="h-11 px-8 rounded-lg font-semibold gap-2 shadow-md shadow-primary/10 disabled:opacity-50 transition-all"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : sent ? (
                  <>
                    <span className="text-base">✓</span>
                    Mail Sent!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Mail
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Sidebar Info Panel */}
          <div className="space-y-4">
            {/* Email Preview Card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                What the recipient sees
              </h3>
              <div className="rounded-lg overflow-hidden border border-border">
                {/* Mini Email Preview */}
                <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300" />
                <div className="bg-[#0F172A] p-3">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Singh Automobiles</span>
                  </div>
                  <p className="text-[11px] text-white font-semibold mb-1 truncate">
                    {subject || "Your subject line"}
                  </p>
                  <p className="text-[10px] text-slate-400 line-clamp-3 leading-relaxed">
                    {message || "Your message will appear here with premium HTML formatting..."}
                  </p>
                </div>
                <div className="bg-[#0B1120] px-3 py-2 border-t border-slate-800">
                  <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest">Singh Automobiles Engine Engineering</p>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Email Tips
              </h3>
              <ul className="space-y-2.5">
                {[
                  "Use paragraph breaks for clean formatting",
                  "Emails send with professional HTML design",
                  "Attach up to 5 files (images or PDFs)",
                  "Reply-To is set to admin by default",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-[8px] text-primary font-bold">✓</span>
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/30 border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{enquiryOptions.length}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">Customers</p>
                </div>
                <div className="rounded-lg bg-muted/30 border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{attachments.length}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">Attachments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
