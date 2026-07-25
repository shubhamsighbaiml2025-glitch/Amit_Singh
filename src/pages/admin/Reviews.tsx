import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useReviews, type Review } from "@/hooks/use-firestore";
import { db } from "@/lib/firebase";
import { deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { format } from "date-fns";
import { toast } from "sonner";
import { Edit3, Loader2, Mail, MessageSquare, Save, Star, Trash2, X } from "lucide-react";

function formatReviewDate(value: any) {
  if (!value) return "Unknown date";
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown date" : format(date, "MMM dd, yyyy HH:mm");
}

function StarButtons({
  rating,
  onChange,
  disabled = false,
}: {
  rating: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const icon = (
          <Star
            className={`h-5 w-5 ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
        );

        if (!onChange) return <span key={star}>{icon}</span>;

        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className="grid h-10 w-10 place-items-center rounded-sm border border-border hover:bg-muted disabled:opacity-60"
            aria-label={`Set ${star} star rating`}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}

export default function AdminReviews() {
  const { reviews, loading, refetch } = useReviews();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", email: "", rating: 5, description: "" });

  const beginEdit = (review: Review) => {
    setEditingId(review.id);
    setDraft({
      name: review.name,
      email: review.email || "",
      rating: review.rating,
      description: review.description,
    });
  };

  const handleSave = async (id: string) => {
    if (!draft.name.trim() || !draft.description.trim()) {
      toast.error("Name and description are required");
      return;
    }

    setSavingId(id);
    try {
      await updateDoc(doc(db, "reviews", id), {
        name: draft.name.trim(),
        email: draft.email.trim(),
        rating: draft.rating,
        description: draft.description.trim(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Review updated");
      setEditingId(null);
      refetch();
    } catch (error) {
      console.error("Review update error:", error);
      toast.error("Failed to update review");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "reviews", id));
      toast.success("Review deleted");
      refetch();
    } catch (error) {
      console.error("Review delete error:", error);
      toast.error("Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Reviews</h1>
          <p className="text-muted-foreground">Edit or delete customer reviews submitted through the website.</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-card border border-border border-dashed p-12 flex flex-col items-center justify-center text-center rounded-sm">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">No reviews submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {reviews.map((review) => {
              const editing = editingId === review.id;
              const busy = savingId === review.id || deletingId === review.id;

              return (
                <div key={review.id} className="bg-card border border-border rounded-sm overflow-hidden">
                  <div className="bg-muted/50 p-4 border-b border-border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="text-xs font-mono text-muted-foreground mb-2">
                        {formatReviewDate(review.createdAt)}
                      </div>
                      {editing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            value={draft.name}
                            onChange={(e) => setDraft((current) => ({ ...current, name: e.target.value }))}
                            className="bg-background h-11"
                            placeholder="Reviewer name"
                          />
                          <Input
                            type="email"
                            value={draft.email}
                            onChange={(e) => setDraft((current) => ({ ...current, email: e.target.value }))}
                            className="bg-background h-11"
                            placeholder="Reviewer email"
                          />
                        </div>
                      ) : (
                        <div>
                          <h2 className="text-xl font-bold break-words">{review.name}</h2>
                          {review.email && (
                            <a
                              href={`mailto:${review.email}`}
                              className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors break-all"
                            >
                              <Mail className="h-4 w-4 shrink-0" />
                              {review.email}
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {editing ? (
                        <StarButtons
                          rating={draft.rating}
                          onChange={(rating) => setDraft((current) => ({ ...current, rating }))}
                          disabled={busy}
                        />
                      ) : (
                        <StarButtons rating={review.rating} />
                      )}

                      {editing ? (
                        <>
                          <Button
                            onClick={() => handleSave(review.id)}
                            disabled={busy}
                            className="h-11"
                          >
                            {savingId === review.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            disabled={busy}
                            className="h-11"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => beginEdit(review)}
                            className="h-11"
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => handleDelete(review.id)}
                            disabled={busy}
                            className="h-11"
                          >
                            {deletingId === review.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    {editing ? (
                      <Textarea
                        value={draft.description}
                        onChange={(e) => setDraft((current) => ({ ...current, description: e.target.value }))}
                        className="bg-background min-h-[140px] resize-y"
                        placeholder="Review description"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-foreground/90 leading-relaxed">
                        {review.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminLayout>
    </AuthGuard>
  );
}
