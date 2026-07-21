import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { useVideos } from "@/hooks/use-firestore";
import { addVideo, deleteVideo } from "@/lib/admin-api";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, PlaySquare, Trash2, Upload } from "lucide-react";

export default function AdminVideos() {
  const { videos, loading, refetch } = useVideos();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, "video");
      try {
        await addVideo(url, title);
      } catch (apiError) {
        await addDoc(collection(db, "videos"), {
          url,
          title,
          createdAt: serverTimestamp(),
        }).catch((clientError) => {
          const apiMessage = apiError instanceof Error ? apiError.message : "API video save failed";
          const clientMessage = clientError instanceof Error ? clientError.message : "Browser video save failed";
          throw new Error(`${apiMessage}. Browser fallback also failed: ${clientMessage}`);
        });
      }

      toast.success("Video uploaded successfully");
      setFile(null);
      setTitle("");
      const input = document.getElementById("video-upload") as HTMLInputElement;
      if (input) input.value = "";
      refetch();
    } catch (error) {
      console.error("Video upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      try {
        await deleteVideo(id);
      } catch (apiError) {
        await deleteDoc(doc(db, "videos", id)).catch((clientError) => {
          const apiMessage = apiError instanceof Error ? apiError.message : "API delete failed";
          const clientMessage = clientError instanceof Error ? clientError.message : "Browser delete failed";
          throw new Error(`${apiMessage}. Browser fallback also failed: ${clientMessage}`);
        });
      }
      toast.success("Video deleted");
      refetch();
    } catch (error) {
      console.error("Video delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete video");
    }
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Video Management</h1>
          <p className="text-muted-foreground">Upload and manage videos shown on the website.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <form onSubmit={handleUpload} className="bg-card border border-border p-4 sm:p-6 rounded-sm space-y-4 lg:sticky lg:top-6">
              <h2 className="text-lg sm:text-xl font-bold border-b border-border pb-4">Add New Video</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Video</label>
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="bg-background cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title (Optional)</label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Engine repair walkthrough"
                  className="bg-background"
                />
              </div>

              <Button type="submit" className="w-full min-h-11" disabled={!file || uploading}>
                {uploading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> Upload Video</>
                )}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : videos.length === 0 ? (
              <div className="bg-card border border-border border-dashed p-12 flex flex-col items-center justify-center text-center rounded-sm">
                <PlaySquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">No videos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((video) => (
                  <div key={video.id} className="bg-card border border-border rounded-sm overflow-hidden">
                    <video src={video.url} controls preload="metadata" className="aspect-video w-full bg-black object-contain" />
                    <div className="flex items-center justify-between gap-3 p-3">
                      <p className="min-w-0 truncate text-sm font-medium">{video.title || "Uploaded video"}</p>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(video.id)}
                        className="h-11 w-11 shrink-0"
                        aria-label="Delete video"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
