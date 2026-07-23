import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { useEnquiries } from "@/hooks/use-firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Loader2, Mail, Paperclip, Send, X } from "lucide-react";

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

  const enquiryOptions = useMemo(() => {
    const unique = new Map<string, string>();
    enquiries.forEach((enquiry) => {
      if (enquiry.email) {
        unique.set(enquiry.email, `${enquiry.name} - ${enquiry.email}`);
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

      toast.success("Mail sent successfully");
      setSubject("");
      setMessage("");
      setAttachments([]);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Send Mail</h1>
          <p className="text-muted-foreground">
            Send email to any address or choose a customer from website enquiries.
          </p>
        </div>

        <form onSubmit={handleSend} className="max-w-3xl space-y-6 bg-card border border-border p-6 rounded-sm">
          <div className="space-y-2">
            <label htmlFor="enquiryEmail" className="text-sm font-medium">
              Choose From Enquiries
            </label>
            <select
              id="enquiryEmail"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="h-12 w-full rounded-sm border border-input bg-background px-3 text-sm"
              disabled={loading}
            >
              <option value="">{loading ? "Loading enquiries..." : "Select enquiry email"}</option>
              {enquiryOptions.map((option) => (
                <option key={option.email} value={option.email}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="to" className="text-sm font-medium">
              Or Type Email
            </label>
            <Input
              id="to"
              type="email"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="customer@example.com"
              className="bg-background h-12"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <Input
              id="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Service quotation"
              className="bg-background h-12"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write your mail message..."
              className="bg-background min-h-[180px]"
            />
            <p className="text-xs text-muted-foreground">
              Every sent mail automatically ends with: build by asrvtech.in
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild type="button" variant="outline" disabled={readingFiles || attachments.length >= 5}>
              <label className="cursor-pointer">
                {readingFiles ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Paperclip className="mr-2 h-4 w-4" />}
                Attach Image or PDF
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
                  <div key={`${attachment.name}-${index}`} className="flex items-center justify-between gap-3 rounded-sm border border-border bg-background px-3 py-2 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      {attachment.type === "application/pdf" ? <FileText className="h-4 w-4 text-primary" /> : <Mail className="h-4 w-4 text-primary" />}
                      <span className="truncate">{attachment.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={sending || readingFiles} className="h-12 px-8">
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Mail
          </Button>
        </form>
      </AdminLayout>
    </AuthGuard>
  );
}
