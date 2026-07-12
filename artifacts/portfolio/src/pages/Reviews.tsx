import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useReviews } from "@/hooks/use-firestore";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, MessageSquare, Star } from "lucide-react";
import { format } from "date-fns";

function formatReviewDate(value: any) {
  if (!value) return "";
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : format(date, "MMM dd, yyyy");
}

function RatingStars({
  rating,
  onChange,
  interactive = false,
}: {
  rating: number;
  onChange?: (rating: number) => void;
  interactive?: boolean;
}) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} star rating`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        const Icon = (
          <Star
            className={`h-5 w-5 ${filled ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
        );

        if (!interactive) return <span key={star}>{Icon}</span>;

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="grid h-10 w-10 place-items-center rounded-sm border border-border hover:bg-muted"
            aria-label={`Set ${star} star rating`}
          >
            {Icon}
          </button>
        );
      })}
    </div>
  );
}

export default function Reviews() {
  const { reviews, loading, refetch } = useReviews();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      toast.error("Please enter your name and review description");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        name: name.trim(),
        rating,
        description: description.trim(),
        createdAt: serverTimestamp(),
      });

      toast.success("Thank you for your review");
      setName("");
      setDescription("");
      setRating(5);
      refetch();
    } catch (error) {
      console.error("Review submit error:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="bg-card border-b border-border pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Reviews.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Share your experience and read what customers say about our service.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-sm p-5 sm:p-6 space-y-5 h-fit">
            <h2 className="text-2xl font-bold">Add Your Review</h2>

            <div className="space-y-2">
              <label htmlFor="review-name" className="text-sm font-medium">Name *</label>
              <Input
                id="review-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="bg-background h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Star Rating *</label>
              <RatingStars rating={rating} onChange={setRating} interactive />
            </div>

            <div className="space-y-2">
              <label htmlFor="review-description" className="text-sm font-medium">Description *</label>
              <Textarea
                id="review-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your experience..."
                required
                className="bg-background min-h-[140px] resize-y"
              />
            </div>

            <Button type="submit" className="w-full h-12" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
              ) : (
                "Submit Review"
              )}
            </Button>
          </form>

          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-card border border-border border-dashed p-12 flex flex-col items-center justify-center text-center rounded-sm">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">No reviews yet. Be the first to share your experience.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {reviews.map((review) => (
                  <article key={review.id} className="bg-card border border-border rounded-sm p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-xl font-bold break-words">{review.name}</h2>
                        {formatReviewDate(review.createdAt) && (
                          <p className="text-sm text-muted-foreground mt-1">{formatReviewDate(review.createdAt)}</p>
                        )}
                      </div>
                      <RatingStars rating={review.rating} />
                    </div>
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
                      {review.description}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
