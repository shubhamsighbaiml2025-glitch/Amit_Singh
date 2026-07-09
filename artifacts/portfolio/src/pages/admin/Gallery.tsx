import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { useGallery } from "@/hooks/use-firestore";
import { addGalleryImage, deleteGalleryImage } from "@/lib/admin-api";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, ImageIcon } from "lucide-react";

export default function AdminGallery() {
  const { images, loading, refetch } = useGallery();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      try {
        await addGalleryImage(url, caption);
      } catch (apiError) {
        await addDoc(collection(db, "gallery"), {
          url,
          caption,
          createdAt: serverTimestamp(),
        }).catch((clientError) => {
          const apiMessage = apiError instanceof Error ? apiError.message : "API gallery save failed";
          const clientMessage = clientError instanceof Error ? clientError.message : "Browser gallery save failed";
          throw new Error(`${apiMessage}. Browser fallback also failed: ${clientMessage}`);
        });
      }

      toast.success("Image uploaded successfully");
      setFile(null);
      setCaption("");
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      refetch();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      try {
        await deleteGalleryImage(id);
      } catch (apiError) {
        await deleteDoc(doc(db, "gallery", id)).catch((clientError) => {
          const apiMessage = apiError instanceof Error ? apiError.message : "API delete failed";
          const clientMessage = clientError instanceof Error ? clientError.message : "Browser delete failed";
          throw new Error(`${apiMessage}. Browser fallback also failed: ${clientMessage}`);
        });
      }
      toast.success("Image deleted");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete image");
    }
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gallery Management</h1>
          <p className="text-muted-foreground">Upload and manage photos of your work.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleUpload} className="bg-card border border-border p-6 rounded-sm space-y-4 sticky top-6">
              <h2 className="text-xl font-bold border-b border-border pb-4">Add New Image</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Image</label>
                <Input 
                  id="file-upload"
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  required
                  className="bg-background cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Caption (Optional)</label>
                <Input 
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="e.g. Volvo Excavator Engine Rebuild"
                  className="bg-background"
                />
              </div>

              <Button type="submit" className="w-full" disabled={!file || uploading}>
                {uploading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> Upload Image</>
                )}
              </Button>
            </form>
          </div>

          {/* Gallery Grid */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : images.length === 0 ? (
              <div className="bg-card border border-border border-dashed p-12 flex flex-col items-center justify-center text-center rounded-sm">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">No images in the gallery yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="group relative bg-muted rounded-sm overflow-hidden border border-border aspect-square">
                    <img 
                      src={img.url} 
                      alt={img.caption || "Gallery item"} 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay controls */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                      <div className="flex justify-end">
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleDelete(img.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {img.caption && (
                        <p className="text-white text-sm font-medium bg-black/40 p-2 rounded truncate backdrop-blur-sm">
                          {img.caption}
                        </p>
                      )}
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
