import { AdminLayout } from "@/components/AdminLayout";
import { AuthGuard } from "@/components/AuthGuard";
import {
  useEnquiries,
  useGallery,
  useSiteContent,
} from "@/hooks/use-firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquare, Image as ImageIcon, FileText, Upload } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { enquiries, loading: enqLoading } = useEnquiries();
  const { images, loading: galLoading } = useGallery();
  const { content, loading: contentLoading } = useSiteContent();
  const needsInitialPhotos =
    !contentLoading &&
    (!content?.heroImageUrl ||
      content.heroImageUrl.startsWith("/assets/") ||
      !content?.engineImageUrl ||
      content.engineImageUrl.startsWith("/assets/") ||
      !content?.profileImageUrl ||
      content.profileImageUrl.startsWith("/assets/"));

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your portfolio site.
          </p>
        </div>

        {needsInitialPhotos && (
          <Alert className="mb-8 border-primary/40 bg-primary/5">
            <Upload className="h-4 w-4" />
            <AlertTitle>First time setup required</AlertTitle>
            <AlertDescription className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <span>
                Upload the home background photo, engine photo, and Amit Singh profile photo. Images are uploaded to Cloudinary and saved in Firebase.
              </span>
              <Button asChild size="sm" className="shrink-0">
                <Link href="/admin/content">Upload Photos</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/enquiries">
            <Card className="hover:border-primary transition-colors cursor-pointer bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Enquiries
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {enqLoading ? "..." : enquiries.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Submitted via contact form
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/gallery">
            <Card className="hover:border-primary transition-colors cursor-pointer bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Gallery Images
                </CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {galLoading ? "..." : images.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Live on the website
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/content">
            <Card className="hover:border-primary transition-colors cursor-pointer bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Services Listed
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {contentLoading ? "..." : content?.servicesList.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active service categories
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
