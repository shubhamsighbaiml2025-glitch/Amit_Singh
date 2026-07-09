import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { useEnquiries } from "@/hooks/use-firestore";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { format } from "date-fns";
import { Loader2, Mail, Phone, Calendar, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminEnquiries() {
  const { enquiries, loading, refetch } = useEnquiries();
  const [deleting, setDeleting] = useState<string | null>(null);

  const formatSubmittedAt = (submittedAt: any) => {
    if (!submittedAt) return "Unknown date";
    const date =
      typeof submittedAt.toDate === "function"
        ? submittedAt.toDate()
        : new Date(submittedAt);

    return Number.isNaN(date.getTime()) ? "Unknown date" : format(date, "MMM dd, yyyy HH:mm");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "enquiries", id));
      refetch();
      toast.success("Enquiry deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete enquiry");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Enquiries</h1>
          <p className="text-muted-foreground">
            Messages submitted through your website's contact form.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : enquiries.length === 0 ? (
          <div className="bg-card border border-border border-dashed p-12 text-center rounded-sm">
            <p className="text-muted-foreground">No enquiries received yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {enquiries.map((enq) => (
              <div
                key={enq.id}
                className="bg-card border border-border rounded-sm overflow-hidden flex flex-col"
              >
                {/* Header info */}
                <div className="bg-muted/50 p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-primary" />
                      <span className="font-bold">{enq.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail size={14} />
                      <a
                        href={`mailto:${enq.email}`}
                        className="hover:text-foreground transition-colors"
                      >
                        {enq.email}
                      </a>
                    </div>

                    {enq.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone size={14} />
                        <a
                          href={`tel:${enq.phone}`}
                          className="hover:text-foreground transition-colors"
                        >
                          {enq.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded border border-border w-fit">
                      <Calendar size={12} />
                      {formatSubmittedAt(enq.submittedAt)}
                    </div>

                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      disabled={deleting === enq.id}
                      onClick={() => handleDelete(enq.id)}
                      title="Delete enquiry"
                    >
                      {deleting === enq.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Message body */}
                <div className="p-6">
                  <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed text-sm md:text-base">
                    {enq.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </AuthGuard>
  );
}
