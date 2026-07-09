import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { DEFAULT_CONTENT, useSiteContent, SiteContent } from "@/hooks/use-firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ImagePlus, Loader2, Plus, Trash2, Upload } from "lucide-react";

export default function AdminContent() {
  const { content, loading: initialLoading } = useSiteContent();
  const [formData, setFormData] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<"heroImageUrl" | "engineImageUrl" | "profileImageUrl" | null>(null);

  useEffect(() => {
    if (content) {
      setFormData({ ...DEFAULT_CONTENT, ...content });
    }
  }, [content]);

  const getSaveableContent = (contentToSave: SiteContent): SiteContent => ({
    heroTitle: contentToSave.heroTitle || DEFAULT_CONTENT.heroTitle,
    heroSubtitle: contentToSave.heroSubtitle || DEFAULT_CONTENT.heroSubtitle,
    heroImageUrl: contentToSave.heroImageUrl || DEFAULT_CONTENT.heroImageUrl,
    engineImageUrl: contentToSave.engineImageUrl || DEFAULT_CONTENT.engineImageUrl,
    profileImageUrl: contentToSave.profileImageUrl || DEFAULT_CONTENT.profileImageUrl,
    aboutText: contentToSave.aboutText || DEFAULT_CONTENT.aboutText,
    servicesList: (contentToSave.servicesList || DEFAULT_CONTENT.servicesList).map((service) => ({
      title: service.title || "",
      description: service.description || "",
    })),
  });

  const saveContent = async (contentToSave: SiteContent) => {
    const saveableContent = getSaveableContent(contentToSave);
    const response = await fetch("/api/save-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: saveableContent }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      try {
        await setDoc(doc(db, "content", "site"), saveableContent, { merge: true });
        return;
      } catch (clientError) {
        const apiMessage = data?.error || "API save failed";
        const clientMessage = clientError instanceof Error ? clientError.message : "Browser save failed";
        throw new Error(`${apiMessage}. Browser fallback also failed: ${clientMessage}`);
      }
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      await saveContent(formData);
      toast.success("Content saved successfully");
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      servicesList: [...formData.servicesList, { title: "", description: "" }]
    });
  };

  const handleRemoveService = (index: number) => {
    if (!formData) return;
    const newServices = [...formData.servicesList];
    newServices.splice(index, 1);
    setFormData({ ...formData, servicesList: newServices });
  };

  const handleServiceChange = (index: number, field: 'title' | 'description', value: string) => {
    if (!formData) return;
    const newServices = [...formData.servicesList];
    newServices[index] = { ...newServices[index], [field]: value };
    setFormData({ ...formData, servicesList: newServices });
  };

  const handleImageUpload = async (
    field: "heroImageUrl" | "engineImageUrl" | "profileImageUrl",
    file?: File,
  ) => {
    if (!formData || !file) return;
    setUploadingField(field);
    try {
      const url = await uploadToCloudinary(file);
      const updatedContent = { ...formData, [field]: url };
      setFormData(updatedContent);
      await saveContent(updatedContent);
      toast.success("Image uploaded and saved");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploadingField(null);
    }
  };

  if (initialLoading || !formData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Site Content</h1>
            <p className="text-muted-foreground">Manage text and services across your website.</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="hidden sm:inline-flex">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>

        <div className="space-y-6 md:space-y-8 max-w-4xl pb-28 sm:pb-16">
          {/* Images */}
          <div className="bg-card border border-border p-4 sm:p-6 rounded-sm space-y-6">
            <h2 className="text-lg sm:text-xl font-bold border-b border-border pb-4">Website Photos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Home Background Photo</label>
                  <p className="text-xs text-muted-foreground mt-1">Updates the main photo on the homepage.</p>
                </div>
                <div className="aspect-video bg-background border border-border rounded-sm overflow-hidden">
                  <img
                    src={formData.heroImageUrl || "/assets/hero.jpg"}
                    alt="Home background preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button asChild variant="outline" className="w-full min-h-11" disabled={uploadingField !== null}>
                  <label className="cursor-pointer justify-center">
                    {uploadingField === "heroImageUrl" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Home Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload("heroImageUrl", e.target.files?.[0])}
                    />
                  </label>
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Profile Photo</label>
                  <p className="text-xs text-muted-foreground mt-1">Updates Amit Singh's photo across the website.</p>
                </div>
                <div className="aspect-[3/4] bg-background border border-border rounded-sm overflow-hidden max-h-72">
                  <img
                    src={formData.profileImageUrl || "/assets/amit-singh.jpg"}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button asChild variant="outline" className="w-full min-h-11" disabled={uploadingField !== null}>
                  <label className="cursor-pointer justify-center">
                    {uploadingField === "profileImageUrl" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="mr-2 h-4 w-4" />
                    )}
                    Upload Profile Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload("profileImageUrl", e.target.files?.[0])}
                    />
                  </label>
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Engine Photo</label>
                  <p className="text-xs text-muted-foreground mt-1">Updates the engine repair photo on the homepage.</p>
                </div>
                <div className="aspect-square bg-background border border-border rounded-sm overflow-hidden">
                  <img
                    src={formData.engineImageUrl || "/assets/services.jpg"}
                    alt="Engine repair preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button asChild variant="outline" className="w-full min-h-11" disabled={uploadingField !== null}>
                  <label className="cursor-pointer justify-center">
                    {uploadingField === "engineImageUrl" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="mr-2 h-4 w-4" />
                    )}
                    Upload Engine Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload("engineImageUrl", e.target.files?.[0])}
                    />
                  </label>
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-card border border-border p-4 sm:p-6 rounded-sm space-y-6">
            <h2 className="text-lg sm:text-xl font-bold border-b border-border pb-4">Hero Section (Home)</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hero Title</label>
                <Input 
                  value={formData.heroTitle}
                  onChange={e => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="bg-background font-bold text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hero Subtitle</label>
                <Textarea 
                  value={formData.heroSubtitle}
                  onChange={e => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="bg-background min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-card border border-border p-4 sm:p-6 rounded-sm space-y-6">
            <h2 className="text-lg sm:text-xl font-bold border-b border-border pb-4">About Section</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">About Text (Paragraphs separated by blank lines)</label>
                <Textarea 
                  value={formData.aboutText}
                  onChange={e => setFormData({ ...formData, aboutText: e.target.value })}
                  className="bg-background min-h-[250px]"
                />
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-card border border-border p-4 sm:p-6 rounded-sm space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
              <h2 className="text-lg sm:text-xl font-bold">Services List</h2>
              <Button size="sm" variant="outline" onClick={handleAddService} className="min-h-11 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" /> Add Service
              </Button>
            </div>
            
            <div className="space-y-6">
              {formData.servicesList.map((service, index) => (
                <div key={index} className="flex flex-col gap-4 p-4 border border-border bg-background rounded-sm relative group sm:flex-row">
                  <div className="flex-1 space-y-4">
                    <Input 
                      placeholder="Service Title"
                      value={service.title}
                      onChange={e => handleServiceChange(index, 'title', e.target.value)}
                      className="font-bold"
                    />
                    <Textarea 
                      placeholder="Service Description"
                      value={service.description}
                      onChange={e => handleServiceChange(index, 'description', e.target.value)}
                      className="h-24 resize-none"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 shrink-0 h-11 w-full sm:w-11"
                    onClick={() => handleRemoveService(index)}
                    aria-label={`Delete service ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur sm:hidden">
          <Button onClick={handleSave} disabled={saving} className="h-12 w-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
